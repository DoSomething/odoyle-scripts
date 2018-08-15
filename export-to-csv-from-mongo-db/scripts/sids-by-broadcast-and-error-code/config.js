'use strict';

const config = {};

const twilioErrors = process.env.SCRIPT_DS_TWILIO_ERROR_CODES || '30008,30006';
config.errorCodes = twilioErrors.split(',');
config.broadcastId = process.env.SCRIPT_CONTENTFUL_BROADCAST_ID;

module.exports = config;
