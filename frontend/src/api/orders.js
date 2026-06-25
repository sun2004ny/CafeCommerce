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

export async function placeOrder({ items, paymentMethod, subtotal, tax, shipping, total, address }) {
  const res = await fetch(`${env.apiUrl}/api/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items, paymentMethod, subtotal, tax, shipping, total, address }),
  });
  return parseResponse(res);
}

export async function fetchMyOrders() {
  const res = await fetch(`${env.apiUrl}/api/orders`, { headers: authHeaders() });
  return parseResponse(res);
}
