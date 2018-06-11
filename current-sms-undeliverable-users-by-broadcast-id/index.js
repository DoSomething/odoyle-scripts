'use strict';

require('dotenv').config();

// Libraries
const fs = require('fs');
const logger = require('winston');
const yargs = require('yargs');
const PromiseThrottle = require('promise-throttle');
const Promise = require('bluebird');

// Local modules
const config = require('./config');
const memoryProfiler = require('./lib/naive-memory-profiler');
const mongoClient = require('./lib/mongo');
const northstar = require('./lib/northstar');

// Start profiling processing time
logger.profile('script');

const rateLimiter = new PromiseThrottle({
  requestsPerSecond: config.northstar.requestsPerSecond,
  promiseImplementation: Promise, // the Promise library you are using
});

const userInput = yargs.options(config.cliOptions).argv;
const broadcastId = userInput.broadcast;
const userIdsFilePath = `./data/userIds-${broadcastId}.csv`;
const userIdsFileStream = fs.createWriteStream(userIdsFilePath, { flags: 'w' });
const northstarPromises = [];
const userIds = new Set();

// Logging variables
let docsFound = 0;
let currentUndeliverableFound = 0;

function getNorthstarUserById(id) {
  return northstar.fetchUserById(id);
}

function processUser(user) {
  if (user.sms_status === 'undeliverable') {
    currentUndeliverableFound += 1;
    userIdsFileStream.write(`${user.id},${user.sms_status}\n`);
  }
  logger.info(`${user.id},${user.sms_status}`);
}

// Write the header
userIdsFileStream.write('user_id,sms_status\n');

// Connect to the DB
mongoClient.connectToDB().then((db) => {
  // Execute the aggregation pipeline stages
  const cursor = db.collection('messages').aggregate([
    { $match: { broadcastId: `${broadcastId}`,
      direction: config.query.direction,
      'metadata.delivery.failureData.code': {
        $in: config.query.errorCodes,
      },
      'metadata.delivery.failedAt': { $exists: 1 } } },
    { $project: { userId: 1 } },
  ], { cursor: { batchSize: 500 } }).limit(10);

  cursor.forEach((doc) => {
    userIds.add(doc.userId);
  });

  cursor.on('close', () => {
    userIds.forEach((id) => {
      docsFound += 1;
      northstarPromises.push(rateLimiter.add(getNorthstarUserById
        .bind(this, id)).then(user => processUser(user)));
    });

    Promise.all(northstarPromises)
      .then(() => {
        logger.info(`Found ${docsFound} users. ${currentUndeliverableFound} currently have an undeliverable status`);
        memoryProfiler.logMemoryUsed();
        userIdsFileStream.end();
        // Stop profiling processing time
        logger.profile('script');
      });
    mongoClient.disconnect();
  });
});
