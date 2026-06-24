'use strict';
const store = require('../models/store');

async function search(req, res) {
  const query = req.params.query;
  if (!query || query.trim() === '') return res.status(400).json({ error: 'Search query cannot be empty' });
  const results = await store.search(query.trim());
  return res.status(200).json(results);
}

module.exports = { search };