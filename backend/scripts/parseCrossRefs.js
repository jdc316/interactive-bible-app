const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { normalizeReference } = require('../utils/reference');

// Load bible_structure.json for verse validation and range expansion
const bibleStructure = JSON.parse(fs.readFileSync('bible_structure.json'));
const verseMap = {};  // Book.Chapter -> max verse
bibleStructure.books.forEach(book => {
  book.chapters.forEach(chapter => {
    const dottedBook = book.name.replace(/\s+/g, '.');
    verseMap[`${dottedBook}.${chapter.number}`] = chapter.verses.length;
  });
});

// Function to expand range e.g., "Gen.1.1-Gen.1.3" to ["Gen.1.1", "Gen.1.2", "Gen.1.3"]
function expandRange(toVerse) {
  if (!toVerse || typeof toVerse !== 'string' || !toVerse.includes('-')) return [toVerse];
  const parts = toVerse.split('-');
  if (parts.length !== 2) return [toVerse];
  const startNorm = normalizeReference(parts[0]);
  const endNorm = normalizeReference(parts[1]);
  const startSegs = startNorm.split('.');
  const endSegs = endNorm.split('.');
  if (startSegs.length < 3 || endSegs.length < 3) return [toVerse];
  const startBook = startSegs.slice(0, startSegs.length - 2).join('.');
  const endBook = endSegs.slice(0, endSegs.length - 2).join('.');
  const startChapter = startSegs[startSegs.length - 2];
  const endChapter = endSegs[endSegs.length - 2];
  if (startBook !== endBook || startChapter !== endChapter) return [toVerse];
  const bookCh = `${startBook}.${startChapter}`;
  const maxV = verseMap[bookCh] || 0;
  const startV = parseInt(startSegs[startSegs.length - 1], 10);
  const endV = parseInt(endSegs[endSegs.length - 1], 10);
  if (Number.isNaN(startV) || Number.isNaN(endV) || startV > endV || endV > maxV) return [toVerse];
  const expanded = [];
  for (let v = startV; v <= endV; v += 1) {
    expanded.push(`${bookCh}.${v}`);
  }
  return expanded;
}

function parseCrossRefs(tsvPath) {
  return new Promise((resolve, reject) => {
    const refs = [];
    fs.createReadStream(tsvPath)
      .pipe(csv({ separator: '\t' }))  // Use tab delimiter for TSV
      .on('data', (row) => {
        const from = row['From Verse'];
        let to = row['To Verse'];
        const votes = parseInt(row['Votes'] || 0);
        if (from && to) {
          const expandedTos = expandRange(to);
          expandedTos.forEach(expTo => {
            // Normalize here so downstream files are canonical
            const canonFrom = normalizeReference(from);
            const canonTo = normalizeReference(expTo);
            refs.push({ from: canonFrom, to: canonTo, votes });
          });
        }
      })
      .on('end', () => resolve(refs))
      .on('error', reject);
  });
}

// Usage: node parseCrossRefs.js cross_references.txt
(async () => {
  const inputPath = path.join(__dirname, '../data/cross_references.txt');
  const outputPath = path.join(__dirname, '../raw_cross_refs.json');
  const refs = await parseCrossRefs(inputPath);
  fs.writeFileSync(outputPath, JSON.stringify(refs, null, 2));
  console.log('Parsed refs:', refs.length);
})();