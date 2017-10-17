require('dotenv').config();

const config = require(`./config`);
const helpers = require('./lib/helpers');
const mobileNumberGen =  require('./lib/mobile-generator');
const mobileNumberGenServer = helpers.getMobileNumberGenServer(config.wsServerPort);
const mobileNumbers = [];

mobileNumberGenServer.on('connection', (socket, req) => {
  socket.on('message', function incoming(message) {
    try {
      if (message === config.getNextMobile) {
        const mobile = mobileNumberGen.next();
        const mobileNumberObj = {
          mobile,
          limitReached: mobileNumberGen.isLimitReached()
        };
        console.log(`${config.getNextMobile}:`, mobile);
        mobileNumbers.push(mobile);
        socket.send(JSON.stringify(mobileNumberObj));
      } else if (message === config.getNextUpdatedMobile) {
        setTimeout(() => {
          const mobileNumberObj = {
            mobile: mobileNumbers.shift(),
          };
          console.log(`${config.getNextUpdatedMobile}:`, mobileNumberObj.mobile);
          socket.send(mobileNumberObj.mobile ? JSON.stringify(mobileNumberObj) : 'drained');
        }, 100);
      }
    } catch (error) {
      console.log(`mobileNumberGenServer.on('message') catched error:`, error);
      helpers.closeServer(
        mobileNumberGenServer,
        () => helpers.killChildProcess(childProcess.pid, process.exit, [1]));
    }
  });
});

mobileNumberGenServer.on('error', (error) => {
  console.log(`mobileNumberGenServer.on('error'): Closing server and killing child processes.`, error);
  helpers.closeServer(
    mobileNumberGenServer,
    () => helpers.killChildProcess(childProcess.pid, process.exit, [1]));
});
