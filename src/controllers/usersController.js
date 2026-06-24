'use strict';
const store = require('../models/store');

async function registerUser(req, res) {
  const { username, password, name, phone, address, imageUrl } = req.body;
  if (!username || !password || !name || !phone || !address)
    return res.status(400).json({ error: 'username, password, name, phone and address are required' });
  if (await store.getUserByUsername(username))
    return res.status(409).json({ error: 'Username already taken' });
  const user = await store.createUser({ username, password, name, phone, address, imageUrl });
  if (!user) return res.status(500).json({ error: 'Could not create user' });
  res.setHeader('Location', '/api/users/' + user.id);
  return res.status(201).end();
}

async function getUser(req, res) {
  const user = await store.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...pub } = user;
  return res.status(200).json(pub);
}

module.exports = { registerUser, getUser };