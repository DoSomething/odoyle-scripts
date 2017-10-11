/**
 * @see https://docs.k6.io/v1.0/docs/environment-variables
 */

export default {
  broadcastSettingsUrl: `${__ENV.broadcastSettingsBaseUrl}/${__ENV.broadcastId}`,
  statusCallbackRequestMock: {
    // We won't use them to avoid confusion. They're included for legacy support according to Twilio
    // SmsSid: "SMxxx",
    // SmsStatus: "sent",
    MessageStatus: "sent",
    To: "+15555555555",
    MessagingServiceSid: "MGxx",
    MessageSid: "SM2xx",
    AccountSid: "ACxx",
    From: "+15555555555",
    ApiVersion: "2010-04-01"
  },

};
