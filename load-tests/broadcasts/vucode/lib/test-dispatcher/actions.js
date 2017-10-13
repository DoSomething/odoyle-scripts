import requestHelper from '../helpers/request.js';

module.exports.statusCallback = function statusCallback(args) {
  requestHelper.postTwilioRequestMocks(args.url, args.mobile);
};

module.exports.userResponse = function userResponse(args) {
  // TODO: Implement
};
