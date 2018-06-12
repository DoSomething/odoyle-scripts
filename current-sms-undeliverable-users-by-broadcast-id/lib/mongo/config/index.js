'use strict';

const connectionUrl = process.env.DS_GAMBIT_CONVERSATIONS_MONGODB_URI || 'mongodb://localhost:27017/gambit-conversations';

module.exports = {
  connectionUrl,
};
