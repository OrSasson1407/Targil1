const BASE = '/api';

export async function apiPost(path, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  return { ok: res.ok, status: res.status, data, headers: res.headers };
}

export async function apiGet(path, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { headers });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  return { ok: res.ok, status: res.status, data };
}

export async function apiPatch(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { method: 'PATCH', headers, body: JSON.stringify(body) });
  return { ok: res.ok, status: res.status };
}

export async function apiDelete(path, token) {
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { method: 'DELETE', headers });
  return { ok: res.ok, status: res.status };
}
