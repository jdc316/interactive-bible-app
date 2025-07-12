const fs = require('fs');

const bibleRefs = new Set(JSON.parse(fs.readFileSync('bible_structure.json')).books.flatMap(book => 
  book.chapters.flatMap(ch => ch.verses.map(v => v.reference))
));

function validateCrossRefs(rawRefs) {
  const validated = new Map();
  const errors = [];

  rawRefs.forEach(ref => {
    const { from, to, votes } = ref;
    if (!bibleRefs.has(from) || !bibleRefs.has(to)) {
      errors.push(`Invalid reference: ${from} -> ${to}`);
      return;
    }
    if (votes < 0) {
      errors.push(`Invalid votes: ${from} -> ${to} (${votes})`);
      return;
    }

    const key = from < to ? `${from}-${to}` : `${to}-${from}`;
    if (validated.has(key)) {
      validated.get(key).votes = Math.max(validated.get(key).votes, votes);
    } else {
      validated.set(key, { from, to, votes });
    }

    const revKey = from < to ? `${to}-${from}` : `${from}-${to}`;
    if (!validated.has(revKey)) {
      validated.set(revKey, { from: to, to: from, votes });
    }
  });

  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  return Array.from(validated.values());
}

const rawRefs = JSON.parse(fs.readFileSync('raw_cross_refs.json'));  // From parse
const cleaned = validateCrossRefs(rawRefs);
fs.writeFileSync('validated_cross_refs.json', JSON.stringify(cleaned, null, 2));
console.log('Validated refs:', cleaned.length);