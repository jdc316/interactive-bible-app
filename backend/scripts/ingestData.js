const neo4j = require('neo4j-driver');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD));

async function downloadCrossRefs() {
  const url = 'https://a.openbible.info/data/cross-references.zip';
  const zipPath = 'cross-references.zip';
  const writer = fs.createWriteStream(zipPath);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  // Unzip manually or add unzip logic
}

async function ingestBibleStructure() {
  const structure = JSON.parse(fs.readFileSync('bible_structure.json'));
  const session = driver.session();
  try {
    for (const book of structure.books) {
      const bookRes = await session.run(
        `CREATE (b:Book {id: apoc.uuid.generate(), name: $name, testament: $testament, order: $order}) RETURN b.id AS id`,
        book
      );
      const bookId = bookRes.records[0].get('id');

      for (const chapter of book.chapters) {
        const chRes = await session.run(
          `CREATE (c:Chapter {id: apoc.uuid.generate(), number: $number, bookId: $bookId}) RETURN c.id AS id`,
          { number: chapter.number, bookId }
        );
        const chapterId = chRes.records[0].get('id');

        const verseBatches = chunk(chapter.verses, 1000);
        for (const batch of verseBatches) {
          await session.run(
            `UNWIND $verses AS v
             CREATE (verse:Verse {id: apoc.uuid.generate(), reference: v.reference, chapterId: $chapterId, number: v.number, texts: {}, metadata: {}})
             WITH verse, $chapterId AS chId
             MATCH (c:Chapter {id: chId})
             CREATE (c)-[:HAS_VERSE]->(verse)`,
            { verses: batch.map(v => ({ reference: v.reference, number: parseInt(v.reference.split('.')[2]) })), chapterId }
          );
        }
      }
    }
  } finally {
    session.close();
  }
}

async function ingestCrossRefs() {
  const refs = JSON.parse(fs.readFileSync('validated_cross_refs.json'));
  const session = driver.session();
  try {
    const refBatches = chunk(refs, 1000);
    let maxVotes = Math.max(...refs.map(r => r.votes));  // Normalize
    for (const batch of refBatches) {
      await session.run(
        `UNWIND $refs AS r
         MATCH (from:Verse {reference: r.from})
         MATCH (to:Verse {reference: r.to})
         MERGE (from)-[:REFERENCES {type: 'cross-reference', source: 'OpenBible.info', weight: r.votes / $maxVotes, bidirectional: true}]->(to)`,
        { refs: batch, maxVotes }
      );
    }
  } finally {
    session.close();
  }
}

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

(async () => {
  // await downloadCrossRefs();  // If needed; assume local
  await ingestBibleStructure();
  await ingestCrossRefs();
  await driver.close();
  console.log('Ingestion complete.');
})();