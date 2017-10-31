'use strict';

const logger = require('winston');
const config = require('./config');

async function getDB() {
  const db = await config.mongoDB;
  return db;
}

async function init() {
  const db = await getDB();
  try {
    const conversations = await db.collection('conversations').find().limit(50).toArray();
    conversations.forEach((conversation, index) => {
      logger.info(`${index} conversationId:${conversation._id}`);
    });
  } catch(error) {
    logger.error(error);
  }
}

init();
