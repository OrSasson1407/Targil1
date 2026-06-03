'use strict';

const store = require('../models/store');

/**
 * POST /api/users
 * Register a new user. Body: { username, password, name, phone, address }
 */
function registerUser(req, res) {
  const { username, password, name, phone, address } = req.body;

  if (!username || !password || !name || !phone || !address) {
    return res.status(400).json({ error: 'username, password, name, phone and address are required' });
  }

  if (store.getUserByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const user = store.createUser({ username, password, name, phone, address });
  if (!user) {
    return res.status(500).json({ error: 'Could not create user' });
  }

  res.setHeader('Location', `/api/users/${user.id}`);
  return res.status(201).end();
}

/**
 * GET /api/users/:id
 * Returns public profile of a user (never exposes password).
 */
function getUser(req, res) {
  const user = store.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // eslint-disable-next-line no-unused-vars
  const { password, ...publicProfile } = user;
  return res.status(200).json(publicProfile);
}

module.exports = { registerUser, getUser };