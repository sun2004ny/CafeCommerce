import { env } from '../config/env.js';

const ADMIN_SESSION_KEY = 'cafecommerce_admin_session';

export function createAdminSession(token, admin) {
  const session = { token, admin, createdAt: Date.now() };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function adminHeaders() {
  const session = getAdminSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function adminLogin(email, password) {
  const res = await fetch(`${env.apiUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}

export async function fetchAdminStats() {
  const res = await fetch(`${env.apiUrl}/api/admin/stats`, { headers: adminHeaders() });
  return parseResponse(res);
}

export async function fetchAdminUsers() {
  const res = await fetch(`${env.apiUrl}/api/admin/users`, { headers: adminHeaders() });
  return parseResponse(res);
}

export async function fetchAdminUser(userId) {
  const res = await fetch(`${env.apiUrl}/api/admin/users/${userId}`, { headers: adminHeaders() });
  return parseResponse(res);
}

export async function deleteAdminUser(userId) {
  const res = await fetch(`${env.apiUrl}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return parseResponse(res);
}

export async function fetchAdminProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.limit) qs.set('limit', String(params.limit));
  qs.set('skip', String(params.skip || 0));

  const res = await fetch(`${env.apiUrl}/api/products?${qs}`, { headers: adminHeaders() });
  return parseResponse(res);
}

export async function createAdminProduct(product) {
  const res = await fetch(`${env.apiUrl}/api/admin/products`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(product),
  });
  return parseResponse(res);
}

export async function updateAdminProduct(id, product) {
  const res = await fetch(`${env.apiUrl}/api/admin/products/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(product),
  });
  return parseResponse(res);
}

export async function deleteAdminProduct(id) {
  const res = await fetch(`${env.apiUrl}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return parseResponse(res);
}

export async function fetchAdminCoupons() {
  const res = await fetch(`${env.apiUrl}/api/admin/coupons`, { headers: adminHeaders() });
  return parseResponse(res);
}
