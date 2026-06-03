'use strict';

const store = require('../models/store');

/**
 * POST /api/orders
 * Body: { restaurantId, items: [{ productId, quantity }], deliveryAddress }
 * Requires x-user-id header (logged-in user).
 */
function createOrder(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!store.getUserById(userId)) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  const { restaurantId, items, deliveryAddress } = req.body;
  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'restaurantId and a non-empty items array are required' });
  }

  if (!store.getRestaurantById(restaurantId)) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const order = store.createOrder(userId, { restaurantId, items, deliveryAddress });
  if (!order) {
    return res.status(500).json({ error: 'Could not create order' });
  }

  res.setHeader('Location', `/api/orders/${order.id}`);
  return res.status(201).end();
}

/**
 * GET /api/orders
 * Returns all orders belonging to the logged-in user.
 */
function getOrders(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!store.getUserById(userId)) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  return res.status(200).json(store.getOrdersByUser(userId));
}

/**
 * GET /api/orders/:id
 */
function getOrder(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Users may only see their own orders
  if (order.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.status(200).json(order);
}

/**
 * PATCH /api/orders/:id
 */
function updateOrder(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = store.updateOrder(req.params.id, req.body);
  if (!updated) {
    return res.status(500).json({ error: 'Could not update order' });
  }

  return res.status(204).end();
}

/**
 * DELETE /api/orders/:id
 */
function deleteOrder(req, res) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  store.deleteOrder(req.params.id);
  return res.status(204).end();
}

module.exports = { createOrder, getOrders, getOrder, updateOrder, deleteOrder };