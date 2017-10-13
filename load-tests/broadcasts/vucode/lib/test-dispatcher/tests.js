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
 * Ends conversation with user
 * It responds with a custom message
 *
 * @param  {object} args
 * @return {Command}
 */
module.exports.twilioToBlink = function twilioToBlink(args) {
  return new Command(
    loadTest(actions.twilioToBlink),
    [args]);
};
