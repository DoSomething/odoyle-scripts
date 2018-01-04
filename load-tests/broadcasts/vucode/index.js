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

function getDelay() {
  let delay = 0;
  if (config.delay) {
    if (config.delay === 'random') {

      /**
       * The 2.5 constant is there to prevent the userResponse script from starting faster than the statusCallback,
       * I want both scripts to be completely independent of each other in the future, but it's OK for this MVP.
       */
      delay = Math.floor(Math.random() * parseFloat(config.randomDelayMaxSecods) + 2.5);
    } else {
      delay = parseFloat(config.delay);
    }
  }
  return delay;
}

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  const delay = getDelay();

  if (config.scenario === 'statusCallback') {

    if (delay) {
      sleep(delay);
    }

    let mobileNumberObj;

    /**
     * Gets the next number available to test
     * TODO: DRY
     * @see https://k6.readme.io/docs/k6-websocket-api
     */
    const res = webSocket.connect(config.wsBaseURI, {}, (socket) => {
      socket.on('open', function open() {
        socket.on('message', function (mobileObj) {
          mobileNumberObj = JSON.parse(mobileObj);
          socket.close();
        });
        socket.send(config.getNextTestMobile);
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


    if (delay) {
      sleep(delay);
    }

    let mobileNumberObj;
    let drained = false;

    /**
     * Gets the next updated number available to test
     * TODO: DRY
     * @see https://k6.readme.io/docs/k6-websocket-api
     */
    const res = webSocket.connect(config.wsBaseURI, {}, (socket) => {
      socket.on('open', function open() {
        socket.on('message', function (mobileObj) {
          mobileNumberObj = JSON.parse(mobileObj);
          drained = mobileNumberObj.drained;
          socket.close();
        });
        socket.send(config.getNextUsedTestMobile);
      });
    });

    if (drained) failTest(`Error: Mobile number generator drained.`);

    group('Test user responses to Blink', () => {
      Dispatcher.execute(loadTests.userResponse({
        url: config.twilioInboundRelayUrl,
        mobile: mobileNumberObj.mobile,
        text: Math.floor(Math.random() * 2) ? 'Y' : 'N',
      }));
    });

  } else {
    failTest(`${config.scenario} is not a valid scenario!`);
  }
}
