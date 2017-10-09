require('dotenv').config();

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const tacos = require('knock-knock-jokes');
const exec = require('child_process').exec;

const config = require(`./config`);

const inputs = yargs.options(config.cliOptions)
  .epilogue(tacos()).argv;

// Build the options string
let optsString = '';
Object.keys(config.cliOptions).forEach((opt) => {
  if (inputs[opt]) optsString = `${optsString} -${opt} ${inputs[opt]}`;
});

const command = `k6 run ${optsString} ./vucode/index.js`;
const k6ChildProcess = exec(command, {
  cwd: path.dirname(__filename),
  env: config.commandEnvVariables
});
k6ChildProcess.stdout.on('data', (data) => {
  console.log(data);
});
k6ChildProcess.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});
