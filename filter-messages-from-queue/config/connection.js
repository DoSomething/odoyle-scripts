const Tortoise = require('tortoise');

/**
 * @see: https://www.npmjs.com/package/tortoise#advanced-setup
 */
const connectionOpts = {
  connectRetries: -1,
  connectRetryInterval: 1000,
};

const rabbitMq = new Tortoise(
  process.env.RABBITMQ_CONNECTION_URL || 'amqp://localhost',
  connectionOpts
);

/**
 * Error handlers --------
 */

rabbitMq.on(Tortoise.EVENTS.CONNECTIONCLOSED, () => {
  process.exit(Tortoise.EVENTS.CONNECTIONCLOSED);
});

rabbitMq.on(Tortoise.EVENTS.CONNECTIONDISCONNECTED, () => {
  process.exit(Tortoise.EVENTS.CONNECTIONDISCONNECTED);
});

rabbitMq.on(Tortoise.EVENTS.PARSEERROR, () => {
  process.exit(Tortoise.EVENTS.PARSEERROR);
});

// End Error handlers --------/

module.exports = {
  rabbitMq
}
