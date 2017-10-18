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

function checkUserResponseStatusCode(res, code = 200) {
  const object = {};
  object[`sendingUserResponse${code}`] = (res) => res.status === code;
  check(res, object);
}
function checkUserResponseOutboundTemplate(res) {
  if (res.status !== 200) return;
  const object = {};
  const body = JSON.parse(res.body);
  const data = body.data || { messages: {}};
  const outboundMessages = data.messages.outbound || [{}];
  object[`gotUserResponseTemplate-${outboundMessages[0].template}`] = (res) =>
    outboundMessages[0].template === outboundMessages[0].template;
  check(res, object);
}
function getUserResponseMock(mobile, text = 'N') {
  const mock = _.extend({}, config.userResponseRequestMock);
  mock.From = mobile;
  mock.Body = text;
  const body = JSON.stringify(mock);
  return body;
}
function postUserResponseMock(url, mobile, text) {
  return post(url, getUserResponseMock(mobile, text));
}

module.exports = {
  post,
  checkStatusCallbackUpdates,
  getStatusCallbackMock,
  postStatusCallbackMock,
  checkUserResponseStatusCode,
  checkUserResponseOutboundTemplate,
  getUserResponseMock,
  postUserResponseMock,
};
