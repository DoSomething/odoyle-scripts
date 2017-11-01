'use strict';

require('dotenv').config();

const fs = require('fs');
const logger = require('winston');
const neatCsv = require('neat-csv');
const args = require('yargs').argv;
const helpers = require('./lib/helpers');
const config = require('./config');

async function getDB() {
  const db = await config.mongoDB;
  return db;
}

async function upsertRows(rows, campaignId) {
  const db = await getDB();
  const result = {
    processed: 0,
    errors: [],
  };
  const importSource = args.source || 'TGM';
  const topic = args.topic || 'random';

  for (let i = 0; i < rows.length; i++) {
    result.processed++;
    const mobile = rows[i].phone_number;
    try {
      const platformUserId = helpers.formatMobileNumber(mobile);
      const data = {
        platform: 'sms',
        platformUserId,
        campaignId,
        topic,
        importSource,
      };
      const query = { platformUserId  };
      await db.collection('conversations').update(query, data, { upsert: true });
      logger.info('success', { data });
    } catch(error) {
      result.errors.push({ i, mobile, error: error.message });
      logger.error(error);
    }
  }

  return result;
}

// ------- Main function --------------------------------------------------------

if (!args.file || !args.campaign) {
  console.log('Missing file or campaign args');
  process.exit(0);
}

const main = async (stream) => {
  const data = await neatCsv(stream, {
    separator: ',',
  });
  const result = await upsertRows(data, args.campaign);
  const errors = result.errors;
  logger.info(`Processed ${result.processed} rows.`);
  if (errors.length) {
    logger.info(`There were ${errors.length} errors:`, errors);
  }
  process.exit(0);
}

const csvFile = fs.createReadStream(args.file)
  .on('error', (e) => winston.error(`Parse error | ${e}`));

main(csvFile);
