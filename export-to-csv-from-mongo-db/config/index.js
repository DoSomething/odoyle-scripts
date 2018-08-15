'use strict';

const cliOptions = {
  s: { // eslint-disable-line id-length
    alias: 'script',
    description: 'Script name',
    /**
     * If the script is registered here, it must exists in the /scripts folder w/ exact same name
     */
    choices: ['sids-by-broadcast-and-error-code'],
    nargs: 1,
    demandOption: true,
    requiresArg: true,
    string: true,
  },
};

module.exports = {
  cliOptions,
};
