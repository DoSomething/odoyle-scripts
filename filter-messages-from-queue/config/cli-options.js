const validations = {}

module.exports = {
  'f': {
    alias: 'filter',
    description: 'Filter to be used to process queue.',
    nargs: 1,
    demandOption: true,
    choices: ['niche-import-same-or-after-date'],
    requiresArg: true,
    string: true,
  },
};
