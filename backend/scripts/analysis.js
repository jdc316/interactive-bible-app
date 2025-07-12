const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));

async function runAnalysis() {
  const session = driver.session();
  try {
    await session.run(`CALL gds.graph.project('bibleGraph', 'Verse', 'REFERENCES')`);

    await session.run(
      `CALL gds.pageRank.write('bibleGraph', { writeProperty: 'centrality' })`
    );

    await session.run(
      `MATCH (v:Verse) SET v.metadata.centrality_score = v.centrality RETURN count(v)`
    );
    console.log('Analysis complete.');
  } finally {
    await session.run(`CALL gds.graph.drop('bibleGraph')`);
    session.close();
  }
}

runAnalysis().then(() => driver.close());