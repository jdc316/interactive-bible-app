const fs = require('fs');
const csv = require('csv-parser');

function parseCrossRefs(csvPath) {
  return new Promise((resolve, reject) => {
    const refs = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Assume columns: bibleVerse (from), reference (to, semicolon-separated), votes
        const from = row.bibleVerse;
        const tos = row.reference.split(';').map(t => t.trim());
        tos.forEach(to => {
          refs.push({ from, to, votes: parseInt(row.votes || 0) });
        });
      })
      .on('end', () => resolve(refs))
      .on('error', reject);
  });
}

// Usage: node parseCrossRefs.js path/to/cross-references.csv > output.json
(async () => {
  const refs = await parseCrossRefs('cross-references.csv');
  console.log(JSON.stringify(refs, null, 2));
})();