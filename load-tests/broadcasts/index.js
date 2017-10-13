require('dotenv').config();

const yargs = require('yargs');
const tacos = require('knock-knock-jokes');

const config = require(`./config`);
const mobileNumberGen =  require('./lib/mobile-generator');
const helpers = require('./lib/helpers');

const mobileNumberGenServer = helpers.getMobileNumberGenServer(config.wsServerPort);
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
    console.log(`last number: ${mobileNumberGen.getLast()}`, `Processed ${mobileNumberGen.getCount()} numbers.`);
    helpers.closeServer(mobileNumberGenServer, () => process.exit(code));
  });

  childProcess.on('error', (error) => {
    console.log('Error: failed to start subprocess.', error);
    helpers.closeServer(mobileNumberGenServer, () => process.exit(1));
  });

  mobileNumberGenServer.on('connection', (socket, req) => {
    socket.on('message', function incoming(messageFromTest) {
      if (messageFromTest === config.nextNumberMessage) {
        socket.send(JSON.stringify({
          mobile: mobileNumberGen.next(),
          limitReached: mobileNumberGen.isLimitReached(),
        }));
      }
    });
  });

  mobileNumberGenServer.on('error', (error) => {
    console.log('Error: mobileNumberGenServer crashed.', error);
    helpers.closeServer(mobileNumberGenServer, () => process.exit(1));
  });

  process.on('SIGINT', () => {
    process.kill(childProcess.pid, 'SIGKILL');
    helpers.closeServer(mobileNumberGenServer, () => process.exit(0));
  });
})();
