import http from 'k6/http';
import webSocket from "k6/ws";
import { sleep, check, fail, group } from 'k6';

import config from './config.js';
import requestHelper from './lib/helpers/request.js';
import Dispatcher from './lib/test-dispatcher/dispatcher.js';
import loadTests from './lib/test-dispatcher/tests.js';

/**
 * Utility functions -------------------------
 */

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
 * End Utility functions ------------------------- /
 */


/**
 * Main -------------------------
 */

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

    group('Test broadcast to Blink', () => {
      Dispatcher.execute(loadTests.broadcast({
        url: config.blinkBroadcastWebhookUrl,
        northstarId: config.defaultNorthstarId,
        /**
         * failure and
         * failureCount - Are implementation dependent.
         *                They only mean something if the application this test is POSTing to,
         *                uses these headers to allow a failure injection to produce errors.
         */
        // If equal to 0, then this request is a failure
        failure: shouldItFail(),
        failureCount: getFailureCount()
      }));
    });

  } else if (config.scenario === 'userResponse') {
    /**
     * TODO: Implement with V2 broadcast in mind. We are going to need a way to automate a test
     * userbase that we can use to send a broadcast to. Then, in parallel with a small delay, start
     * responding back to the imported messages. We were doing this by using a phone number generator.
     * Since broadcast V2 expects just a northstarId, it's a litt;e tougher to automate without a
     * list of correct staging northstar ids. Let's figure that out before implementing this test.
     * @see: https://github.com/DoSomething/gambit-conversations/pull/272
     */
  } else {
    failTest(`${config.scenario} is not a valid scenario!`);
  }
}

/**
 * End Main -------------------------/
 */
