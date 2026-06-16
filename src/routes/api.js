'use strict';
const express = require('express');
const router = express.Router();

const usersCtrl       = require('../controllers/usersController');
const tokensCtrl      = require('../controllers/tokensController');
const restaurantsCtrl = require('../controllers/restaurantsController');
const productsCtrl    = require('../controllers/productsController');
const ordersCtrl      = require('../controllers/ordersController');
const searchCtrl      = require('../controllers/searchController');
const { authMiddleware } = require('../middleware/auth');

router.post('/users',    usersCtrl.registerUser);
router.get('/users/:id', usersCtrl.getUser);

router.post('/tokens', tokensCtrl.login);

router.get('/restaurants',         restaurantsCtrl.getAllRestaurants);
router.post('/restaurants',        authMiddleware, restaurantsCtrl.createRestaurant);
router.get('/restaurants/:id',     restaurantsCtrl.getRestaurant);
router.patch('/restaurants/:id',   authMiddleware, restaurantsCtrl.updateRestaurant);
router.delete('/restaurants/:id',  authMiddleware, restaurantsCtrl.deleteRestaurant);

router.get('/restaurants/:id/products',         productsCtrl.getProducts);
router.post('/restaurants/:id/products',        authMiddleware, productsCtrl.createProduct);
router.get('/restaurants/:id/products/:pId',    productsCtrl.getProduct);
router.patch('/restaurants/:id/products/:pId',  authMiddleware, productsCtrl.updateProduct);
router.delete('/restaurants/:id/products/:pId', authMiddleware, productsCtrl.deleteProduct);

router.post('/orders',       authMiddleware, ordersCtrl.createOrder);
router.get('/orders',        authMiddleware, ordersCtrl.getOrders);
router.get('/orders/:id',    authMiddleware, ordersCtrl.getOrder);
router.patch('/orders/:id',  authMiddleware, ordersCtrl.updateOrder);
router.delete('/orders/:id', authMiddleware, ordersCtrl.deleteOrder);

router.get('/search/:query', searchCtrl.search);

module.exports = router;
