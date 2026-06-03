'use strict';

const store = require('../models/store');

/**
 * GET /api/search/:query
 * Returns restaurants and products whose name or description contains the query string.
 */
function search(req, res) {
  const query = req.params.query;
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query cannot be empty' });
  }

  const results = store.search(query.trim());
  return res.status(200).json(results);
}

module.exports = { search };