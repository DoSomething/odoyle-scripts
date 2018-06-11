'use strict';

const logger = require('winston');

function logMemoryUsed() {
  const used = process.memoryUsage();
  logger.info('#---------- Memory ---------#');
  Object.keys(used).forEach((key) => {
    logger.info(`${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`);
  });
  logger.info('#---------------------------#');
}

module.exports = {
  logMemoryUsed,
};
