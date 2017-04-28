'use strict';

require('dotenv').config();
const fetch = require('node-fetch');
const commandLineArgs = require('command-line-args');
const helpers = require('./lib/helpers');
const split = require('split');

// batch size - Requests processed at each time
const BATCH_SIZE = 250;
// wait between batches in milliseconds
const WAIT_BETWEEN_BATCHES = 5000;
let batchStart = 0;
let batchIntervalId;

const optionsSchema = [
  { name: 'file', alias: 'f', type: String },
  { name: 'numLines', alias: 'n', type: Number },
];
const options = commandLineArgs(optionsSchema);
const requestQueries = [];
let lines = 0;
let headers = [];

// TODO: Take all blink related stuff out to its own library
const blinkURL = process.env.BLINK_URL || 'http://localhost:5050';
const blinkToken = Buffer.from(process.env.BLINK_TOKEN || '').toString('base64');

console.log(blinkToken);

function postRequest(url, query, index) {
  return fetch(url,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${blinkToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: query,
    }).then((res) => {
      if (!res.ok) {
        console.log(`The following QUERY: ${query} and INDEX: ${index}, failed with status ${res.status}: ${res.statusText}`);
      } else {
        console.log(`SUCCESS, STATUS: ${res.statusText}, INDEX: ${index}`);
      }
    }).catch((error) => {
      console.log(`The following QUERY: ${query} and INDEX: ${index}, failed with status ${error.code}: ${error.message}`);
    });
}

function processBatch(start) {
  const lastValidIndex = requestQueries.length - 1;
  let stop = start + BATCH_SIZE;

  if (start > lastValidIndex) {
    return clearInterval(batchIntervalId);
  }

  if (stop > lastValidIndex + 1) {
    stop = lastValidIndex + 1;
    clearInterval(batchIntervalId);
  }

  for (let i = start; i < stop; i += 1) {
    postRequest(blinkURL, requestQueries[i], i);
  }
  return true;
}

function getNextBatchStart() {
  const oldBatchStart = batchStart;
  batchStart += BATCH_SIZE;
  return oldBatchStart;
}

function startProcessingRequestInBatches() {
  if (!requestQueries.length) {
    return false;
  }

  const intervalId = setInterval(() => {
    const nextBatchStart = getNextBatchStart();
    processBatch(nextBatchStart);
  }, WAIT_BETWEEN_BATCHES);

  return intervalId;
}

// main IIFE
(async () => {
  const readStream = await helpers.getReadStream(options.file);

  if (readStream.errno) {
    console.log('Error getting the readStream. Is the file path correct?');
    return 1;
  }

  // TODO: This RegExp is not well tested
  readStream.pipe(split(/[\r\n]/)).on('data', (line) => {
    if (options.numLines && lines === options.numLines) {
      return readStream.destroy();
    }

    if (!line.length) {
      return false;
    }

    const lineTokens = line.split(',');

    // NOTE: populate this string with fake or hardcoded variables as needed,
    // so blink doesnt return 422 errors if the csv data is missing fields,
    // for example: message_id=555&profile_id=555666
    // TODO: should be able to add this fields trough the command line?
    let query = '';

    if (lines === 0) {
      headers = lineTokens;
    } else {
      lineTokens.forEach((token, index) => {
        query += `&${headers[index]}=${token}`;
      });
      requestQueries.push(query);
    }
    lines += 1;
    return true;
  });

  readStream.on('close', () => {
    batchIntervalId = startProcessingRequestInBatches();
  });

  return true;
})();
