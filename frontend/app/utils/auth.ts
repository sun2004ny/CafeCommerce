import { env } from '../config/env';
import type { PublicUser, AuthSession, AuthResponse } from '../types';

const SESSION_KEY = 'cafecommerce_session';

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(user: PublicUser, token: string): AuthSession {
  const session: AuthSession = { user, token, timestamp: Date.now() };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function loginUserApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${env.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  return data as AuthResponse;
}

export async function fetchCurrentUserApi(token: string): Promise<PublicUser | null> {
  try {
    const res = await fetch(`${env.apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user as PublicUser;
  } catch {
    return null;
  }
}

export async function logoutUserApi(token?: string): Promise<void> {
  try {
    await fetch(`${env.apiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // Ignore network error during logout
  }
}
