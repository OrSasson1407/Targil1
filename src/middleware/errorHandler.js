'use strict';

/**
 * Global error-handling middleware.
 * Catches any error thrown (or passed via next(err)) in the route handlers.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message || err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  return res.status(status).json({ error: message });
}

/**
 * 404 catch-all for unknown routes.
 */
function notFound(req, res) {
  return res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

module.exports = { errorHandler, notFound };