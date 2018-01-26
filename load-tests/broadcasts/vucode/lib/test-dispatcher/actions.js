import requestHelper from '../helpers/request.js';

module.exports.broadcast = function broadcast(args) {
  return requestHelper.postBroadcastBody(args.url, args.mobile, args.failure, args.failureCount);
};

module.exports.userResponse = function userResponse(args) {
  return requestHelper.postUserResponseMock(args.url, args.mobile, args.text);
};
