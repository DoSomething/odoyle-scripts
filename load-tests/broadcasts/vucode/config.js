/**
 * @see https://docs.k6.io/v1.0/docs/environment-variables
 */
export default {

  /**
   * __ENV exposes the passed env variables from the parent process.
   * If we want to use them in the JS scope of the app, we need to extract into this
   * config object.
   */
  getNextTestMobile: __ENV.getNextTestMobile,
  getNextUsedTestMobile: __ENV.getNextUsedTestMobile,
  wsBaseURI: __ENV.wsBaseURI,
  scenario: __ENV.scenario,
  delay: __ENV.delay,
  randomDelayMaxSecods: __ENV.randomDelayMaxSecods,
  blinkBroadcastWebhookUrl: __ENV.blinkBroadcastWebhookUrl,
  blinkBroadcastWebhookBody: JSON.parse(__ENV.blinkBroadcastWebhookBody),
  twilioInboundRelayUrl: __ENV.twilioInboundRelayUrl,
  useMobileGenerator: __ENV.useMobileGenerator,
  defaultMobileToTest: __ENV.defaultMobileToTest,
  userResponseRequestMock: {
    // We won't use them to avoid confusion. They're included for legacy support according to Twilio
    // SmsSid: 'SMxx',
    // SmsStatus: 'received',
    ToCountry: 'US',
    ToState: 'IL',
    SmsMessageSid: 'SMxx',
    NumMedia: '0',
    ToCity: 'CHICAGO',
    FromZip: '10710',
    FromState: 'NY',
    FromCity: 'YONKERS',
    Body: 'Hola',
    FromCountry: 'US',
    To: '+15005550006',
    MessagingServiceSid: 'MGxx',
    ToZip: '60610',
    NumSegments: '1',
    MessageSid: 'SMxx',
    AccountSid: 'ACxx',
    From: '+15555555555',
    ApiVersion: '2010-04-01'
  }
};
