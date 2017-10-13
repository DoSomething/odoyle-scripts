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
function checkStatusCallbackUpdates(res, status, code = 200) {
  const object = {};
  object[`sendingStatusCallbackStatusUpdate${status}${code}`] = (res) => res.status === code;
  check(res, object);
}
function getBroadcastMock(number, status = queued) {
  const mock = _.extend({}, config.statusCallbackRequestMock);
  mock.MessageStatus = status;
  mock.To = number;
  const body = JSON.stringify(mock);
  return body;
}
function postTwilioRequestMocks(url, number) {
  const queuedRes = post(url, getBroadcastMock(number, 'queued'));
  const sentRes = post(url, getBroadcastMock(number, 'sent'));
  const deliveredRes = post(url, getBroadcastMock(number, 'delivered'));
  checkStatusCallbackUpdates(queuedRes, 'Queued', 204);
  checkStatusCallbackUpdates(sentRes, 'Sent', 204);
  checkStatusCallbackUpdates(deliveredRes, 'Delivered', 204);
}

module.exports = {
  post,
  checkStatusCallbackUpdates,
  getBroadcastMock,
  postTwilioRequestMocks,
};
