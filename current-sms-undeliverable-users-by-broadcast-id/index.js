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

// Write the csv header
userIdsFileStream.write('user_id\n');

function processUser(user) {
  if (user.sms_status === 'undeliverable') {
    currentUndeliverableFound += 1;
    userIdsFileStream.write(`${user.id}\n`);
  }
  logger.info(`${user.id},${user.sms_status}`);
}

function addLimit(cursor) {
  // set results limit
  if (config.query.limit) {
    if (config.query.limit <= config.query.MAX_LIMIT) {
      cursor.limit(config.query.limit);
    } else {
      logger.info(`violation of the config.query.MAX_LIMIT. Defaulting to DEFAULT_LIMIT: ${config.query.DEFAULT_LIMIT}`);
      cursor.limit(config.query.DEFAULT_LIMIT);
    }
  } else {
    cursor.limit(config.query.DEFAULT_LIMIT);
  }
}

// Connect to the DB
mongoClient.connectToDB().then((db) => {
  // Execute the aggregation pipeline stages
  const cursor = db.collection('messages').aggregate(
    [
      {
        $match: {
          broadcastId: `${broadcastId}`,
          direction: config.query.direction,
          'metadata.delivery.failureData.code': {
            $in: config.query.errorCodes,
          },
          'metadata.delivery.failedAt': { $exists: 1 },
        },
      },
      { $project: { userId: 1 } },
    ],
    { cursor: { batchSize: 500 } },
  );

  addLimit(cursor);

  cursor.forEach((doc) => {
    userIds.add(doc.userId);
  });

  cursor.on('close', () => {
    userIds.forEach((id) => {
      docsFound += 1;
      northstarPromises.push(rateLimiter.add(northstar.fetchUserById
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
