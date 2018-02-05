const path = require('path');
const axios = require('axios');
const underscore = require('underscore');
const spawn = require('child_process').spawn;

module.exports.killChildProcess = function killChildProcess(pid, cb, cbArgs = []) {
  console.log(`killChildProcess(): Killing child process: ${pid}`);
  process.kill(pid, 'SIGKILL');
  if (typeof cb === 'function') {
    cb.apply(this, cbArgs);
  }
}

/**
 * getK6EnvObject - Pack K6 specific config variables into an object that will be passed on to the
 *                  K6 command.
 *
 * @param  {object} inputs argv properties with values from user input
 * @param  {object} config object with gloval variables that will be used by this wrapper and/or
 *                         when executing the K6 shell command to actually run the load test.
 * @return {object}        K6 specific env variables.
 */
module.exports.getK6EnvObject = async function getK6EnvObject(inputs, config) {

  const envObject = underscore.pick(config, [
    'randomDelayMaxSecods',
    'defaultNorthstarId',
  ]);

  // Get the broadcast's webhook URL from the broadcast's settings response
  const res = await axios.get(config.broadcastSettingsUrl);
  const data = res.data.data;

  // IMPORTANT to check that changes in Gambit Conversations haven't broken this script.
  if (!data || !data.webhook || !data.webhook.url || !data.webhook.body) {
    throw new Error('Unexpected response from Gambit\'s /broadcasts/:id route');
  }

  envObject.blinkBroadcastWebhookUrl = data.webhook.url;
  envObject.blinkBroadcastWebhookBody = JSON.stringify(data.webhook.body);

  // Custom inputs parsing --------
  if (inputs.delay) {
    envObject.delay = inputs.delay;
  }

  // Used in K6 to determine which load test scenario to run.
  if (inputs.scenario) {
    envObject.scenario = inputs.scenario;
  }

  // Used in k6 to calculate request failure percentage
  if (inputs['request-failure-percent']) {
    envObject.requestFailurePercent = inputs['request-failure-percent'];
  }

  if (inputs['request-failure-count']) {
    envObject.requestFailureCount = inputs['request-failure-count'];
  }

  // End custom inputs parsing --------/

  return envObject;
}

module.exports.getK6CommandString = function getK6CommandString(inputs, config) {
  // Build the options string
  let optsString = '';

  // Get native options
  const nativeOpts = Object.keys(config.cliOptions).filter((opt) => {
    return !config.cliOptions[opt].customOpt;
  });

  /**
   * Parse native options
   * @see: https://docs.k6.io/docs/options
   */
  nativeOpts.forEach((opt) => {
    if (inputs[opt]) optsString = `${optsString} -${opt} ${inputs[opt]}`;
  });

  // Will run N iterations
  if (inputs.n) {
    optsString = `${optsString} -i ${inputs.n}`;
  }

  // Use influxdb to store metrics on this load test
  if (inputs.influx) {
    optsString = `${optsString} --out influxdb=http://localhost:8086/${config.dbName}`
  }

  return `k6 run ${optsString} ../vucode/index.js`;
}

module.exports.getK6ChildProcess = function getK6ChildProcess(command, envObject) {
  return spawn(command, [], {
    cwd: path.dirname(__filename),
    // env variables that will be used in this shell command
    env: envObject,
    shell: true,
    // Use the same stdout and stdin as the parent process
    stdio: 'inherit',
  });
}
