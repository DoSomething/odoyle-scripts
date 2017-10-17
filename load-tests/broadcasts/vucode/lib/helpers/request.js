import http from 'k6/http';
import { check } from 'k6';
import _ from '../bundles/underscore.bundle.js';

import config from '../../config.js';

function post(url, payload, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' }
  };
  const opts = _.extend({}, defaults, options);
  return http.post(url, payload, opts);
}

/**
 * StatusCallback
 */

function checkStatusCallbackUpdates(res, status, code = 200) {
  const object = {};
  object[`sendingStatusCallbackStatusUpdate${status}${code}`] = (res) => res.status === code;
  check(res, object);
}
function getStatusCallbackMock(mobile, status = queued) {
  const mock = _.extend({}, config.statusCallbackRequestMock);
  mock.MessageStatus = status;
  mock.To = mobile;
  const body = JSON.stringify(mock);
  return body;
}
function postStatusCallbackMock(url, mobile) {
  const queuedRes = post(url, getStatusCallbackMock(mobile, 'queued'));
  const sentRes = post(url, getStatusCallbackMock(mobile, 'sent'));
  const deliveredRes = post(url, getStatusCallbackMock(mobile, 'delivered'));
  checkStatusCallbackUpdates(queuedRes, 'Queued', 204);
  checkStatusCallbackUpdates(sentRes, 'Sent', 204);
  checkStatusCallbackUpdates(deliveredRes, 'Delivered', 204);
}

/**
 * User Response
 */

function checkUserResponse(res, code = 200) {
  const object = {};
  object[`sendingUserResponse${code}`] = (res) => res.status === code;
  check(res, object);
}
function checkUserResponseOutboundTemplate(res, template) {
  if (res.status !== 200) return;
  const object = {};
  const body = JSON.parse(res.body);
  const data = body.data || { messages: {}};
  const outboundMessages = data.messages.outbound || [{}];
  object[`gotUserResponseTemplate-${template}`] = (res) => outboundMessages[0].template === template;
  check(res, object);
}
function getUserResponseMock(mobile) {
  const mock = _.extend({}, config.userResponseRequestMock);
  mock.From = mobile;
  // TODO make this dynamic (ramdom Y/N)
  mock.Body = 'N';
  const body = JSON.stringify(mock);
  return body;
}
// TODO Make it dynamic to test templates based on the Body of the mock
function postUserResponseMock(url, mobile) {
  const res = post(url, getUserResponseMock(mobile));
  checkUserResponse(res);
  checkUserResponseOutboundTemplate(res, 'declinedSignup')
}

module.exports = {
  post,
  checkStatusCallbackUpdates,
  getStatusCallbackMock,
  postStatusCallbackMock,
  checkUserResponse,
  checkUserResponseOutboundTemplate,
  getUserResponseMock,
  postUserResponseMock,
};
