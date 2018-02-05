import Command from './command.js';
import actions from './actions.js';
import requestHelper from '../helpers/request.js';

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
function genericTest(fn) {
  return (args) => {
    return fn(args);
  };
}

/**
 * broadcast loadTest
 *
 * @param  {object} args
 * @return {Command}
 */
module.exports.broadcast = function broadcast(args) {
  return new Command(
    genericTest(actions.broadcast),
    [args]);
};
