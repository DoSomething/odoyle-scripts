import http from 'k6/http';
import webSocket from "k6/ws";
import { sleep, check, fail, group } from 'k6';

import config from './config.js';
import requestHelper from './lib/helpers/request.js';
import Dispatcher from './lib/test-dispatcher/dispatcher.js';
import loadTests from './lib/test-dispatcher/tests.js';


/**
 * failTest
 *
 * @param  {string} msg
 */
function failTest(msg) {
  fail(msg);
}


/**
 * getDelay
 *
 * @return {float|integer}  delay
 */
function getDelay() {
  let delay = 0;
  if (config.delay) {
    if (config.delay === 'random') {

      /**
       * The 2.5 constant is there to prevent the userResponse script from starting faster than other scripts,
       * Ideally both scripts should be completely independent of each other in the future, but it's OK for this MVP.
       */
      delay = Math.floor(Math.random() * parseFloat(config.randomDelayMaxSecods) + 2.5);
    } else {
      delay = parseFloat(config.delay);
    }
  }
  return delay;
}

function shouldItFail() {
  const percent = parseInt(config.requestFailurePercent);
  /**
   * This is an probabilistic approximation to the percentage rate we are looking for.
   * It's not guaranteed, nor accurate for any other purpose than plausible approximation.
   *
   * If we wanted a 25% failure rate, we calculate it this way:
   *  - Calculate in how many pieces we have to cut the pie (100%) in order for one of the pieces
   *    to be the percentage we want. 100/25 = 4 (4 pieces - one piece represents 25%).
   *  - Now we get a random number from 0-1 and multiply by the pieces. (Math.random())
   *  - This leaves us with a number from 0.x to 3.x
   *    (still a 4 piece pie, its just 0 based, like array indexes)
   *  - We don't need the decimals so we just strip them off (Math.floor())
   *  - If the result is 0, then it's the 1/4th piece of the pie, which means is the 25th percentile result. - Profit.
   */
  return percent ? Math.floor(Math.random() * (100/percent)) === 0 : false;
}

function getFailureCount() {
  const count = parseInt(config.requestFailureCount);
  return count || 1;
}

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  const delay = getDelay();

  if (config.scenario === 'broadcast') {
    if (delay) {
      sleep(delay);
    }

    let mobileNumberObj;

    if (config.useMobileGenerator === 'true') {
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
    }

    group('Test broadcast to Blink', () => {
      Dispatcher.execute(loadTests.broadcast({
        url: config.blinkBroadcastWebhookUrl,
        mobile: mobileNumberObj ? mobileNumberObj.mobile : config.defaultMobileToTest,
        /**
         * failure and
         * failureCount - Are implementation dependent.
         *                They only mean something if the application
         *                Blink relays this message to, uses these headers to allow a failure
         *                injection to produce errors. Blink will send both headers:
         *                `x-request-failure` and `x-request-failure-count` - (subject to change), to
         *                the application receiving this request. In this case: Gambit Conversations.
         */
        // If equal to 0, then this request is a failure
        failure: shouldItFail(),
        failureCount: getFailureCount()
      }));
    });

  } else if (config.scenario === 'userResponse') {


    if (delay) {
      sleep(delay);
    }

    let mobileNumberObj;
    let drained = false;

    if (config.useMobileGenerator === 'true') {

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
    }

    group('Test user responses to Blink', () => {
      Dispatcher.execute(loadTests.userResponse({
        url: config.twilioInboundRelayUrl,
        mobile: mobileNumberObj ? mobileNumberObj.mobile : config.defaultMobileToTest,
        text: Math.floor(Math.random() * 2) ? 'Y' : 'N',
      }));
    });

  } else {
    failTest(`${config.scenario} is not a valid scenario!`);
  }
}
