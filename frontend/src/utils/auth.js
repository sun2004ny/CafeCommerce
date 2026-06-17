import { env } from '../config/env.js';

const SESSION_KEY = 'shopvault_session';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function authHeaders() {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  return headers;
}

export const createSession = (user, token) => {
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    token,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session || null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${env.apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await parseResponse(res);
  return data.user;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${env.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
};

export const fetchCurrentUser = async () => {
  const session = getSession();
  if (!session?.token) return null;

  const res = await fetch(`${env.apiUrl}/api/auth/me`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    clearSession();
    return null;
  }

  const data = await parseResponse(res);
  return data.user;
};

export const updateUserProfile = async (userId, updates) => {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.password) payload.password = updates.password;

  const res = await fetch(`${env.apiUrl}/api/auth/profile`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(res);

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session && session.userId === userId) {
      session.name = data.user.name;
      session.email = data.user.email;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {}

  return data.user;
};

export const getUserById = async (userId) => {
  const session = getSession();
  if (!session || session.userId !== userId) return null;
  return fetchCurrentUser();
};
