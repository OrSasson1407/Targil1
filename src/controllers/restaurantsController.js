'use strict';
const store = require('../models/store');

async function getAllRestaurants(req, res) {
  return res.status(200).json(await store.getAllRestaurants());
}
async function createRestaurant(req, res) {
  const { name, address, phone, cuisineType, openingHours, imageUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const restaurant = await store.createRestaurant({ name, address, phone, cuisineType, openingHours, imageUrl });
  res.setHeader('Location', '/api/restaurants/' + restaurant.id);
  return res.status(201).end();
}
async function getRestaurant(req, res) {
  const restaurant = await store.getRestaurantById(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  return res.status(200).json(restaurant);
}
async function updateRestaurant(req, res) {
  const restaurant = await store.updateRestaurant(req.params.id, req.body);
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  return res.status(204).end();
}
async function deleteRestaurant(req, res) {
  const deleted = await store.deleteRestaurant(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Restaurant not found' });
  return res.status(204).end();
}

module.exports = { getAllRestaurants, createRestaurant, getRestaurant, updateRestaurant, deleteRestaurant };