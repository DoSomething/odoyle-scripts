require('dotenv').config();

// TODO: DRY this script in general

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const tacos = require('knock-knock-jokes');
const spawn = require('child_process').spawn;
const WebSocket = require('ws');

const config = require(`./config`);
const mobileNumberGenerator =  require('./lib/mobile-generator');

const mobileNumberGeneratorServer = new WebSocket.Server({ port: config.wsServerPort });

mobileNumberGeneratorServer.on('connection', (ws, req) => {
  ws.on('message', function incoming(message) {
    if (message === 'number') {
      ws.send(mobileNumberGenerator.next());
    }
  });
});

const inputs = yargs.options(config.cliOptions)
  .epilogue(tacos()).argv;

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

const command = `k6 run ${optsString} ./vucode/index.js`;

let k6ChildProcess;
( async function (url, inputs) {

  let res;

  try {
    res = await axios.get(url);
  } catch (e) {
    console.log(e);
    process.exit(2);
  }

  const env = {
    statusCallbackUrl: res.data.webhook.statusCallbackUrl,
  };

  if (inputs.delay) {
    env.delay = inputs.delay;
  }

  if (inputs.scenario) {
    env.scenario = inputs.scenario;
  }

  k6ChildProcess = spawn(command, [], {
    cwd: path.dirname(__filename),
    env,
    shell: true,
    stdio: 'inherit',
  });

  k6ChildProcess.on('close', (code) => {
    console.log(`\nk6ChildProcess exited with code ${code}`);
    console.log(`last number: ${mobileNumberGenerator.getCurrent()}`, `Processed ${mobileNumberGenerator.getCount()} numbers.`);
    mobileNumberGeneratorServer.close(() => {
      process.exit(0);
    });
  });

  k6ChildProcess.on('error', (error) => {
    console.log('Failed to start subprocess.');
    console.log(error);
  });

})(config.broadcastSettingsUrl, inputs);

process.on('SIGINT', () => {
  process.kill(k6ChildProcess.pid, 'SIGKILL');
  mobileNumberGeneratorServer.close(() => {
    process.exit(0);
  });
});
