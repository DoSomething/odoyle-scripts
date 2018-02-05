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
 * Broadcast
 */

function postBroadcastBody(url, northstarId, failure, failureCount) {
  let finalUrl = url;
  if (failure) {
    finalUrl = `${finalUrl}?requestFail=true`;

    if (failureCount) {
      finalUrl = `${finalUrl}&requestFailCount=${failureCount}`;
    }
  }
  return post(finalUrl, getBroadcastBodyMock(northstarId));
}

function getBroadcastBodyMock(northstarId) {
  const mock = _.extend({}, config.blinkBroadcastWebhookBody);
  mock.northstarId = northstarId;
  const body = JSON.stringify(mock);
  return body;
}

module.exports = {
  post,
  getBroadcastBodyMock,
  postBroadcastBody,
};
