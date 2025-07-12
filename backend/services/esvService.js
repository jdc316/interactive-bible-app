const axios = require('axios');
require('dotenv').config();

class ESVService {
  constructor() {
    this.apiKey = process.env.ESV_API_KEY;
    this.baseUrl = 'https://api.esv.org/v3/passage/text/';
  }

  async getVerseText(reference) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: { q: reference, 'include-headings': false, 'include-footnotes': false },
        headers: { 'Authorization': `Token ${this.apiKey}` }
      });
      return response.data.passages[0].trim();  // Clean text
    } catch (error) {
      console.error('ESV API Error:', error.message);
      throw new Error('Failed to fetch verse text');
    }
  }
}

module.exports = new ESVService();