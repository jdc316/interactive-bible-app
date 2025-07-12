const fs = require('fs');

// Define verse counts per book/chapter (partial; full dict needed in prod)
const verseCounts = {
  Genesis: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]  // Ch1-50
  // Add all 66 books...
};

function generateStructure() {
  const books = [
    { name: 'Genesis', testament: 'Old', order: 1, chapters: verseCounts.Genesis }
    // Add others...
  ];

  return {
    books: books.map(book => ({
      ...book,
      chapters: book.chapters.map((verseCount, chIdx) => ({
        number: chIdx + 1,
        verses: Array.from({ length: verseCount }, (_, vIdx) => ({
          reference: `${book.name.replace(' ', '.')}.${chIdx + 1}.${vIdx + 1}`,
          text: ''  // Empty; dynamic
        }))
      }))
    }))
  };
}

const structure = generateStructure();
fs.writeFileSync('bible_structure.json', JSON.stringify(structure, null, 2));
console.log('Bible structure parsed.');