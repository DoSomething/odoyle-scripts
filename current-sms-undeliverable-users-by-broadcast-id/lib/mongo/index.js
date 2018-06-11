'use strict';

const Promise = require('bluebird');
const mongoDb = Promise.promisifyAll(require('mongodb'));

const config = require('./config');

let client;

async function getClient() {
  if (client) {
    return client;
  }
  // Set client variable
  client = await mongoDb.MongoClient.connectAsync(config.connectionUrl);
  return client;
}

async function connectToDB(db) {
  const mongoClient = await getClient();
  return mongoClient.db(db);
}

async function disconnect() {
  const mongoClient = await getClient();
  mongoClient.close();
}

module.exports = {
  connectToDB,
  disconnect,
};
