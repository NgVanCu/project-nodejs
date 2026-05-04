import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { api, normalizeCartItems } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + (action.quantity || 1) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: action.quantity || 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { user } = useAuth();
  const prevUserRef = useRef(null);

  // Load giỏ hàng từ server khi user đăng nhập
  const fetchCart = useCallback(async () => {
    if (!user) { dispatch({ type: 'CLEAR_CART' }); return; }
    try {
      const res = await api.get('/cart');
      const normalized = normalizeCartItems(res.data?.data ?? res.data);
      dispatch({ type: 'SET_ITEMS', items: normalized });
    } catch {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      prevUserRef.current = null;
      dispatch({ type: 'CLEAR_CART' });
      return;
    }

    const justLoggedIn = prevUserRef.current === null;
    prevUserRef.current = user;

    const raw = justLoggedIn ? localStorage.getItem('guest_cart') : null;
    if (!raw) {
      fetchCart();
      return;
    }

    // Merge giỏ hàng guest vào DB rồi mới fetch
    (async () => {
      try {
        const guestItems = JSON.parse(raw);
        for (const item of guestItems) {
          try {
            await api.post('/cart', { bookId: item.id, quantity: item.quantity });
          } catch { /* bỏ qua item lỗi (hết hàng, đã xóa...) */ }
        }
      } catch { /* ignore */ } finally {
        localStorage.removeItem('guest_cart');
      }
      await fetchCart();
    })();
  }, [fetchCart]);

  const addItem = async (item, quantity = 1) => {
    if (user) {
      try {
        await api.post('/cart', { bookId: item.id, quantity });
        await fetchCart();
        return;
      } catch (e) {
        console.error('Thêm giỏ hàng lỗi:', e.message);
      }
    }
    // Nếu chưa đăng nhập, lưu local
    dispatch({ type: 'ADD_ITEM', item, quantity });
  };

  const removeItem = async (id) => {
    if (user) {
      try {
        await api.delete(`/cart?bookId=${id}`);
        await fetchCart();
        return;
      } catch (e) {
        console.error('Xóa giỏ hàng lỗi:', e.message);
      }
    }
    dispatch({ type: 'REMOVE_ITEM', id });
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    // Sync với server: xóa item cũ rồi thêm lại với qty mới
    if (user) {
      try {
        const currentItem = state.items.find(i => i.id === id);
        if (!currentItem) return;
        const diff = quantity - currentItem.quantity;
        if (diff > 0) {
          await api.post('/cart', { bookId: id, quantity: diff });
        } else if (diff < 0) {
          // Xóa rồi thêm lại
          await api.delete(`/cart?bookId=${id}`);
          await api.post('/cart', { bookId: id, quantity });
        }
        await fetchCart();
        return;
      } catch (e) {
        console.error('Cập nhật giỏ hàng lỗi:', e.message);
      }
    }
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
      } catch { /* ignore */ }
    }
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      fetchCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
