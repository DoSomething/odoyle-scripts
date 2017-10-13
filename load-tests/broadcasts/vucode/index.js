import http from 'k6/http';
import ws from "k6/ws";
import { sleep, check, fail, group } from 'k6';

import config from './config.js';
import requestHelper from './lib/helpers/request.js';
import Dispatcher from './lib/test-dispatcher/dispatcher.js';
import loadTests from './lib/test-dispatcher/tests.js';

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  let mobile;
  const res = ws.connect('ws://localhost:3200', {}, (socket) => {
    socket.on('open', function open() {
      socket.on('message', function (number) {
        mobile = number;
        socket.close();
      });

      socket.send('number');
    });
  });

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
    fail(`${config.scenario} is not a valid scenario!`);
  }

}
