require('dotenv').config();

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const tacos = require('knock-knock-jokes');
const spawn = require('child_process').spawn;

const config = require(`./config`);

const inputs = yargs.options(config.cliOptions)
  .epilogue(tacos()).argv;

// Build the options string
let optsString = '';
Object.keys(config.cliOptions).forEach((opt) => {
  if (inputs[opt] && !config.cliOptions[opt].customOpt) optsString = `${optsString} -${opt} ${inputs[opt]}`;
});

if (inputs.influx) {
  optsString = `${optsString} --out influxdb=http://localhost:8086/${config.dbName}`
}

const command = `k6 run ${optsString} ./vucode/index.js`;
const k6ChildProcess = spawn(command, [], {
  cwd: path.dirname(__filename),
  env: config.commandEnvVariables,
  shell: true,
  stdio: 'inherit'
});
k6ChildProcess.on('close', (code) => {
  console.log(`\nk6ChildProcess exited with code ${code}`);
});
k6ChildProcess.on('error', (error) => {
  console.log('Failed to start subprocess.');
  console.log(error);
});
