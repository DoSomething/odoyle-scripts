require('dotenv').config();

const util = require('util');
const Promise = require('bluebird');
const yargs = require('yargs');

const config = require('./config');
const helpers = require('./lib/helpers');

const rabbitMq = config.rabbitMq;
const userInput = yargs.options(config.cliOptions).argv;
const filter = helpers.getFilter(userInput.filter);

helpers.warn(main);

// Throw is filter is not a function.
if (typeof filter !== 'function') throw new Error('filter must be a function.');

/**
 * main - entry point to run the filter
 */
function main() {
  // Setup failed filter queue
  const failedQueue = rabbitMq
    .queue(config.queues.failed.name, config.queues.failed.options)
    .setup();

  // Setup passed filter queue
  const passedQueue = rabbitMq
    .queue(config.queues.passed.name, config.queues.passed.options)
    .setup();

  // Consume
  Promise.all([failedQueue, passedQueue])
    .then(() => {

      if (config.meta.dryRun) {
        console.log('DRY_RUN detected.');
        console.log('No Errors creating the failed and success queues.');
        console.log('Should be safe to run. If you know what you are doing.');
        process.exit(0);
      }

      // Subscribe to container queue
      rabbitMq
        .queue(config.queues.container.name, config.queues.container.options)
        .prefetch(config.meta.prefetch)
        .subscribe(filter(config));
    })
    .catch((err) =>{
      console.log(err);
    });
}
