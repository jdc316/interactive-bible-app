const fs = require('fs');
const path = require('path');
const { normalizeReference } = require('../utils/reference');

const bibleStructurePath = path.join(__dirname, '../bible_structure.json');
const bibleRefs = new Set(JSON.parse(fs.readFileSync(bibleStructurePath)).books.flatMap(book =>
  book.chapters.flatMap(ch => ch.verses.map(v => v.reference))
));

function isCanonicalRef(ref) {
  if (typeof ref !== 'string') return false;
  const parts = ref.split('.');
  if (parts.length < 3) return false;
  const verse = parts[parts.length - 1];
  const chapter = parts[parts.length - 2];
  return /^\d+$/.test(chapter) && /^\d+$/.test(verse);
}

function validateCrossRefs(rawRefs) {
  const validated = new Map();
  const errors = [];

  rawRefs.forEach(ref => {
    const { from, to, votes } = ref;
    const canonFrom = normalizeReference(from);
    const canonTo = normalizeReference(to);
    if (!isCanonicalRef(canonFrom) || !isCanonicalRef(canonTo)) {
      errors.push(`Invalid format: ${canonFrom} -> ${canonTo}`);
      return;
    }
    if (!bibleRefs.has(canonFrom) || !bibleRefs.has(canonTo)) {
      errors.push(`Invalid reference: ${canonFrom} -> ${canonTo}`);
      return;
    }
    if (votes < 0) {
      errors.push(`Invalid votes: ${canonFrom} -> ${canonTo} (${votes})`);
      return;
    }

    const key = canonFrom < canonTo ? `${canonFrom}-${canonTo}` : `${canonTo}-${canonFrom}`;
    if (validated.has(key)) {
      validated.get(key).votes = Math.max(validated.get(key).votes, votes);
    } else {
      validated.set(key, { from: canonFrom, to: canonTo, votes });
    }

    const revKey = canonFrom < canonTo ? `${canonTo}-${canonFrom}` : `${canonFrom}-${canonTo}`;
    if (!validated.has(revKey)) {
      validated.set(revKey, { from: canonTo, to: canonFrom, votes });
    }
  });

  if (errors.length > 0) {
    const logPath = path.join(__dirname, '../validation_errors.log');
    fs.writeFileSync(logPath, errors.join('\n'));
    console.warn(`Validation warnings: ${errors.length} issues written to validation_errors.log`);
  }

  return Array.from(validated.values());
}

const rawPath = path.join(__dirname, '../raw_cross_refs.json');
const outPath = path.join(__dirname, '../validated_cross_refs.json');
const rawRefs = JSON.parse(fs.readFileSync(rawPath));  // From parse
const cleaned = validateCrossRefs(rawRefs);
fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2));
console.log('Validated refs:', cleaned.length);