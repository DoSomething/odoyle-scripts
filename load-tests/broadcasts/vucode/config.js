/**
 * @see https://docs.k6.io/v1.0/docs/environment-variables
 */

export default {
  getNextMobile: __ENV.getNextMobile,
  getNextUpdatedMobile: __ENV.getNextUpdatedMobile,
  wsBaseURI: __ENV.wsBaseURI,
  scenario: __ENV.scenario,
  delay: __ENV.delay,
  randomDelayMaxSecods: __ENV.randomDelayMaxSecods,
  statusCallbackUrl: __ENV.statusCallbackUrl,
  twilioInboundRelayUrl: __ENV.twilioInboundRelayUrl,
  statusCallbackRequestMock: {
    // We won't use them to avoid confusion. They're included for legacy support according to Twilio
    // SmsSid: 'SMxxx',
    // SmsStatus: 'sent',
    MessageStatus: 'sent',
    To: '+15555555555',
    MessagingServiceSid: 'MGxx',
    MessageSid: 'SM2xx',
    AccountSid: 'ACxx',
    From: '+15005550006',
    ApiVersion: '2010-04-01'
  },
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
