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
 * Decorator.
 * Returns passed function wrapped with functionality.
 *
 * @param  {function} fn function to be wrapped.
 * @return {function}    wrapped function
 */
function userResponseTest(fn) {
 return (args) => {
   const res = fn(args);
   requestHelper.checkUserResponseStatusCode(res);
   return res;
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

/**
 * userResponse loadTest
 *
 * @param  {object} args
 * @return {Command}
 */
module.exports.userResponse = function userResponse(args) {
  return new Command(
    userResponseTest(actions.userResponse),
    [args]);
};
