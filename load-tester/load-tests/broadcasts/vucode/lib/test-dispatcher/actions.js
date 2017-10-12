import requestHelper from '../helpers/request.js';

module.exports.twilioToBlink = function twilioToBlink(args) {
  requestHelper.postTwilioRequestMocks(args.url, args.mobile);
};
