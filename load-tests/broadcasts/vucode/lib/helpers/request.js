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
 * User Response
 */

function checkUserResponseStatusCode(res) {
  const object = {};
  object[`sendingUserResponse-${res.status}`] = (res) => res.status === res.status;
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

/**
 * Broadcast
 */

function postBroadcastBody(url, mobile) {
  return post(url, getBroadcastBodyMock(mobile));
}

function getBroadcastBodyMock(mobile) {
  const mock = _.extend({}, config.blinkBroadcastWebhookBody);
  mock.To = mobile;
  const body = JSON.stringify(mock);
  return body;
}

module.exports = {
  post,
  getBroadcastBodyMock,
  postBroadcastBody,
  checkUserResponseStatusCode,
  getUserResponseMock,
  postUserResponseMock,
};
