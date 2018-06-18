'use strict';

const lookupBaseUri = process.env.TWILIO_LOOKUP_API_BASE_URI;
const fakeLookupBaseUri = process.env.FAKE_TWILIO_LOOKUP_API_BASE_URI;
const messagesBaseUri = process.env.TWILIO_MESSAGES_API_BASE_URI;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const accountToken = process.env.TWILIO_AUTH_TOKEN;
const lookupPath = 'PhoneNumbers';
const base64Token = Buffer.from(`${accountSid}:${accountToken}`).toString('base64');

const twilio = {
  useFakeTwilioLookup: process.env.USE_FAKE_TWILIO_LOOKUP_API === 'true',
  lookupApiUrl: `${lookupBaseUri}/${lookupPath}`,
  fakeLookupApiUrl: `${fakeLookupBaseUri}/${lookupPath}`,
  messagesApiUrl: `${messagesBaseUri}/${accountSid}/Messages`,
  accountSid,
  accountToken,
  auth: {
    header: 'Authorization',
    token: `Basic ${base64Token}`,
  },
};

const rateLimiter = {
  /**
   * anecdotally ~10 rps seems to work better. ~ 50 rps is no bueno.
   * Also, when using a Fake Lookup API. Be aware of the rate limits
   * of the service. This code assumes the use of Apiary for that.
   * Apiary limits at 120 requests per minute.
   */
  rps: process.env.REQUEST_RATE_LIMIT || 1,
};

const source = {
  name: process.env.SOURCE_NAME || 'source-test.csv',
};

module.exports = {
  twilio,
  rateLimiter,
  source,
};
