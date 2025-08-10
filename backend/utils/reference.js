// Reference normalization utilities
// Converts various book abbreviations (e.g., Gen, 1John, Song) to canonical
// full book names with dots as separators, matching bible_structure.json
// e.g., Gen.1.1 -> Genesis.1.1, 1John.1.1 -> 1.John.1.1, Song.1.1 -> Song.of.Solomon.1.1

const abbreviationToFull = {
  // Pentateuch
  Gen: 'Genesis', Exod: 'Exodus', Lev: 'Leviticus', Num: 'Numbers', Deut: 'Deuteronomy',
  // History
  Josh: 'Joshua', Judg: 'Judges', Ruth: 'Ruth',
  '1Sam': '1 Samuel', '2Sam': '2 Samuel',
  '1Kgs': '1 Kings', '2Kgs': '2 Kings', '1Kings': '1 Kings', '2Kings': '2 Kings',
  '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', Ezra: 'Ezra', Neh: 'Nehemiah', Esth: 'Esther',
  // Poetry/Wisdom
  Job: 'Job', Ps: 'Psalms', Psa: 'Psalms', Prov: 'Proverbs', Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon', SongOfSolomon: 'Song of Solomon', SOS: 'Song of Solomon',
  // Major Prophets
  Isa: 'Isaiah', Jer: 'Jeremiah', Lam: 'Lamentations', Ezek: 'Ezekiel', Dan: 'Daniel',
  // Minor Prophets
  Hos: 'Hosea', Joel: 'Joel', Amos: 'Amos', Obad: 'Obadiah', Jonah: 'Jonah', Mic: 'Micah',
  Nah: 'Nahum', Hab: 'Habakkuk', Zeph: 'Zephaniah', Hag: 'Haggai', Zech: 'Zechariah', Mal: 'Malachi',
  // Gospels/Acts
  Matt: 'Matthew', Mark: 'Mark', Luke: 'Luke', John: 'John', Acts: 'Acts',
  // Paul
  Rom: 'Romans', '1Cor': '1 Corinthians', '2Cor': '2 Corinthians', Gal: 'Galatians', Eph: 'Ephesians',
  Phil: 'Philippians', Col: 'Colossians', '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy', '2Tim': '2 Timothy', Titus: 'Titus', Phlm: 'Philemon', Philemon: 'Philemon',
  // General epistles
  Heb: 'Hebrews', Jas: 'James', James: 'James', '1Pet': '1 Peter', '2Pet': '2 Peter',
  '1John': '1 John', '2John': '2 John', '3John': '3 John', Jude: 'Jude',
  // Revelation
  Rev: 'Revelation', Revelation: 'Revelation'
};

// Also support some alternative abbreviations commonly seen
const altBookToFull = {
  '1Sam': '1 Samuel', '2Sam': '2 Samuel', '1Kg': '1 Kings', '2Kg': '2 Kings',
  '1Ki': '1 Kings', '2Ki': '2 Kings', '1Ch': '1 Chronicles', '2Ch': '2 Chronicles',
  'Cant': 'Song of Solomon', 'SongOfSongs': 'Song of Solomon'
};

function normalizeBookKey(token) {
  return (token || '').replace(/\./g, '').replace(/\s+/g, '').toLowerCase();
}

// Add self-mapping of full names as normalized keys
const fullNames = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];
const fullNameMap = Object.fromEntries(fullNames.map(n => [normalizeBookKey(n), n]));

function bookTokenToFull(bookToken) {
  if (!bookToken) return bookToken;
  // Try abbreviation/alt maps first
  if (abbreviationToFull[bookToken]) return abbreviationToFull[bookToken];
  if (altBookToFull[bookToken]) return altBookToFull[bookToken];
  // Try normalized form against full names
  const byKey = fullNameMap[normalizeBookKey(bookToken)];
  if (byKey) return byKey;
  // Fallback: replace dots with spaces (assume already full)
  const spaced = bookToken.replace(/\./g, ' ').trim();
  return spaced;
}

// Normalize Book.Chapter.Verse to canonical dotted form based on full book name
function normalizeReference(input) {
  if (!input || typeof input !== 'string') return input;
  const raw = input.trim();
  // Parse from right: last two dot-separated tokens must be chapter and verse
  const parts = raw.split('.');
  if (parts.length < 3) return raw;
  const verse = parts[parts.length - 1];
  const chapter = parts[parts.length - 2];
  if (!/^\d+$/.test(chapter) || !/^\d+$/.test(verse)) return raw;
  const bookToken = parts.slice(0, parts.length - 2).join('.');
  const fullBook = bookTokenToFull(bookToken);
  // Convert spaces to dots for canonical format
  const dottedBook = fullBook.replace(/\s+/g, '.');
  return `${dottedBook}.${chapter}.${verse}`;
}

module.exports = { normalizeReference, bookTokenToFull };


