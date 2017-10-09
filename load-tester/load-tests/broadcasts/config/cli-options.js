/**
 * @see https://docs.k6.io/docs/options
 * @see https://github.com/yargs/yargs/blob/master/docs/api.md#optionskey-opt
 */
module.exports = {
  'd': {
    describe: 'A string specifying the total duration a test run should be run for.',
    nargs: 1,
  },
  'i': {
    describe: 'A number specifying a fixed number of iterations to execute of the script.',
    nargs: 1,
  },
  'u': {
    description: 'A number specifying the number of VUs to run concurrently.',
    numArgs: 1,
    demandOption: true,
  },
};
