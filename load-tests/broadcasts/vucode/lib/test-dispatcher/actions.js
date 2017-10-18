import requestHelper from '../helpers/request.js';

module.exports.statusCallback = function statusCallback(args) {
  return requestHelper.postStatusCallbackMock(args.url, args.mobile);
};

module.exports.userResponse = function userResponse(args) {
  return requestHelper.postUserResponseMock(args.url, args.mobile, args.text);
};
