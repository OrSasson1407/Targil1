'use strict';
const mongoose = require('mongoose');
const createApp = require('./src/app');

const PORT      = parseInt(process.env.PORT || '3000', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wolt';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[MongoDB] connected to', MONGO_URI);
    const app = createApp();
    app.listen(PORT, () => {
      console.log('[Web Server] listening on port', PORT);
    });
  })
  .catch(err => {
    console.error('[MongoDB] connection error:', err.message);
    process.exit(1);
  });