'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const logger = require('winston');
const Promise = require('bluebird');
const csv = require('csv-streamify');
const request = require('superagent');
const PromiseThrottle = require('promise-throttle');

const config = require('./config');

// Setup variables
const source = path.join(__dirname, `/data/${config.source.name}`);
const destination = path.join(__dirname, `/data/sids-w-carrier-info-${Date.now()}.csv`);
const sourceCsvStream = fs.createReadStream(source);
const destinationCsvStream = fs.createWriteStream(destination);
const rateLimiter = new PromiseThrottle({
  requestsPerSecond: config.rateLimiter.rps,
  promiseImplementation: Promise, // the Promise library you are using
});
const parser = csv({ delimiter: ',', newline: '\n', objectMode: true });
let headers;

// Write the csv header
destinationCsvStream.write('message_sid,carrier_metadata,carrier_name\n');

// Methods

function parseMsgDetails(details) {
  return {
    sid: details.sid,
    number: details.to,
  };
}

function parseMsgLookupData(data) {
  const empty = 'NA';
  const name = data.carrier.name ? data.carrier.name.replace(',', '') : empty;
  const carrier = [
    data.carrier.mobile_country_code || empty,
    data.carrier.mobile_network_code || empty,
    name,
    data.carrier.type || empty,
  ];
  return {
    number: data.phone_number,
    carrier: {
      meta: `${carrier.join(':')}`,
      name,
    },
  };
}

function getMessageDetailsBySid(sid) {
  return request
    .get(`${config.twilio.messagesApiUrl}/${sid}.json`)
    .set(config.twilio.auth.header, config.twilio.auth.token)
    .then(res => parseMsgDetails(res.body));
}

function getLookUpDataByNumber(number) {
  const encodedNumber = encodeURIComponent(number);
  return request
    .get(`${config.twilio.lookupApiUrl}/${encodedNumber}?Type=carrier`)
    .set(config.twilio.auth.header, config.twilio.auth.token)
    .then(res => parseMsgLookupData(res.body));
}

function getFakeLookUpDataByNumber(number) {
  const encodedNumber = encodeURIComponent(number);
  return request
    .get(`${config.twilio.fakeLookupApiUrl}/${encodedNumber}?Type=carrier`)
    .then((res) => {
      logger.info(`rate limit: ${res.headers['x-apiary-ratelimit-limit']}`);
      logger.info(`rate limit: ${res.headers['x-apiary-ratelimit-remaining']}`);
      return parseMsgLookupData(res.body);
    });
}

function processSid(sidLine) {
  if (!headers) {
    headers = sidLine;
    return;
  }
  const sid = sidLine[0];

  rateLimiter.add(async () => {
    let processedSid = `${sid}`;
    try {
      const message = await getMessageDetailsBySid(sid);
      let lookupData;
      if (config.twilio.useFakeTwilioLookup) {
        lookupData = await getFakeLookUpDataByNumber(message.number);
      } else {
        lookupData = await getLookUpDataByNumber(message.number);
      }
      processedSid = `${processedSid},${lookupData.carrier.meta},${lookupData.carrier.name}\n`;
      logger.info(`Processed successful. Writting ${processedSid}`);
    } catch (error) {
      logger.info(`Error processing Sid:${sid}. Error: ${error.message}`);
      processedSid = `${processedSid},NA,NA\n`;
    }
    destinationCsvStream.write(processedSid);
  });
}

// process sids
parser.on('data', processSid);

// Read source
sourceCsvStream.pipe(parser);
