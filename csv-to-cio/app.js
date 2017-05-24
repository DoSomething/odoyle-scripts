'use strict';

// ------- Fitst things first --------------------------------------------------
// Load enviroment vars.
require('dotenv').config();

// ------- Imports -------------------------------------------------------------
const fs = require('fs');
require('isomorphic-fetch');
const neatCsv = require('neat-csv');
const winston = require('winston');
const yargs = require('yargs');
const RateLimiter = require('limiter').RateLimiter;

// ------- Args parse ----------------------------------------------------------

const argv = yargs
  .usage('Usage: node $0 <command> [options]')
  .alias('f', 'file')
  .nargs('f', 1)
  .describe('f', 'Load a file')
  .demandOption(['f'])
  .argv;

// ------- Logger --------------------------------------------------------------

winston.configure({
  transports: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
      level: 'debug',
      showLevel: true,
    }),
    new winston.transports.File({
      filename: 'logs/unprocessed.log',
      level: 'error',
      colorize: false,
      json: false,
    })
  ],
  exceptionHandlers: [
    new winston.transports.Console({
      prettyPrint: true,
      colorize: true,
    }),
  ],
});

winston.setLevels(winston.config.syslog.levels);
winston.addColors(winston.config.syslog.colors);


// ------- Load and transform function -----------------------------------------

const getNorthstarUser = async (id) => {
  let result;
  try {
    const response = await fetch(
      `${process.env.DS_NORTHSTAR_API_BASEURI}/users/id/${id}`,
      {
        headers: {
          'X-DS-REST-API-Key': process.env.DS_NORTHSTAR_API_KEY,
        }
      }
    );
    result = await response.json();
  } catch (e) {
    throw new Error(`Northstar error: ${e}`);
  }
  if (result.error) {
    throw new Error(`Northstar response: ${result.error.message}`);
  }

  winston.info(`Northstar loaded ${id}`);
  return result.data;
}

const postToBlink = async (user) => {
  let result;
  const blinkUser = Object.assign({}, user);
  // Rename status field, as Northstar hasn't catched up yet
  if (blinkUser.mobilecommons_status) {
    blinkUser.mobile_status = blinkUser.mobilecommons_status;
    delete blinkUser.mobilecommons_status;
  }
  // Used to suppress welcome email
  blinkUser.source_detail = 'backfill-quasar-pre-launch';

  const body = JSON.stringify(blinkUser);
  try {
    const response = await fetch(
      `${process.env.BLINK_BASE_URI}/events/user-create`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${process.env.BLINK_AUTH}`,
          'Content-Type': 'application/json',
        },
        body,
      }
    );
    result = await response.json();
  } catch (e) {
    throw new Error(`Blink error: ${e}`);
  }
  if (result.ok !== true) {
    throw new Error(`Blink response: ${result.message}, payload: ${body}`);
  }

  winston.info(`Blink processed ${body}`);
  return result.data;
}

// ------- Main function --------------------------------------------------------

const main = async (stream) => {
  const data = await neatCsv(stream, {
    separator: ',',
  });

  const limiter = new RateLimiter(3, 'second');
  for (let i = data.length - 1; i >= 0; i--) {
    limiter.removeTokens(1, async () => {
      try {
        let user = await getNorthstarUser(data[i].northstar_id);
        await postToBlink(user);
      } catch (e) {
        winston.error(`${data[i].northstar_id} | ${e}`);
      }
    });
  }
}

const csvFile = fs.createReadStream(argv.file)
  .on('error', (e) => winston.error(`Parse error | ${e}`));

// Star main
main(csvFile);

// ------- End -----------------------------------------------------------------
