const connection = require('./connection');
const cliOptions = require('./cli-options');

const queueName = process.env.RABBITMQ_QUEUE_NAME || 'test';

module.exports = {
  rabbitMq: connection.rabbitMq,
  cliOptions,
  queues: {
    container: {
      name: queueName,
      options: {
        durable: process.env.RABBITMQ_DURABLE_QUEUE === 'true',
      },
    },
    failed: {
      name: `${queueName}-failed-filter`,
      options: {
        durable: true,
      },
    },
    passed: {
      name: `${queueName}-passed-filter`,
      options: {
        durable: true,
      },
    },
  },
  meta: {
    prefetch: process.env.RABBITMQ_QUEUE_PREFETCH || 1,
    dryRun: process.env.DRY_RUN === 'true',
  },
  filter: {
    date: process.env.FILTER_DATE || '2018-01-09',
  }
};
