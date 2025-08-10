const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function initSchema() {
  const session = driver.session();
  try {
    const schemaPath = path.join(__dirname, 'schema.cypher');
    const raw = fs.readFileSync(schemaPath, 'utf-8');
    // Build statements by splitting on semicolons that are not inside single quotes
    const statements = [];
    let current = '';
    let inSingle = false;
    let prevChar = '';
    const lines = raw.split(/\r?\n/);
    for (let line of lines) {
      const trimmed = line.trim();
      // Skip full-line comments
      if (trimmed.startsWith('//') || trimmed.length === 0) continue;
      // Remove inline comments starting with // that are not inside quotes
      let processed = '';
      let i = 0;
      let localInSingle = inSingle;
      while (i < line.length) {
        const ch = line[i];
        const nextTwo = line.slice(i, i + 2);
        if (!localInSingle && nextTwo === '//') {
          break; // drop rest of line
        }
        if (ch === "'" && prevChar !== '\\') {
          localInSingle = !localInSingle;
        }
        processed += ch;
        prevChar = ch;
        i += 1;
      }
      // Now split by semicolons outside quotes
      for (let j = 0; j < processed.length; j++) {
        const ch = processed[j];
        if (ch === "'" && processed[j - 1] !== '\\') {
          inSingle = !inSingle;
          current += ch;
          continue;
        }
        if (ch === ';' && !inSingle) {
          if (current.trim().length > 0) statements.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      current += '\n';
    }
    if (current.trim().length > 0) statements.push(current.trim());
    for (const stmt of statements) {
      await session.run(stmt);
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