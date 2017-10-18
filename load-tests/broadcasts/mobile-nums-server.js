require('dotenv').config();

const config = require(`./config`);
const helpers = require('./lib/helpers');
const mobileNumberGen =  require('./lib/mobile-generator');
const mobileNumberGenServer = helpers.getMobileNumberGenServer(config.wsServerPort);
const mobileNumbers = [];

function getMobileNumberObj(next = true) {
  let obj = {};
  if (next) {
    obj.mobile = mobileNumberGen.next();
    obj.limitReached = mobileNumberGen.isLimitReached();
  } else {
    obj.mobile = mobileNumbers.shift();
    obj.drained = obj.mobile === undefined;
  }
  return obj;
}

function sendStringMessage(socket, message) {
  return socket.send(JSON.stringify(message));
}

mobileNumberGenServer.on('connection', (socket, req) => {
  socket.on('message', function incoming(message) {
    try {
      if (message === config.getNextMobile) {
        const mobileNumberObj = getMobileNumberObj(true);
        console.log(`${config.getNextMobile}:`, mobileNumberObj.mobile);
        mobileNumbers.push(mobileNumberObj.mobile);
        sendStringMessage(socket, mobileNumberObj);
      } else if (message === config.getNextUpdatedMobile) {
        setTimeout(() => {
          const mobileNumberObj = getMobileNumberObj(false);
          console.log(`${config.getNextUpdatedMobile}:`, mobileNumberObj.mobile);
          sendStringMessage(socket, mobileNumberObj);
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
