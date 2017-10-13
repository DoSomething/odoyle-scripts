/**
 * @see https://docs.k6.io/docs/options
 * @see https://github.com/yargs/yargs/blob/master/docs/api.md#optionskey-opt
 */
module.exports = {
  'u': {
    description: 'A number specifying the number of VUs to run concurrently.',
    nargs: 1,
    demandOption: true,
  },
  'n': {
    alias: 'amount-of-phones',
    description: 'A number specifying the amount of phone numbers to try in this broadcast load test. \n Lower bound: +15551111110. \n Upper bound: +15552111110. \n Max of 1000000.',
    numArgs: 1,
    demandOption: true,
    customOpt: true,
    number: true,
  },
  's': {
    alias: 'scenario',
    description: 'The scenario to use. Check the README or vucode/index.js for more info.',
    nargs: 1,
    demandOption: true,
    choices: ['statusCallback', 'userResponse'],
    customOpt: true,
    requiresArg: true,
    string: true,
  },
  'd': {
    alias: 'delay',
    description: 'Delay the execution of the tests by x amunt of seconds on each iteration.',
    default: 0,
    number: true,
    nargs: 1,
    customOpt: true,
  },
  'I': {
    alias: 'influx',
    description: 'The name of the influx DB the script shoule use to save measurement results. If it doesn\'t exist, it will get created.',
    nargs: 1,
    customOpt: true,
    requiresArg: true,
    string: true,
  },
};
