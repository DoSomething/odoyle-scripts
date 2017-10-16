require('dotenv').config();

const yargs = require('yargs');
const tacos = require('knock-knock-jokes');

const config = require(`./config`);
const helpers = require('./lib/helpers');

const userInput = yargs.options(config.cliOptions).epilogue(tacos()).argv;
const command = helpers.getK6CommandString(userInput, config);

(async () => {
  const k6EnvObject = await helpers.getK6EnvObject(userInput, config);
  const childProcess = helpers.getK6ChildProcess(command, config.broadcastSettingsUrl, k6EnvObject);

  /**
   * Event listeners
   */

  childProcess.on('close', (code) => {
    console.log(`\nk6ChildProcess exited with code ${code}`);
    process.exit(code);
  });

  childProcess.on('error', (error) => {
    console.log('Error: failed to start subprocess.', error);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log(`process.on('SIGINT'): Closing server and killing child processes.`);
    helpers.killChildProcess(childProcess.pid, process.exit, [0]);
  });
})();
