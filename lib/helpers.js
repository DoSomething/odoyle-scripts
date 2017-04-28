'use strict';

const promisify = require('promisify-node');

const fs = promisify('fs');
const READ_STREAM_FLAG = 'r+';
const READ_STREAM_ENCODING = 'utf8';

module.exports.getReadStreamOptions = function getReadStreamOptions() {
  return {
    flags: READ_STREAM_FLAG,
    encoding: READ_STREAM_ENCODING,
  };
};

module.exports.getReadStream = function getReadStream(path) {
  return fs.stat(path)
    .then(stats => stats.isFile())
    .then((isFile) => {
      if (!isFile) {
        return false;
      }
      return fs.createReadStream(path, module.exports.getReadStreamOptions());
    })
    .catch(error => error);
};
