'use strict';
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity:  { type: Number, default: 1 },
  }],
  deliveryAddress: { type: String, default: '' },
  status:          { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);