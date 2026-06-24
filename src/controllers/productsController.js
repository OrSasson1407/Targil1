'use strict';
const store = require('../models/store');
const ex2Client = require('../services/ex2Client');

async function getProducts(req, res) {
  const restaurant = await store.getRestaurantById(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  return res.status(200).json(await store.getProductsByRestaurant(req.params.id));
}
async function createProduct(req, res) {
  const restaurant = await store.getRestaurantById(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  const { name, description, price, category, imageUrl } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });
  const product = await store.createProduct(req.params.id, { name, description, price, category, imageUrl });
  if (!product) return res.status(500).json({ error: 'Could not create product' });
  res.setHeader('Location', '/api/restaurants/' + req.params.id + '/products/' + product.id);
  return res.status(201).end();
}
async function getProduct(req, res) {
  const product = await store.getProductById(req.params.id, req.params.pId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const userId = req.headers['x-user-id'];
  if (userId) ex2Client.recordProductView(userId, req.params.pId).catch(() => {});
  return res.status(200).json(product);
}
async function updateProduct(req, res) {
  const product = await store.updateProduct(req.params.id, req.params.pId, req.body);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.status(204).end();
}
async function deleteProduct(req, res) {
  const deleted = await store.deleteProduct(req.params.id, req.params.pId);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  return res.status(204).end();
}

module.exports = { getProducts, createProduct, getProduct, updateProduct, deleteProduct };