'use strict';
const User       = require('./mongoose/User');
const Restaurant = require('./mongoose/Restaurant');
const Product    = require('./mongoose/Product');
const Order      = require('./mongoose/Order');

function doc(d) {
  if (!d) return null;
  const obj = d.toObject ? d.toObject() : { ...d };
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
}

// Users
async function createUser({ username, password, name, phone, address, imageUrl }) {
  try { return doc(await User.create({ username, password, name, phone, address, imageUrl: imageUrl || '' })); }
  catch { return null; }
}
async function getUserById(id) {
  try { return doc(await User.findById(id)); } catch { return null; }
}
async function getUserByUsername(username) {
  try { return doc(await User.findOne({ username })); } catch { return null; }
}

// Restaurants
async function createRestaurant({ name, address, phone, cuisineType, openingHours, imageUrl }) {
  if (!name) return null;
  const r = await Restaurant.create({ name, address: address||'', phone: phone||'', cuisineType: cuisineType||'', openingHours: openingHours||'', imageUrl: imageUrl||'' });
  return doc(r);
}
async function getAllRestaurants() {
  return (await Restaurant.find()).map(doc);
}
async function getRestaurantById(id) {
  try { return doc(await Restaurant.findById(id)); } catch { return null; }
}
async function updateRestaurant(id, fields) {
  try {
    const allowed = ['name','address','phone','cuisineType','openingHours','imageUrl'];
    const upd = {};
    for (const k of allowed) if (fields[k] !== undefined) upd[k] = fields[k];
    return doc(await Restaurant.findByIdAndUpdate(id, upd, { new: true }));
  } catch { return null; }
}
async function deleteRestaurant(id) {
  try {
    const r = await Restaurant.findByIdAndDelete(id);
    if (!r) return false;
    await Product.deleteMany({ restaurantId: id });
    return true;
  } catch { return false; }
}

// Products
async function createProduct(restaurantId, { name, description, price, category, imageUrl }) {
  try {
    const r = await Restaurant.findById(restaurantId);
    if (!r || !name || price === undefined) return null;
    const p = await Product.create({ restaurantId, name, description: description||'', price: Number(price), category: category||'', imageUrl: imageUrl||'' });
    return doc(p);
  } catch { return null; }
}
async function getProductsByRestaurant(restaurantId) {
  try { return (await Product.find({ restaurantId })).map(doc); } catch { return []; }
}
async function getProductById(restaurantId, productId) {
  try { return doc(await Product.findOne({ _id: productId, restaurantId })); } catch { return null; }
}
async function getProductByIdGlobal(productId) {
  try { return doc(await Product.findById(productId)); } catch { return null; }
}
async function updateProduct(restaurantId, productId, fields) {
  try {
    const allowed = ['name','description','price','category','imageUrl'];
    const upd = {};
    for (const k of allowed) if (fields[k] !== undefined) upd[k] = k === 'price' ? Number(fields[k]) : fields[k];
    return doc(await Product.findOneAndUpdate({ _id: productId, restaurantId }, upd, { new: true }));
  } catch { return null; }
}
async function deleteProduct(restaurantId, productId) {
  try { return !!(await Product.findOneAndDelete({ _id: productId, restaurantId })); } catch { return false; }
}

// Orders
async function createOrder(userId, { restaurantId, items, deliveryAddress }) {
  try { return doc(await Order.create({ userId, restaurantId, items, deliveryAddress: deliveryAddress||'', status: 'pending' })); }
  catch { return null; }
}
async function getOrdersByUser(userId) {
  try { return (await Order.find({ userId })).map(doc); } catch { return []; }
}
async function getOrderById(id) {
  try { return doc(await Order.findById(id)); } catch { return null; }
}
async function updateOrder(id, fields) {
  try {
    const allowed = ['deliveryAddress','status','items'];
    const upd = {};
    for (const k of allowed) if (fields[k] !== undefined) upd[k] = fields[k];
    return doc(await Order.findByIdAndUpdate(id, upd, { new: true }));
  } catch { return null; }
}
async function deleteOrder(id) {
  try { return !!(await Order.findByIdAndDelete(id)); } catch { return false; }
}

// Search
async function search(query) {
  const q = new RegExp(query, 'i');
  const [restaurants, products] = await Promise.all([
    Restaurant.find({ $or: [{ name: q }, { cuisineType: q }] }),
    Product.find({ $or: [{ name: q }, { description: q }] }),
  ]);
  return { restaurants: restaurants.map(doc), products: products.map(doc) };
}

module.exports = {
  createUser, getUserById, getUserByUsername,
  createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,
  createProduct, getProductsByRestaurant, getProductById, getProductByIdGlobal, updateProduct, deleteProduct,
  createOrder, getOrdersByUser, getOrderById, updateOrder, deleteOrder,
  search,
};