const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');
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
  const structure = JSON.parse(fs.readFileSync(path.join(__dirname, '../bible_structure.json')));
  const session = driver.session();
  try {
    for (const book of structure.books) {
      const bookRes = await session.run(
        `MERGE (b:Book {name: $name})
         ON CREATE SET b.id = randomUUID(), b.testament = $testament, b.order = $order
         RETURN b.id AS id`,
        book
      );
      const bookId = bookRes.records[0].get('id');

      for (const chapter of book.chapters) {
        const chRes = await session.run(
          `MATCH (b:Book {id: $bookId})
           MERGE (c:Chapter {number: $number, bookName: b.name})
           ON CREATE SET c.id = randomUUID()
           MERGE (b)-[:HAS_CHAPTER]->(c)
           RETURN c.id AS id`,
          { number: chapter.number, bookId }
        );
        const chapterId = chRes.records[0].get('id');

        const verseBatches = chunk(chapter.verses, 1000);
        for (const batch of verseBatches) {
          await session.run(
            `UNWIND $verses AS v
             MERGE (verse:Verse {reference: v.reference})
             ON CREATE SET verse.id = randomUUID(), verse.number = v.number
             WITH verse, $chapterId AS chId
             MATCH (c:Chapter {id: chId})
             MERGE (c)-[:HAS_VERSE]->(verse)`,
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
  const refs = JSON.parse(fs.readFileSync(path.join(__dirname, '../validated_cross_refs.json')));
  const session = driver.session();
  try {
    const refBatches = chunk(refs, 1000);
    let maxVotes = 1;
    for (const r of refs) {
      if (typeof r.votes === 'number' && r.votes > maxVotes) maxVotes = r.votes;
    }
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