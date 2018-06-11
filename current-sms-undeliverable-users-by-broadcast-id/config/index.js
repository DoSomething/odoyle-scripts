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
  requestsPerSecond: process.env.DS_NORTHSTAR_API_REQUEST_PER_SEC || 1,
};

const twilioErrors = process.env.DS_TWILIO_ERROR_CODES || '30008,30006';
const query = {
  errorCodes: twilioErrors.split(','),
  direction: process.env.DS_GAMBIT_CONVERSATIONS_OUTBOUND_DIRECTION || 'outbound-api-send',
};

module.exports = {
  cliOptions,
  northstar,
  query,
};
