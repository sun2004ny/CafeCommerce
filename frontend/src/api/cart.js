import { env } from '../config/env.js';
import { getSession } from '../utils/auth.js';

function authHeaders() {
  const session = getSession();
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

function mapCartItem(item) {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    thumbnail: item.thumbnail,
    category: item.category,
    discountPercentage: item.discountPercentage,
    stock: item.stock,
  };
}

export async function fetchCart() {
  const res = await fetch(`${env.apiUrl}/api/cart`, { headers: authHeaders() });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}

export async function syncCart(items) {
  const res = await fetch(`${env.apiUrl}/api/cart/sync`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}

export async function addCartItemApi(productId, quantity = 1) {
  const res = await fetch(`${env.apiUrl}/api/cart/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}

export async function updateCartItemQuantity(productId, quantity) {
  const res = await fetch(`${env.apiUrl}/api/cart/items/${productId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}

export async function removeCartItemApi(productId) {
  const res = await fetch(`${env.apiUrl}/api/cart/items/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}

export async function clearCartApi() {
  const res = await fetch(`${env.apiUrl}/api/cart`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await parseResponse(res);
  return (data.items || []).map(mapCartItem);
}
