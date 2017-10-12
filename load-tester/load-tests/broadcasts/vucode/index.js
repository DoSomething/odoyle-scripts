import http from 'k6/http';
import { sleep, check } from 'k6';

import config from './config.js';
import MobileNumberGenerator from './lib/helpers/mobile-generator.js';
import requestHelper from './lib/helpers/request.js';
import Dispatcher from './lib/test-dispatcher/dispatcher.js';
import loadTests from './lib/test-dispatcher/tests.js';

const mobileNumberGenerator = new MobileNumberGenerator();

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  // Twilio to Blink (statusCallback) load test
  if (config.scenario === 'statusCallback') {
    Dispatcher.execute(loadTests.twilioToBlink({
      url: config.statusCallbackUrl,
      mobile: mobileNumberGenerator.next()
    }));
  }

  // TODO: Twilio to Blink (User response) load test

  // TODO: Twilio to Blink (statusCallback) - Twilio to Blink (User response)
}
