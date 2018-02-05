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
  console.log(`${Tortoise.EVENTS.CONNECTIONCLOSED} detected.`);
  process.exit(Tortoise.EVENTS.CONNECTIONCLOSED);
});

rabbitMq.on(Tortoise.EVENTS.CONNECTIONDISCONNECTED, () => {
  console.log(`${Tortoise.EVENTS.CONNECTIONDISCONNECTED} detected.`);
  process.exit(Tortoise.EVENTS.CONNECTIONDISCONNECTED);
});

rabbitMq.on(Tortoise.EVENTS.PARSEERROR, () => {
  console.log(`${Tortoise.EVENTS.PARSEERROR} detected.`);
  process.exit(Tortoise.EVENTS.PARSEERROR);
});

// End Error handlers --------/

module.exports = {
  rabbitMq
}
