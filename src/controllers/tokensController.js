'use strict';
const store = require('../models/store');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wolt_dev_secret_1234';

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'username and password are required' });
  const user = await store.getUserByUsername(username);
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(200).json({ token, userId: user.id });
}

module.exports = { login, JWT_SECRET };