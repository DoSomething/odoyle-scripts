require('dotenv').config();

const logger = require('winston');
const MongoClient = require('mongodb').MongoClient;

const WINSTON_LEVEL = process.env.LOGGING_LEVEL || 'info';
const GAMBIT_BASE_URL = process.env.GAMBIT_API_BASE_URL || 'http://localhost:5000/v1';
const configVars = {};

// config vars
configVars.campaignsEndPoint = `${GAMBIT_BASE_URL}/campaigns`;
configVars.dbUri = process.env.DB_URI || 'mongodb://localhost/ds-mdata-responder';

/**
 * Setup logger
 */
logger.configure({
  transports: [
    new logger.transports.Console({
      prettyPrint: true,
      colorize: true,
      level: WINSTON_LEVEL,
    }),
  ],
});

/**
 * Setup Mongoose
 * @returns {Promise} MongoDB
 */
configVars.mongoDB = MongoClient.connect(configVars.dbUri);

module.exports = configVars;
