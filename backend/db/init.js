const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path'); // Add path module for cross-platform paths
require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));

async function initSchema() {
  const session = driver.session();
  try {
    // Use path.join for correct directory resolution
    const schemaPath = path.join(__dirname, 'schema.cypher');
    const schemaCommands = fs.readFileSync(schemaPath, 'utf-8').split(';').filter(cmd => cmd.trim());
    for (const cmd of schemaCommands) {
      await session.run(cmd);
    }
    console.log('Schema initialized.');
  } catch (error) {
    console.error('Schema Error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

initSchema();