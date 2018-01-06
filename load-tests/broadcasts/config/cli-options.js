const validations = {
  above0: (val, input) => {
    if (val < 1) throw new Error(`${input} value must be above 0`);
    return val;
  },
  under100: (val, input) => {
    if (val > 100) throw new Error(`${input} value must be under 100`);
    return val;
  },
}

/**
 * @see https://docs.k6.io/docs/options
 * @see https://github.com/yargs/yargs/blob/master/docs/api.md#optionskey-opt
 */
module.exports = {
  'u': {
    description: 'A number specifying the number of VUs to run concurrently.',
    nargs: 1,
    demandOption: true,
    number: true,
    coerce: (val) => validations.above0(val, '-u')
  },
  'n': {
    alias: 'amount-of-phones',
    description: 'A number specifying the amount of phone numbers to try in this broadcast load test. \n Lower bound: +15551111110. \n Upper bound: +15559111110. \n Max of 8 Million.',
    nargs: 1,
    demandOption: true,
    customOpt: true,
    number: true,
    coerce: (val) => validations.above0(val, '-n')
  },
  's': {
    alias: 'scenario',
    description: 'The scenario to use. Check the README or vucode/index.js for more info.',
    nargs: 1,
    demandOption: true,
    choices: ['broadcast', 'userResponse'],
    customOpt: true,
    requiresArg: true,
    string: true,
  },
  'd': {
    alias: 'delay',
    description: 'Delay the execution of the tests by x amunt of seconds on each iteration. If you desire a random delay, type "random"',
    default: 0,
    string: true,
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
  'ng': {
    alias: 'not-generator',
    description: 'Don\'t use generator. Use mobile set in env variables for all tests',
    customOpt: true,
    type: 'boolean',
  },
  'rfp': {
    alias: 'request-failure-percent',
    nargs: 1,
    description: 'Percentage of requests that will fail in this test',
    customOpt: true,
    number: true,
    coerce: (val) => {
      return validations.under100(validations.above0(val, '--rfp'), '--rfp');
    }
  },
  'rfc': {
    alias: 'request-failure-count',
    nargs: 1,
    description: 'Times that this request will be retried.',
    customOpt: true,
    number: true,
    coerce: (val) => {
      return validations.under100(validations.above0(val, '--rfc'), '--rfc');
    }
  }
};
