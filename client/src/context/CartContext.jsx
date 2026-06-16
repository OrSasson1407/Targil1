import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ restaurantId: null, restaurantName: '', items: [] });

  function addItem(restaurant, product) {
    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurant.id) {
        if (!window.confirm('Your cart has items from another restaurant. Clear and start new order?')) {
          return prev;
        }
        return { restaurantId: restaurant.id, restaurantName: restaurant.name, items: [{ ...product, quantity: 1 }] };
      }
      const existing = prev.items.find(i => i.id === product.id);
      if (existing) {
        return { ...prev, items: prev.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { restaurantId: restaurant.id, restaurantName: restaurant.name, items: [...prev.items, { ...product, quantity: 1 }] };
    });
  }

  function removeItem(productId) {
    setCart(prev => {
      const items = prev.items.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      if (items.length === 0) return { restaurantId: null, restaurantName: '', items: [] };
      return { ...prev, items };
    });
  }

  function clearCart() {
    setCart({ restaurantId: null, restaurantName: '', items: [] });
  }

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
