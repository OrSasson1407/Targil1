'use strict';
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:         { type: String, required: true },
  description:  { type: String, default: '' },
  price:        { type: Number, required: true },
  category:     { type: String, default: '' },
  imageUrl:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);