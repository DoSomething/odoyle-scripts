const cliOptions = require('./cli-options');

const config = {
  cliOptions,
};

const broadcastSettingsBaseUrl = process.env.DS_CONVERSATIONS_BROADCAST_SETTINGS_URL || 'http://puppet:totallysecret@localhost:5100/api/v1/broadcasts';
const broadcastId = process.env.DS_CONVERSATIONS_BROADCAST_ID || '7zU0Mb1k9GkWWI40o06Mic';

config.broadcastSettingsUrl = `${broadcastSettingsBaseUrl}/${broadcastId}`;
config.dbName = 'broadcastsLoadTesting';
config.defaultNorthstarId = process.env.DEFAULT_NORTHSTAR_ID || 'puppetTest';

module.exports = config;
