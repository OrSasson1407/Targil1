'use strict';
const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api');
const { errorHandler, notFound } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());

  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));

  app.use('/api', apiRouter);

  // Do this instead
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
