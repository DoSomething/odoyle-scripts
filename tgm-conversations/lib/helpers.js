'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');

module.exports.formatMobileNumber = function (mobile, format = 'E164', countryCode = 'US') {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
  return phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
};
