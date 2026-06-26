import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const addItem = (product, rId) => {
    if (restaurantId && restaurantId !== rId) {
      setItems([]);
      setRestaurantId(rId);
    }
    if (!restaurantId) setRestaurantId(rId);
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const decrementItem = (productId) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === productId);
      if (idx < 0) return prev;
      if (prev[idx].quantity <= 1) return prev.filter(i => i.productId !== productId);
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      return next;
    });
  };

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId));

  const clearCart = () => { setItems([]); setRestaurantId(null); };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, addItem, decrementItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);