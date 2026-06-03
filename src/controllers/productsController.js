'use strict';

const store = require('../models/store');
const ex2Client = require('../services/ex2Client');

/**
 * GET /api/restaurants/:id/products
 */
function getProducts(req, res) {
  const restaurant = store.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  const products = store.getProductsByRestaurant(req.params.id);
  return res.status(200).json(products);
}

/**
 * POST /api/restaurants/:id/products
 * Body: { name, description, price, category }
 */
function createProduct(req, res) {
  const restaurant = store.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }

  const { name, description, price, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  const product = store.createProduct(req.params.id, { name, description, price, category });
  if (!product) {
    return res.status(500).json({ error: 'Could not create product' });
  }

  res.setHeader('Location', `/api/restaurants/${req.params.id}/products/${product.id}`);
  return res.status(201).end();
}

/**
 * GET /api/restaurants/:id/products/:pId
 * Also records a product view in Ex-2 server (if a logged-in user id is provided via header).
 */
async function getProduct(req, res) {
  const product = store.getProductById(req.params.id, req.params.pId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Record view in Ex-2 for the logged-in user (best-effort, non-blocking for the response)
  const userId = req.headers['x-user-id'];
  if (userId) {
    ex2Client.recordProductView(userId, req.params.pId).catch(() => {
      // Ex-2 may be unavailable; do not fail the request
    });
  }

  return res.status(200).json(product);
}

/**
 * PATCH /api/restaurants/:id/products/:pId
 */
function updateProduct(req, res) {
  const product = store.updateProduct(req.params.id, req.params.pId, req.body);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.status(204).end();
}

/**
 * DELETE /api/restaurants/:id/products/:pId
 */
function deleteProduct(req, res) {
  const deleted = store.deleteProduct(req.params.id, req.params.pId);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.status(204).end();
}

module.exports = {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};