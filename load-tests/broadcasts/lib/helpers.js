const path = require('path');
const axios = require('axios');
const WebSocket = require('ws');
const spawn = require('child_process').spawn;

module.exports.getMobileNumberGenSocket = function getMobileNumberGenSocket(wsUrl) {
  return new WebSocket(wsUrl);
}

module.exports.getMobileNumberGenServer = function getMobileNumberGenServer(port) {
  console.log(`getMobileNumberGenServer(): Getting server.`);
  return new WebSocket.Server({ port });
}

module.exports.killChildProcess = function killChildProcess(pid, cb, cbArgs = []) {
  console.log(`killChildProcess(): Killing child process: ${pid}`);
  process.kill(pid, 'SIGKILL');
  if (typeof cb === 'function') {
    cb.apply(this, cbArgs);
  }
}

module.exports.closeServer = function closeServer(server, cb) {
  console.log(`closeServer(): Closing server.`);
  return server.close(cb);
};

module.exports.getK6EnvObject = async function getK6EnvObject(inputs, config) {
  const envObject = {
    wsBaseURI: config.wsBaseURI,
    getNextMobile: config.getNextMobile,
    getNextUpdatedMobile: config.getNextUpdatedMobile,
    twilioInboundRelayUrl: config.twilioInboundRelayUrl,
    randomDelayMaxSecods: config.randomDelayMaxSecods,
  };

  const res = await axios.get(config.broadcastSettingsUrl);
  envObject.statusCallbackUrl = res.data.webhook.statusCallbackUrl;

  if (inputs.delay) {
    envObject.delay = inputs.delay;
  }

  if (inputs.scenario) {
    envObject.scenario = inputs.scenario;
  }

  return envObject;
}

module.exports.getK6CommandString = function getK6CommandString(inputs, config) {
  // Build the options string
  let optsString = '';
  Object.keys(config.cliOptions).forEach((opt) => {
    if (inputs[opt] && !config.cliOptions[opt].customOpt) optsString = `${optsString} -${opt} ${inputs[opt]}`;
  });

  if (inputs.n) {
    optsString = `${optsString} -i ${inputs.n}`;
  }

  if (inputs.influx) {
    optsString = `${optsString} --out influxdb=http://localhost:8086/${config.dbName}`
  }

  return `k6 run ${optsString} ../vucode/index.js`;
}

module.exports.getK6ChildProcess = function getK6ChildProcess(command, broadcastSettingsUrl, envObject) {
  return spawn(command, [], {
    cwd: path.dirname(__filename),
    env: envObject,
    shell: true,
    stdio: 'inherit',
  });
}
