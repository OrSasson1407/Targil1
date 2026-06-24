'use strict';
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  address:      { type: String, default: '' },
  phone:        { type: String, default: '' },
  cuisineType:  { type: String, default: '' },
  openingHours: { type: String, default: '' },
  imageUrl:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);