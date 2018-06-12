'use strict';

/**
 * Imports.
 */
const Northstar = require('@dosomething/northstar-js');
const logger = require('winston');
const config = require('../config/lib/northstar');

/**
 * Setup.
 */
let client;

/**
 * @return {Object}
 */
module.exports.createNewClient = function createNewClient() {
  const loggerMsg = 'northstar.createNewClient';

  try {
    client = new Northstar(config.clientOptions);
    logger.info(`${loggerMsg} success`);
  } catch (err) {
    logger.error(`${loggerMsg} error`, { err });
    throw new Error(err.message);
  }
  return client;
};

/**
 * @return {Object}
 */
module.exports.getClient = function getClient() {
  if (!client) {
    return exports.createNewClient();
  }
  return client;
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
module.exports.fetchUserById = function (id) {
  return exports.getClient().Users.get(config.getUserFields.id, id);
};

/**
 * @param {string} userId
 * @param {object} data
 * @return {Promise}
 */
module.exports.updateUser = function (userId, data) {
  return exports.getClient().Users.update(userId, data);
};
