'use strict';

const store = require('../models/store');

/**
 * GET /api/restaurants
 */
function getAllRestaurants(req, res) {
  return res.status(200).json(store.getAllRestaurants());
}

/**
 * POST /api/restaurants
 * Body: { name, address, phone, cuisineType, openingHours }
 */
function createRestaurant(req, res) {
  const { name, address, phone, cuisineType, openingHours } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const restaurant = store.createRestaurant({ name, address, phone, cuisineType, openingHours });
  res.setHeader('Location', `/api/restaurants/${restaurant.id}`);
  return res.status(201).end();
}

/**
 * GET /api/restaurants/:id
 */
function getRestaurant(req, res) {
  const restaurant = store.getRestaurantById(req.params.id);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  return res.status(200).json(restaurant);
}

/**
 * PATCH /api/restaurants/:id
 */
function updateRestaurant(req, res) {
  const restaurant = store.updateRestaurant(req.params.id, req.body);
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  return res.status(204).end();
}

/**
 * DELETE /api/restaurants/:id
 */
function deleteRestaurant(req, res) {
  const deleted = store.deleteRestaurant(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  return res.status(204).end();
}

module.exports = {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
};