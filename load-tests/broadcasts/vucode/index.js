import http from 'k6/http';
import webSocket from "k6/ws";
import { sleep, check, fail, group } from 'k6';

import config from './config.js';
import requestHelper from './lib/helpers/request.js';
import Dispatcher from './lib/test-dispatcher/dispatcher.js';
import loadTests from './lib/test-dispatcher/tests.js';

function failTest(msg) {
  fail(msg);
}

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  let mobile;
  let limitReached;
  const res = webSocket.connect(config.wsBaseURI, {}, (socket) => {
    socket.on('open', function open() {
      socket.on('message', function (numberObj) {
        const nextNumberObj = JSON.parse(numberObj);
        if (nextNumberObj.limitReached) {
          limitReached = true;
        } else {
          mobile = nextNumberObj.mobile;
        }
        socket.close();
      });
      socket.send(config.nextNumberMessage);
    });
  });

  if (limitReached) failTest(`Error: Mobile number generator drained. Maximum number reached.`);

  // TODO: Twilio to Blink (User response) load test

  // TODO: Twilio to Blink (statusCallback) - Twilio to Blink (User response)

  // Twilio to Blink (statusCallback) load test
  if (config.scenario === 'statusCallback') {
    group('Test statusCallbacks to Blink', () => {
      Dispatcher.execute(loadTests.twilioToBlink({
        url: config.statusCallbackUrl,
        mobile,
      }));
    });
  } else {
    failTest(`${config.scenario} is not a valid scenario!`);
  }
}
