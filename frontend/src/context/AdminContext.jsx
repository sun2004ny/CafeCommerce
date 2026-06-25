import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getAdminSession,
  createAdminSession,
  clearAdminSession,
  adminLogin as apiAdminLogin,
} from '../api/admin.js';

const AdminContext = createContext(null);

const initialState = {
  admin: null,
  session: null,
  isLoading: true,
};

function adminReducer(state, action) {
  switch (action.type) {
    case 'SET_ADMIN':
      return { ...state, admin: action.payload.admin, session: action.payload.session, isLoading: false };
    case 'LOGOUT':
      return { ...state, admin: null, session: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  useEffect(() => {
    const session = getAdminSession();
    if (session?.token) {
      dispatch({ type: 'SET_ADMIN', payload: { admin: session.admin, session } });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const { token, admin } = await apiAdminLogin(email, password);
    const session = createAdminSession(token, admin);
    dispatch({ type: 'SET_ADMIN', payload: { admin, session } });
    return admin;
  };

  const logout = useCallback(() => {
    clearAdminSession();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AdminContext.Provider value={{ ...state, login, logout, isAdmin: !!state.admin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
