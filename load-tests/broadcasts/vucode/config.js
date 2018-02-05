/**
 * @see https://docs.k6.io/v1.0/docs/environment-variables
 */
export default {

  /**
   * __ENV exposes the passed env variables from the parent process.
   * If we want to use them in the JS scope of the app, we need to extract into this
   * config object.
   */
  scenario: __ENV.scenario,
  delay: __ENV.delay,
  randomDelayMaxSecods: __ENV.randomDelayMaxSecods,
  blinkBroadcastWebhookUrl: __ENV.blinkBroadcastWebhookUrl,
  blinkBroadcastWebhookBody: JSON.parse(__ENV.blinkBroadcastWebhookBody),
  requestFailurePercent: __ENV.requestFailurePercent,
  requestFailureCount: __ENV.requestFailureCount,
  defaultNorthstarId: __ENV.defaultNorthstarId,
};
