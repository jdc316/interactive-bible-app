const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));

async function optimizeQueries() {
  const session = driver.session();
  try {
    // Profile example query
    const result = await session.run(`PROFILE MATCH (v:Verse {reference: 'Gen.1.1'}) RETURN v`);
    console.log('Query Profile:', result.summary.profile);  // Analyze for optimizations

    // If needed, add dynamic indexes based on profile (e.g., if missing)
    // await session.run(`CREATE INDEX IF NOT EXISTS FOR (v:Verse) ON (v.metadata.centrality_score)`);
  } finally {
    session.close();
  }
}

optimizeQueries().then(() => driver.close());