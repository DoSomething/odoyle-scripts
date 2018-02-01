import requestHelper from '../helpers/request.js';

module.exports.broadcast = function broadcast(args) {
  return requestHelper.postBroadcastBody(args.url, args.northstarId, args.failure, args.failureCount);
};
