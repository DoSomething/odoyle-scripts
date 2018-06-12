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

const rateLimitedGetNorthstarUser = new PromiseThrottle({
  requestsPerSecond: config.northstar.rateLimit.get,
  promiseImplementation: Promise, // the Promise library you are using
});

const rateLimitedUpdateNorthstarUser = new PromiseThrottle({
  requestsPerSecond: config.northstar.rateLimit.update,
  promiseImplementation: Promise, // the Promise library you are using
});

const userInput = yargs.options(config.cliOptions).argv;
const broadcastId = userInput.broadcast;
const userIdsFilePath = `./data/updated-user-ids-${broadcastId}-${Date.now()}.csv`;
const updatedUserIdsFileStream = fs.createWriteStream(userIdsFilePath, { flags: 'w' });
const getNorthstarUserPromises = [];
const updateNorthstarUserPromises = [];
const userIds = new Set();

// Logging variables
let docsFound = 0;
let currentUndeliverableFound = 0;
let usersUpdated = 0;

// Write the csv header
updatedUserIdsFileStream.write('user_id\n');

function shouldUpdateUser(user) {
  return user.sms_status === config.northstar.smsStatuses.undeliverable;
}

function getActiveSmsStatusPayload() {
  return {
    sms_status: config.northstar.smsStatuses.active,
  };
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

function exit(error) {
  logger.info(`
    Found ${docsFound} users.
    ${currentUndeliverableFound} currently were in an undeliverable status.
    ${usersUpdated} were updated to ${config.northstar.smsStatuses.active}.`);
  updatedUserIdsFileStream.end();
  memoryProfiler.logMemoryUsed();
  // Stop profiling processing time
  logger.profile('script');

  if (error) {
    logger.error(error);
    process.exit(1);
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
      // rate limit getting user's sms_status from Northstar
      getNorthstarUserPromises.push(rateLimitedGetNorthstarUser.add(
        northstar.fetchUserById.bind(this, id))
        .then((user) => {
          logger.info(`Found ${user.id},${user.sms_status}`);
          // If the user is currently set to undeliverable
          if (shouldUpdateUser(user)) {
            currentUndeliverableFound += 1;
            // rate limit updating user's sms_status in Northstar
            updateNorthstarUserPromises.push(rateLimitedUpdateNorthstarUser.add(
              northstar.updateUser.bind(this, user.id, getActiveSmsStatusPayload()))
              .then((response) => {
                usersUpdated += 1;
                logger.info(`Updated ${response.id} to active`);
                updatedUserIdsFileStream.write(`${user.id}\n`);
              }));
          }
        }));
    });

    Promise.all(getNorthstarUserPromises)
      .then(() => {
        Promise.all(updateNorthstarUserPromises)
          .then(() => exit())
          .catch(error => exit(error));
      })
      .catch(error => exit(error));

    mongoClient.disconnect();
  });
});
