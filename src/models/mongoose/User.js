'use strict';
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  address:  { type: String, required: true },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);