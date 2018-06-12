'use strict';

const cliOptions = {
  b: { // eslint-disable-line id-length
    alias: 'broadcast',
    description: 'broadcast id that generated the unsubscribed users',
    nargs: 1,
    demandOption: true,
    requiresArg: true,
    string: true,
  },
};

const northstar = {
  rateLimit: {
    get: process.env.DS_NORTHSTAR_API_GET_REQUEST_PER_SEC || 1,
    update: process.env.DS_NORTHSTAR_API_UPDATE_REQUEST_PER_SEC || 1,
  },
  smsStatuses: {
    active: 'active',
    undeliverable: 'undeliverable',
  },
};

const MAX_LIMIT = 50000;
const DEFAULT_LIMIT = 10;
const twilioErrors = process.env.DS_TWILIO_ERROR_CODES || '30008,30006';
const query = {
  errorCodes: twilioErrors.split(','),
  direction: process.env.DS_GAMBIT_CONVERSATIONS_OUTBOUND_DIRECTION || 'outbound-api-send',
  limit: parseInt(process.env.DS_GAMBIT_CONVERSATIONS_RESULTS_LIMIT, 10) || DEFAULT_LIMIT,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};

module.exports = {
  cliOptions,
  northstar,
  query,
};
