const axios = require('axios');
const underscore = require('underscore');
const logger = require('winston');
const eventEmitter = require('events');
const assert = require('assert');

const config = require('../config/lib/gambit');
const BatchProcessor = require('./batchProcessor');

const defaults = {
  baseURL: config.baseURL,
  timeout : 29000,
  headers: {
    'x-gambit-api-key': config.gambitAPIKey,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

class GambitService extends eventEmitter {
  constructor(options = {}, batchProcessor) {
    super();
    this.test = config.environment === 'test';
    this.options = underscore.extend({}, defaults, options || {});
    this.client = axios.create(this.options);
    this.batchProcessor = batchProcessor ? batchProcessor : new BatchProcessor();
    this.errors = [];
    this.setupEventHandlers();
  }
  setupEventHandlers(){
    if (!this.batchProcessor instanceof eventEmitter) {
      throw new Error('This batchProcessor doesn\'t support events.');
    }
    this.batchProcessor.on('done', (processed) => {
      this.emit('done', this.errors, processed);
    });

    this.on('sent', (response, request) => {
      logger.info(`Successfully sent request: ${JSON.stringify(request)} with status: ${response.status}. and response data: ${JSON.stringify(response.data)}`);
    });

    this.on('error', (error, request) => {
      logger.error(`Error processing a request: ${JSON.stringify(request)} The error was: ${JSON.stringify(error)}`);
    });
  }
  enqueueRequest(request) {
    this.batchProcessor.enqueue({
      args: request,
      cb: this.send.bind(this),
    });
  }
  send({ method = 'post', endpoint, data = {}, options = {} }) {
    if (method.toLowerCase() === 'post') {
      return this.client.post(endpoint, data, options)
        .then((response) => {
          const request = { method, endpoint, data, options };
          this.emit('sent', response, request);
        })
        .catch((error) => {
          const request = { method, endpoint, data, options };
          this.emit('error', error, request);
          this.errors.push({
            error,
            request
          });
        });
    }
  }
  startBatchProcess() {
    this.batchProcessor.start();
  }
}

module.exports = GambitService;
