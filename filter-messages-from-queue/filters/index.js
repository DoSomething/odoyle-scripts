const moment = require('moment');

module.exports = {

  /**
   * It consumes messages inside the "userImportQueue" queue.
   *
   * It filters the ones that pass the
   * filter and re-publishes them to the "<RABBITMQ_QUEUE_NAME>-passed-filter" queue.
   * The messages that fail the filter are re-published to the
   * "<RABBITMQ_QUEUE_NAME>-failed-filter" queue.
   */
  nicheImportMoreThanOrEqualDate: (config) => {
    const count = {
      failed: 0,
      passed: 0
    }

    // we need scope so we use a throwback fuction
    return function (msg, ack, nack) {
      let parsedMsg = undefined;

      // parse this message into an object
      try {
        parsedMsg = JSON.parse(msg);
      } catch (e) {

        /**
         * IMPORTANT
         *
         * Runing this filter is highly destructive.
         * If this is not a JSON parsable message it will drop and NOT requeue.
         */
        nack(false);
      }

      if (parsedMsg) {
        if (moment.unix(parsedMsg.activity_timestamp).isSameOrAfter(moment(config.filter.date))) {
          config.rabbitMq
            .queue(config.queues.passed.name, config.queues.passed.options)
            .publish(parsedMsg)
            .then(() => {
              ++count.passed;
              ack();
              console.log(`passed:${count.passed}`);
            })
            .catch(nack)
        }else {
          config.rabbitMq
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
  }
}
