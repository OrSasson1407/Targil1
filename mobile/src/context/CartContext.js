import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);
const CART_KEY = 'cart_items';
const REST_KEY = 'cart_restaurant';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [savedItems, savedRid] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(REST_KEY),
        ]);
        if (savedItems) setItems(JSON.parse(savedItems));
        if (savedRid) setRestaurantId(savedRid);
      } catch {}
    })();
  }, []);

  const persist = (nextItems, nextRid) => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(nextItems)).catch(() => {});
    AsyncStorage.setItem(REST_KEY, nextRid ?? '').catch(() => {});
  };

  const addItem = (product, rId) => {
    setItems(prev => {
      const isNewRestaurant = restaurantId && restaurantId !== rId;
      const base = isNewRestaurant ? [] : prev;
      const idx = base.findIndex(i => i.productId === product.id);
      let next;
      if (idx >= 0) {
        next = [...base];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      } else {
        next = [...base, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      }
      persist(next, rId);
      return next;
    });
    setRestaurantId(rId);
  };

  const decrementItem = (productId) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === productId);
      if (idx < 0) return prev;
      let next;
      if (prev[idx].quantity <= 1) next = prev.filter(i => i.productId !== productId);
      else { next = [...prev]; next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 }; }
      persist(next, restaurantId);
      return next;
    });
  };

  const removeItem = (productId) => {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId);
      persist(next, restaurantId);
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    AsyncStorage.multiRemove([CART_KEY, REST_KEY]).catch(() => {});
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, addItem, decrementItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);