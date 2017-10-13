import Command from './command.js';
import actions from './actions.js';

/**
 * Decorators
 */

 /**
  * Decorator.
  * Returns passed function wrapped with functionality.
  *
  * @param  {function} fn function to be wrapped.
  * @return {function}    wrapped function
  */
function loadTest(fn) {
  return (args) => {
    return fn(args);
  };
}

/**
 * statusCallback loadTest
 *
 * @param  {object} args
 * @return {Command}
 */
module.exports.statusCallback = function statusCallback(args) {
  return new Command(
    loadTest(actions.statusCallback),
    [args]);
};

/**
 * userResponse loadTest
 *
 * @param  {object} args
 * @return {Command}
 */
module.exports.userResponse = function userResponse(args) {
  return new Command(
    loadTest(actions.userResponse),
    [args]);
};
