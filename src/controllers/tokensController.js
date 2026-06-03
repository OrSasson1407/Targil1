'use strict';

const store = require('../models/store');

/**
 * POST /api/tokens
 * Authenticate a user. Body: { username, password }
 * Returns the user id on success (token-based auth will be added in Ex4).
 */
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = store.getUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.status(200).json({ userId: user.id });
}

module.exports = { login };