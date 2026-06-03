'use strict';

/**
 * In-memory data store.
 * All data is lost on server restart (as required by the assignment).
 * Provides simple CRUD access to the four core collections.
 */

const { v4: uuidv4 } = require('uuid');

// ─── Collections ────────────────────────────────────────────────────────────

/** @type {Map<string, Object>} id → user */
const users = new Map();

/** @type {Map<string, Object>} id → restaurant */
const restaurants = new Map();

/** @type {Map<string, Object>} id → product  (product stores restaurantId) */
const products = new Map();

/** @type {Map<string, Object>} id → order */
const orders = new Map();

// ─── Users ───────────────────────────────────────────────────────────────────

function createUser({ username, password, name, phone, address }) {
  if (!username || !password || !name || !phone || !address) return null;
  if (getUserByUsername(username)) return null; // duplicate
  const id = uuidv4();
  const user = { id, username, password, name, phone, address };
  users.set(id, user);
  return user;
}

function getUserById(id) {
  return users.get(id) || null;
}

function getUserByUsername(username) {
  for (const u of users.values()) {
    if (u.username === username) return u;
  }
  return null;
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

function createRestaurant({ name, address, phone, cuisineType, openingHours }) {
  if (!name) return null;
  const id = uuidv4();
  const restaurant = {
    id,
    name,
    address: address || '',
    phone: phone || '',
    cuisineType: cuisineType || '',
    openingHours: openingHours || '',
  };
  restaurants.set(id, restaurant);
  return restaurant;
}

function getAllRestaurants() {
  return Array.from(restaurants.values());
}

function getRestaurantById(id) {
  return restaurants.get(id) || null;
}

function updateRestaurant(id, fields) {
  const r = restaurants.get(id);
  if (!r) return null;
  const allowed = ['name', 'address', 'phone', 'cuisineType', 'openingHours'];
  for (const key of allowed) {
    if (fields[key] !== undefined) r[key] = fields[key];
  }
  return r;
}

function deleteRestaurant(id) {
  if (!restaurants.has(id)) return false;
  restaurants.delete(id);
  // cascade-delete products belonging to this restaurant
  for (const [pid, p] of products.entries()) {
    if (p.restaurantId === id) products.delete(pid);
  }
  return true;
}

// ─── Products ────────────────────────────────────────────────────────────────

function createProduct(restaurantId, { name, description, price, category }) {
  if (!restaurants.has(restaurantId)) return null;
  if (!name || price === undefined) return null;
  const id = uuidv4();
  const product = {
    id,
    restaurantId,
    name,
    description: description || '',
    price: Number(price),
    category: category || '',
  };
  products.set(id, product);
  return product;
}

function getProductsByRestaurant(restaurantId) {
  const result = [];
  for (const p of products.values()) {
    if (p.restaurantId === restaurantId) result.push(p);
  }
  return result;
}

function getProductById(restaurantId, productId) {
  const p = products.get(productId);
  if (!p || p.restaurantId !== restaurantId) return null;
  return p;
}

function getProductByIdGlobal(productId) {
  return products.get(productId) || null;
}

function updateProduct(restaurantId, productId, fields) {
  const p = products.get(productId);
  if (!p || p.restaurantId !== restaurantId) return null;
  const allowed = ['name', 'description', 'price', 'category'];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      p[key] = key === 'price' ? Number(fields[key]) : fields[key];
    }
  }
  return p;
}

function deleteProduct(restaurantId, productId) {
  const p = products.get(productId);
  if (!p || p.restaurantId !== restaurantId) return false;
  products.delete(productId);
  return true;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * items: [{ productId, quantity }]
 */
function createOrder(userId, { restaurantId, items, deliveryAddress }) {
  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) return null;
  if (!restaurants.has(restaurantId)) return null;
  if (!users.has(userId)) return null;

  const id = uuidv4();
  const order = {
    id,
    userId,
    restaurantId,
    items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) || 1 })),
    deliveryAddress: deliveryAddress || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.set(id, order);
  return order;
}

function getOrdersByUser(userId) {
  const result = [];
  for (const o of orders.values()) {
    if (o.userId === userId) result.push(o);
  }
  return result;
}

function getOrderById(id) {
  return orders.get(id) || null;
}

function updateOrder(id, fields) {
  const o = orders.get(id);
  if (!o) return null;
  const allowed = ['deliveryAddress', 'status', 'items'];
  for (const key of allowed) {
    if (fields[key] !== undefined) o[key] = fields[key];
  }
  return o;
}

function deleteOrder(id) {
  if (!orders.has(id)) return false;
  orders.delete(id);
  return true;
}

// ─── Search ──────────────────────────────────────────────────────────────────

function search(query) {
  const q = query.toLowerCase();
  const matchedRestaurants = Array.from(restaurants.values()).filter(
    r => r.name.toLowerCase().includes(q) || r.cuisineType.toLowerCase().includes(q)
  );
  const matchedProducts = Array.from(products.values()).filter(
    p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
  return { restaurants: matchedRestaurants, products: matchedProducts };
}

module.exports = {
  // users
  createUser, getUserById, getUserByUsername,
  // restaurants
  createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,
  // products
  createProduct, getProductsByRestaurant, getProductById, getProductByIdGlobal,
  updateProduct, deleteProduct,
  // orders
  createOrder, getOrdersByUser, getOrderById, updateOrder, deleteOrder,
  // search
  search,
};