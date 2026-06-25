import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchCart,
  syncCart,
  addCartItemApi,
  updateCartItemQuantity,
  removeCartItemApi,
  clearCartApi,
} from '../api/cart.js';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'INCREASE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case 'DECREASE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

const CART_KEY = (userId) => `shopvault_cart_${userId}`;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const syncing = useRef(false);

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    let cancelled = false;

    async function loadCart() {
      try {
        let items = await fetchCart();

        if (!items.length) {
          try {
            const saved = JSON.parse(localStorage.getItem(CART_KEY(user.id)) || '[]');
            if (saved.length) {
              items = await syncCart(saved);
            }
          } catch {
            /* ignore */
          }
        }

        if (!cancelled) dispatch({ type: 'LOAD_CART', payload: items });
      } catch {
        try {
          const saved = JSON.parse(localStorage.getItem(CART_KEY(user.id)) || '[]');
          if (!cancelled) dispatch({ type: 'LOAD_CART', payload: saved });
        } catch {
          if (!cancelled) dispatch({ type: 'LOAD_CART', payload: [] });
        }
      }
    }

    loadCart();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CART_KEY(user.id), JSON.stringify(state.items));
    }
  }, [state.items, user]);

  const syncWithApi = async (action) => {
    if (!user || syncing.current) return;
    syncing.current = true;
    try {
      const items = await action();
      dispatch({ type: 'LOAD_CART', payload: items });
    } catch {
      /* keep optimistic local state */
    } finally {
      syncing.current = false;
    }
  };

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    if (user) syncWithApi(() => addCartItemApi(product.id, 1));
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    if (user) syncWithApi(() => removeCartItemApi(id));
  };

  const increaseQty = (id) => {
    const item = state.items.find((i) => i.id === id);
    dispatch({ type: 'INCREASE_QTY', payload: id });
    if (user && item) syncWithApi(() => updateCartItemQuantity(id, item.quantity + 1));
  };

  const decreaseQty = (id) => {
    const item = state.items.find((i) => i.id === id);
    dispatch({ type: 'DECREASE_QTY', payload: id });
    if (user && item) syncWithApi(() => updateCartItemQuantity(id, Math.max(1, item.quantity - 1)));
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (user) syncWithApi(() => clearCartApi());
  };

  const isInCart = (id) => state.items.some((i) => i.id === id);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ ...state, addItem, removeItem, increaseQty, decreaseQty, clearCart, isInCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
