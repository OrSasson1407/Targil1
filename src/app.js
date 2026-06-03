'use strict';

const express = require('express');
const apiRouter = require('./routes/api');
const { errorHandler, notFound } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json());

  // ── API routes ─────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── 404 / error handlers ───────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;