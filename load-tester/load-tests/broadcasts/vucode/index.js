import http from 'k6/http';
import { sleep, check } from 'k6';

import config from './config.js';

const simplecache = {};

export function checkStatusCallbackUpdates(res, status, code = 200) {
  const object = {};
  object[`sendingStatusCallbackStatusUpdate${status}${code}`] = (res) => res.status === code;
  check(res, object);
}

export function getStatusCallbackStatusUpdateMock(status = queued) {
  config.statusCallbackRequestMock.MessageStatus = status;
  const body = JSON.stringify(config.statusCallbackRequestMock);
  return body;
}

export function attackTheStatusCallbackService(statusCallbackUrl) {
  const headers =  { headers: { 'Content-Type': 'application/json' } };
  const res1 = http.post(statusCallbackUrl, getStatusCallbackStatusUpdateMock('queued'), headers);
  const res2 = http.post(statusCallbackUrl, getStatusCallbackStatusUpdateMock('sent'), headers);
  const res3 = http.post(statusCallbackUrl, getStatusCallbackStatusUpdateMock('delivered'), headers);

  checkStatusCallbackUpdates(res1, 'Queued', 204);
  checkStatusCallbackUpdates(res2, 'Sent', 204);
  checkStatusCallbackUpdates(res3, 'Delivered', 204);
}

/**
 * vuCode - Entry point for the VU - Virtual User
 * @see https://docs.k6.io/docs/running-k6
 * @return {type}  description
 */
export default function() {

  // Get settings
  const url = config.broadcastSettingsUrl;
  const settingsResponse = simplecache[url] || http.get(url);
  simplecache[url] = settingsResponse;

  const parsedSettingsResponseBody = JSON.parse(settingsResponse.body);

  check(settingsResponse, {
    gettingSettingsStatus200: (res) => res.status === 200
  });

  attackTheStatusCallbackService(parsedSettingsResponseBody.webhook.statusCallbackUrl);
  sleep(2.5);
}
