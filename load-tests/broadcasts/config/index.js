const cliOptions = require('./cli-options');

const config = {
  cliOptions,
};

const broadcastSettingsBaseUrl = process.env.DS_CONVERSATIONS_BROADCAST_SETTINGS_URL || 'http://puppet:totallysecret@localhost:5100/api/v1/broadcast-settings';
const broadcastId = process.env.DS_CONVERSATIONS_BROADCAST_ID || 'tacosfest';

config.broadcastSettingsUrl = `${broadcastSettingsBaseUrl}/${broadcastId}`;
config.dbName = 'broadcastsLoadTesting';
config.wsServerPort = process.env.MOBILE_NUMBER_GENERATOR_SERVER_PORT || 3200;
config.wsBaseURI = `ws://localhost:${config.wsServerPort}`;
config.getNextTestMobile = 'nextMobile';
config.getNextUsedTestMobile = 'nexUpdatedMobile';
config.twilioInboundRelayUrl = process.env.DS_BLINK_SMS_INBOUND_RELAY_URL || 'http://puppet:totallysecret@localhost:5050/api/v1/webhooks/twilio-sms-inbound';
config.randomDelayMaxSecods = process.env.RANDOM_DELAY_MAX_SECONDS || 60; // 1 min

module.exports = config;
