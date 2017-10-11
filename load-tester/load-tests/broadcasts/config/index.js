const cliOptions = require('./cli-options');

const config = {
  cliOptions,
};

const broadcastSettingsBaseUrl = process.env.DS_CONVERSATIONS_BROADCASTS_SETTINGS_URL || 'http://puppet:totallysecret@localhost:5100/api/v1/broadcast-settings';
const broadcastId = process.env.DS_CONVERSATIONS_BROADCAST_ID || 'tacosfest';

config.commandEnvVariables = {
  broadcastSettingsBaseUrl,
  broadcastId,
};

config.dbName = 'broadcastsLoadTesting';

module.exports = config;
