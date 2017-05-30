const axios = require('axios');
const underscore = require('underscore');

const defaults = {
  baseURL: process.env.GAMBIT_API_BASE_URL,
  timeout : 29000,
  headers: {
    'x-gambit-api-key': process.env.GAMBIT_API_KEY,
  }
};

class GambitService {
  constructor(options) {
    this.config = underscore.extend({}, defaults, options);
    this.client = axios.create(this.config);
  }
  post(endpoint, data = {}, options = {}) {
    return this.client.post(endpoint, data, options);
  }
}

module.exports = GambitService;
