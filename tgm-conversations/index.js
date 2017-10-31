'use strict';

require('dotenv').config();

const fs = require('fs');
const logger = require('winston');
const neatCsv = require('neat-csv');
const helpers = require('./lib/helpers');
const config = require('./config');

async function getDB() {
  const db = await config.mongoDB;
  return db;
}

async function init() {
  const db = await getDB();
  try {
    const conversations = await db.collection('conversations').find().limit(5).toArray();
    conversations.forEach((conversation, index) => {
      logger.info(`${index} conversationId:${conversation._id}`);
    });
  } catch(error) {
    logger.error(error);
  }
}

// ------- Main function --------------------------------------------------------

const importConversations = async (stream) => {
  const data = await neatCsv(stream, {
    separator: ',',
  });

  const rowCount = data.length;
  data.forEach((row, i) => {
    const mobile = helpers.formatMobileNumber(row.phone_number);
    logger.info('Importing', { i, mobile });
  });

  logger.info(`Processed ${rowCount} rows.`);
}

const path = '../../TGM/7554.csv'
const csvFile = fs.createReadStream(path)
  .on('error', (e) => winston.error(`Parse error | ${e}`));

importConversations(csvFile);
