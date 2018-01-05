require('dotenv').config();

const config = require(`./config`);
const helpers = require('./lib/helpers');
const mobileNumberGen =  require('./lib/mobile-generator');
const mobileNumberGenServer = helpers.getMobileNumberGenServer(config.wsServerPort);

// TODO: implement inside the MobileNumberGenerator class
const mobileNumbers = [];

function getMobileNumberObj(next = true) {
  let obj = {};
  if (next) {
    obj.mobile = mobileNumberGen.next();
    obj.limitReached = mobileNumberGen.isLimitReached();
    obj.count = mobileNumberGen.getCount();
  } else {
    obj.mobile = mobileNumbers.shift();
    obj.drained = obj.mobile === undefined;
  }
  return obj;
}

function respond(socket, message) {
  return socket.send(JSON.stringify(message));
}

mobileNumberGenServer.on('listening', () => console.log('Server has been bound.\nAwaiting connections.'));

// When a WebSocket client connects to the server
mobileNumberGenServer.on('connection', (socket, req) => {
  // When receiving a message through the connected socket.
  socket.on('message', function incoming(message) {
    try {
      if (message === config.getNextTestMobile) {
        const mobileNumberObj = getMobileNumberObj(true);
        console.log(`generated mobile: ${mobileNumberObj.mobile}. Count: ${mobileNumberObj.count}`);
        mobileNumbers.push(mobileNumberObj.mobile);
        respond(socket, mobileNumberObj);
      } else if (message === config.getNextUsedTestMobile) {
        setTimeout(() => {
          const mobileNumberObj = getMobileNumberObj(false);
          console.log(`processing next available number: ${mobileNumberObj.mobile}.`);
          respond(socket, mobileNumberObj);
        }, 100);
      }
    } catch (error) {
      console.log(`mobileNumberGenServer.on('connection') -> socket.on('message') error:`, error);
      helpers.closeServer(mobileNumberGenServer);
    }
  });
});

// Closes the server when an error is detected (terminates all clients, calls callback when done).
mobileNumberGenServer.on('error', (error) => {
  console.log(`mobileNumberGenServer.on('error'): Closing server and killing child processes.`, error);
  helpers.closeServer(mobileNumberGenServer);
});
