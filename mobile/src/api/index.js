import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

async function headers(auth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await AsyncStorage.getItem('token');
    if (token) h['Authorization'] = 'Bearer ' + token;
  }
  return h;
}

async function req(method, path, body, auth = true) {
  const res = await fetch(BASE + path, {
    method,
    headers: await headers(auth),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login:    (body) => req('POST', '/tokens', body, false),
  register: (body) => req('POST', '/users',  body, false),
  getMe:    ()     => req('GET',  '/users/me'),
  getUser:  (id)   => req('GET',  '/users/' + id),

  getRestaurants:  ()        => req('GET',    '/restaurants'),
  getRestaurant:   (id)      => req('GET',    '/restaurants/' + id),
  createRestaurant:(body)    => req('POST',   '/restaurants', body),
  updateRestaurant:(id, b)   => req('PATCH',  '/restaurants/' + id, b),
  deleteRestaurant:(id)      => req('DELETE', '/restaurants/' + id),

  getProducts:    (rId)        => req('GET',    '/restaurants/' + rId + '/products'),
  createProduct:  (rId, b)     => req('POST',   '/restaurants/' + rId + '/products', b),
  updateProduct:  (rId, pId, b)=> req('PATCH',  '/restaurants/' + rId + '/products/' + pId, b),
  deleteProduct:  (rId, pId)   => req('DELETE', '/restaurants/' + rId + '/products/' + pId),

  getOrders:   ()     => req('GET',    '/orders'),
  createOrder: (body) => req('POST',   '/orders', body),
  deleteOrder: (id)   => req('DELETE', '/orders/' + id),

  search: (q) => req('GET', '/search/' + encodeURIComponent(q)),
};