'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const logger = require('winston');

const config = require('./config');

let docsFound = 0;

/**
 * logDocsFound
 * WARNING: All scripts should implement this function.
 *
 * @return {type}  description
 */
function logDocsFound() {
  logger.info(`Found MessageSids for broadcast: ${config.broadcastId} sent between ${docsFound} dates.`);
}

/**
 * processEachResult - function called per each result in the query.
 * WARNING: All scripts should implement this function.
 *
 * @param  {Object} doc
 */
function processEachResult(doc) {
  const date = `${doc._id.year}-${doc._id.month}-${doc._id.day}`;
  const sids = doc.messageSids || [];
  const sidsFilePath = path.join(__dirname, `../../data/sids-for-${config.broadcastId}-${date}.csv`);
  const sidsFileStream = fs.createWriteStream(sidsFilePath, { flags: 'w' });
  sidsFileStream.write(`${date}${os.EOL}`);
  sids.forEach(sid => sidsFileStream.write(`${sid}${os.EOL}`));
  sidsFileStream.end();
  docsFound += 1;
}

/**
 * execute - function called to execute the query on the passed DB connection.
 * WARNING: All scripts should implement this function.
 *
 * @param  {Db} db @see http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html
 * @return {AggregationCursor} @see http://mongodb.github.io/node-mongodb-native/3.0/api/AggregationCursor.html
 */
function execute(db) {
  return db.collection('messages').aggregate([
    {
      $match: {
        direction: 'outbound-api-send',
        broadcastId: `${config.broadcastId}`,
        'metadata.delivery.failedAt': { $exists: 1 },
        'metadata.delivery.failureData.code': { $in: config.errorCodes },
      },
    },
    {
      $group: {
        _id: {
          month: {
            $month: '$metadata.delivery.queuedAt',
          },
          day: {
            $dayOfMonth: '$metadata.delivery.queuedAt',
          },
          year: {
            $year: '$metadata.delivery.queuedAt',
          },
        },
        messageSids: {
          $push: '$platformMessageId',
        },
      },
    },
  ],
  {
    allowDiskUse: true,
    cursor: { batchSize: 500 },
  });
}

module.exports = {
  execute,
  processEachResult,
  logDocsFound,
};
