import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getSession,
  clearSession,
  createSession,
  registerUser,
  loginUser,
  updateUserProfile,
  fetchCurrentUser,
} from '../utils/auth';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  session: null,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.user, session: action.payload.session, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, session: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(() => {
    clearSession();
    dispatch({ type: 'LOGOUT' });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const session = getSession();
      if (!session) {
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const user = await fetchCurrentUser();
      if (cancelled) return;

      if (user) {
        dispatch({ type: 'SET_USER', payload: { user, session } });
      } else {
        clearSession();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    initAuth();
    return () => { cancelled = true; };
  }, []);

  const register = async (name, email, password) => {
    const user = await registerUser(name, email, password);
    return user;
  };

  const login = async (email, password) => {
    const { user, token } = await loginUser(email, password);
    const session = createSession(user, token);
    dispatch({ type: 'SET_USER', payload: { user, session } });
    return user;
  };

  const updateProfile = async (updates) => {
    const updated = await updateUserProfile(state.user.id, updates);
    dispatch({ type: 'UPDATE_USER', payload: updated });
    return updated;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
