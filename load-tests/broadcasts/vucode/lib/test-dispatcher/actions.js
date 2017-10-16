import requestHelper from '../helpers/request.js';

module.exports.statusCallback = function statusCallback(args) {
  requestHelper.postStatusCallbackMock(args.url, args.mobile);
};

module.exports.userResponse = function userResponse(args) {
  requestHelper.postUserResponseMock(args.url, args.mobile);
};
