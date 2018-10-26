'use strict';

require('dotenv').config();

const logger = require('winston');
const yargs = require('yargs');

const config = require('./config');
const mongoClient = require('./lib/mongo');
const memoryProfiler = require('./lib/naive-memory-profiler');

// Start profiling processing time
logger.profile('script');

// User CLI input
const userInput = yargs.options(config.cliOptions).argv;
const scriptName = userInput.script;

/**
 * Scripts are registered in the CLI options' choice property. The name MUST match the script's
 * file name inside the /scripts folder.
 */
const script = require(`./scripts/${scriptName}`); // eslint-disable-line

/**
 * exit - it executes the teardown of the main process
 *
 * @param  {Object} error If an error is passed, the process is exited w/ status code 1
 */
function exit(error) {
  script.logDocsFound();
  memoryProfiler.logMemoryUsed();
  // Stop profiling processing time
  logger.profile('script');

  if (error) {
    logger.error(error);
    process.exit(1);
  }
}

/**
 * Connect to the DB then execute the script's query, process each result, disconnect, and
 * exit the script.
 */
mongoClient.connectToDB().then((db) => {
  const cursor = script.execute(db);
  cursor.forEach(script.processEachResult);
  cursor.on('close', () => {
    mongoClient.disconnect();
    exit();
  });
});
