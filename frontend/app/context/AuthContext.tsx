import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  loginUserApi,
  fetchCurrentUserApi,
  logoutUserApi,
} from '../utils/auth';
import type { PublicUser, AuthSession } from '../types';

interface AuthState {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_AUTH'; payload: { user: PublicUser; token: string } }
  | { type: 'UPDATE_USER'; payload: PublicUser }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize session on mount (and verify with backend /api/auth/me)
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const stored = getSession();
      if (!stored?.token) {
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Optimistically set stored user so UI doesn't flicker
      if (!cancelled) {
        dispatch({
          type: 'SET_AUTH',
          payload: { user: stored.user, token: stored.token },
        });
      }

      // Validate token with backend
      const freshUser = await fetchCurrentUserApi(stored.token);
      if (cancelled) return;

      if (freshUser) {
        saveSession(freshUser, stored.token);
        dispatch({ type: 'UPDATE_USER', payload: freshUser });
      } else {
        // Token invalid or expired
        clearSession();
        dispatch({ type: 'LOGOUT' });
      }
    }

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<PublicUser> => {
    const res = await loginUserApi(email, password);
    saveSession(res.user, res.token);
    dispatch({
      type: 'SET_AUTH',
      payload: { user: res.user, token: res.token },
    });
    return res.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (state.token) {
      await logoutUserApi(state.token);
    }
    clearSession();
    dispatch({ type: 'LOGOUT' });
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated: !!state.user && !!state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
