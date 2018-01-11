require('dotenv').config();

const moment = require('moment');
const util = require('util');
const Promise = require('bluebird');

const config = require('./config');
const rabbitMq = config.rabbitMq;

// Pass messages after this date
// TODO: Decouple and create filters instead
const date = config.filter.date;

const count = {
  failed: 0,
  passed: 0
}

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
    // Subscribe to container queue
    rabbitMq
      .queue(config.queues.container.name, config.queues.container.options)
      .prefetch(config.meta.prefetch)
      .subscribe(filterMessages);
  })
  .catch((err) =>{
    console.log(err);
  });

// filters messages
// TODO: Decouple and create filters instead
function filterMessages(msg, ack, nack) {
  let parsedMsg = undefined;

  try {
    parsedMsg = JSON.parse(msg);
  } catch (e) {
    nack(false);
  }

  if (parsedMsg) {
    if (moment.unix(parsedMsg.activity_timestamp).isSameOrAfter(moment(date))) {
      rabbitMq
        .queue(config.queues.passed.name, config.queues.passed.options)
        .publish(parsedMsg)
        .then(() => {
          ++count.passed;
          ack();
          console.log(`passed:${count.passed}`);
        })
        .catch(nack)
    }else {
      rabbitMq
        .queue(config.queues.failed.name, config.queues.failed.options)
        .publish(parsedMsg)
        .then(() => {
          ++count.failed;
          ack();
          console.log(`failed:${count.failed}`);
        })
        .catch(nack)
    }
  }

}
