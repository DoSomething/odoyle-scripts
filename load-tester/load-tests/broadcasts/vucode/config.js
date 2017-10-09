/**
 * @see https://docs.k6.io/v1.0/docs/environment-variables
 */

export default {
  broadcastSettingsUrl: `${__ENV.broadcastSettingsBaseUrl}/${__ENV.broadcastId}`,
  statusCallbackRequestMock: {
    // We won't use them to avoid confusion. They're included for legacy support according to Twilio
    // SmsSid: "SM209da8432cb84d549916f703ef9eb3e4",
    // SmsStatus: "sent",
    MessageStatus: "sent",
    To: "+19144107389",
    MessagingServiceSid: "MGd8b9511cf6b463b673a6ce660a08ef3d",
    MessageSid: "SM209da8432cb84d549916f703ef9eb3e4",
    AccountSid: "AC54a6683e7e5a2232aa9679003e84a685",
    From: "+13056152849",
    ApiVersion: "2010-04-01"
  },

};
