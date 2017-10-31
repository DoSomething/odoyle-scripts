'use strict';

require('dotenv').config();

const logger = require('winston');
const MongoClient = require('mongodb').MongoClient;

const configVars = {};

configVars.dbUri = process.env.DB_URI || 'mongodb://localhost/gambit-conversations';
/**
 * Setup Mongoose
 * @returns {Promise} MongoDB
 */
configVars.mongoDB = MongoClient.connect(configVars.dbUri);

module.exports = configVars;
