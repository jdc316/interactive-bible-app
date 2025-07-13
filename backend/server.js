const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const neo4jGraphQL = require('./graphql/schema');  // Now a function
const esvService = require('./services/esvService');
const neo4j = require('neo4j-driver');
const rateLimit = require('express-rate-limit');
const redis = require('redis');
require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const app = express();

// Rate limiting: 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
}));

// Middleware for logging or other (optional)
app.use(express.json());

// REST Endpoints

// GET /api/v1/verses - Retrieve verse by reference with dynamic text fetch and caching
app.get('/api/v1/verses', async (req, res) => {
  const { reference, translation = 'esv' } = req.query;
  if (!reference) return res.status(400).json({ error: 'Reference is required' });

  const cacheKey = `verse:${reference}:${translation}`;
  let session;
  try {
    let cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    session = driver.session();
    const result = await session.run(
      `MATCH (v:Verse {reference: $reference}) RETURN v`,
      { reference }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Verse not found' });
    }

    const verse = result.records[0].get('v').properties;
    verse.text = await esvService.getVerseText(reference);  // Dynamic ESV fetch

    // Cache for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(verse), { EX: 3600 });

    res.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (session) await session.close();
  }
});

// GET /api/v1/connections - Fetch cross-references for a verse
app.get('/api/v1/connections', async (req, res) => {
  const { verse_id, depth = 2, type } = req.query;
  if (!verse_id) return res.status(400).json({ error: 'verse_id is required' });

  let session;
  try {
    session = driver.session();
    let query = `MATCH (v:Verse {id: $verse_id})-[r:REFERENCES*1..$depth]-(connected:Verse) RETURN DISTINCT {nodes: collect(v) + collect(connected), edges: collect(r)} AS graph LIMIT 5000`;
    if (type) query = query.replace('REFERENCES', `REFERENCES {type: $type}`);

    const result = await session.run(query, { verse_id, depth: parseInt(depth), type });
    const graph = result.records[0]?.get('graph') || { nodes: [], edges: [] };
    res.json(graph);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (session) await session.close();
  }
});

// GET /api/v1/subgraphs - Generate pruned subgraph by filters
app.get('/api/v1/subgraphs', async (req, res) => {
  const { filters } = req.query;  // JSON string e.g., {book: "Genesis", type: "cross-reference"}
  let parsedFilters;
  try {
    parsedFilters = JSON.parse(filters);
  } catch {
    return res.status(400).json({ error: 'Invalid filters JSON' });
  }

  let session;
  try {
    session = driver.session();
    let query = `MATCH (v:Verse) WHERE true `;
    const params = {};
    if (parsedFilters.book) {
      query += `AND EXISTS { MATCH (v)<-[:HAS_VERSE]-(:Chapter)<-[:HAS_CHAPTER]-(b:Book {name: $book}) } `;
      params.book = parsedFilters.book;
    }
    if (parsedFilters.type) {
      query += `WITH v MATCH (v)-[r:REFERENCES {type: $type}]-(connected:Verse) `;
      params.type = parsedFilters.type;
    } else {
      query += `WITH v MATCH (v)-[r:REFERENCES]-(connected:Verse) `;
    }
    query += `RETURN DISTINCT {nodes: collect(v) + collect(connected), edges: collect(r)} AS graph LIMIT 5000`;

    const result = await session.run(query, params);
    const graph = result.records[0]?.get('graph') || { nodes: [], edges: [] };
    res.json(graph);
  } catch (error) {
    console.error('Error fetching subgraph:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (session) await session.close();
  }
});

// GET /api/v1/analysis - Compute graph stats (e.g., hubs)
app.get('/api/v1/analysis', async (req, res) => {
  const { metric = 'centrality' } = req.query;

  let session;
  try {
    session = driver.session();
    // Assuming precomputed centrality
    const result = await session.run(
      `MATCH (v:Verse) RETURN v.reference AS verse, v.metadata.centrality_score AS score ORDER BY score DESC LIMIT 10`
    );
    const hubs = result.records.map(rec => ({ verse: rec.get('verse'), score: rec.get('score') }));
    res.json({ hubs });
  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (session) await session.close();
  }
});

// GraphQL Integration
(async () => {
  try {
    const neo4jGraphQL = neoSchema(driver);  // Pass driver here
    const schema = await neo4jGraphQL.getSchema();
    const apolloServer = new ApolloServer({
      schema,
      context: { driver, esvService }
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    app.listen(3001, () => {
      console.log('Server running on http://localhost:3001');
      console.log('GraphQL at http://localhost:3001/graphql');
    });
  } catch (error) {
    console.error('Error starting GraphQL server:', error);
    process.exit(1);  // Exit with error if GraphQL fails
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    await driver.close();
    await redisClient.quit();
  } catch (error) {
    console.error('Shutdown error:', error);
  }
  process.exit(0);
});