const eventEmitter = require('events');
const underscore = require('underscore');

const defaults = {
  intervalWaitInMs: 2000,
  batchSize: 2,
  batchIntervalId: null
};

class BatchProcessor extends eventEmitter {
  constructor(options) {
    super();
    this.options = underscore.extend({}, defaults, options);
    this.queue = [];
    this.processed = [];

    this.processsing = false;
  }
  enqueue(task) {
    this.queue.push(task);
  }
  dequeue(){
    return this.queue.shift();
  }
  processBatch() {
    const leftToProcess = this.queue.length;
    const keepProcessing = (leftToProcess - this.options.batchSize) <= 0 ? false : true;
    let processed = 0;
    let processThisMany;

    if (!keepProcessing) {
      this.stopProcessing();
      processThisMany = leftToProcess;
    }else {
      processThisMany = this.options.batchSize;
    }

    while (processed < processThisMany) {
      const task = this.dequeue();
      this.processed.push(task.cb(task.args));
      processed += 1;
    }
    return true;
  }
  start() {
    if (!this.queue.length || this.processsing === true) {
      return false;
    }
    this.options.batchIntervalId = setInterval(() => {
      this.processBatch();
    }, this.options.intervalWaitInMs);
  }
  stopProcessing() {
    clearInterval(this.options.batchIntervalId);
    this.options.batchIntervalId = defaults.batchIntervalId;

    setTimeout(() => {
      this.emit('done', this.processed);
      this.resetQueues();
      this.processsing = false;
    }, this.options.intervalWaitInMs);
  }
  resetQueues() {
    this.queue = [];
    this.processed = [];
  }
}

module.exports = BatchProcessor;
