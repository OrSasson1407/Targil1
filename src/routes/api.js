'use strict';

const express = require('express');
const router = express.Router();

const usersCtrl       = require('../controllers/usersController');
const tokensCtrl      = require('../controllers/tokensController');
const restaurantsCtrl = require('../controllers/restaurantsController');
const productsCtrl    = require('../controllers/productsController');
const ordersCtrl      = require('../controllers/ordersController');
const searchCtrl      = require('../controllers/searchController');

// ── Users ─────────────────────────────────────────────────────────────────────
router.post('/users',     usersCtrl.registerUser);
router.get('/users/:id',  usersCtrl.getUser);

// ── Authentication ────────────────────────────────────────────────────────────
router.post('/tokens', tokensCtrl.login);

// ── Restaurants ───────────────────────────────────────────────────────────────
router.get('/restaurants',      restaurantsCtrl.getAllRestaurants);
router.post('/restaurants',     restaurantsCtrl.createRestaurant);
router.get('/restaurants/:id',  restaurantsCtrl.getRestaurant);
router.patch('/restaurants/:id', restaurantsCtrl.updateRestaurant);
router.delete('/restaurants/:id', restaurantsCtrl.deleteRestaurant);

// ── Products (menu items) ─────────────────────────────────────────────────────
router.get('/restaurants/:id/products',        productsCtrl.getProducts);
router.post('/restaurants/:id/products',       productsCtrl.createProduct);
router.get('/restaurants/:id/products/:pId',   productsCtrl.getProduct);
router.patch('/restaurants/:id/products/:pId', productsCtrl.updateProduct);
router.delete('/restaurants/:id/products/:pId', productsCtrl.deleteProduct);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/orders',    ordersCtrl.createOrder);
router.get('/orders',     ordersCtrl.getOrders);
router.get('/orders/:id', ordersCtrl.getOrder);
router.patch('/orders/:id', ordersCtrl.updateOrder);
router.delete('/orders/:id', ordersCtrl.deleteOrder);

// ── Search ────────────────────────────────────────────────────────────────────
router.get('/search/:query', searchCtrl.search);

module.exports = router;