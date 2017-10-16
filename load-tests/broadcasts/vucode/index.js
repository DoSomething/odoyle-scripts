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

  if (config.scenario === 'statusCallback') {


    let mobileNumberObj;

    /**
     * Gets the next number available to test
     * @see https://k6.readme.io/docs/k6-websocket-api
     */
    const res = webSocket.connect(config.wsBaseURI, {}, (socket) => {
      socket.on('open', function open() {
        socket.on('message', function (mobileObj) {
          mobileNumberObj = JSON.parse(mobileObj);
          socket.close();
        });
        socket.send(config.getNextMobile);
      });
    });

    if (mobileNumberObj.limitReached) failTest(`Error: Mobile number generator drained. Maximum number reached.`);

    group('Test statusCallbacks to Blink', () => {
      Dispatcher.execute(loadTests.statusCallback({
        url: config.statusCallbackUrl,
        mobile: mobileNumberObj.mobile,
      }));
    });
  } else if (config.scenario === 'userResponse') {

    let mobileNumberObj;
    let drained = false;

    /**
     * Gets the next updated number available to test
     * @see https://k6.readme.io/docs/k6-websocket-api
     */
    const res = webSocket.connect(config.wsBaseURI, {}, (socket) => {
      socket.on('open', function open() {
        socket.on('message', function (mobileObj) {
          if (mobileObj === 'drained') {
            drained = true;
          } else {
            mobileNumberObj = JSON.parse(mobileObj);
          }
          socket.close();
        });
        socket.send(config.getNextUpdatedMobile);
      });
    });

    if (drained) failTest(`Error: Mobile number generator drained.`);

    group('Test user responses to Blink', () => {
      Dispatcher.execute(loadTests.userResponse({
        url: config.twilioInboundRelayUrl,
        mobile: mobileNumberObj.mobile,
      }));
    });
  } else {
    failTest(`${config.scenario} is not a valid scenario!`);
  }
}
