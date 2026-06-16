import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../api';
import { useState, useRef } from 'react';
import './CartDrawer.css';

export default function CartDrawer({ open, onClose, onOrderPlaced }) {
  const { cart, addItem, removeItem, clearCart, totalPrice } = useCart();
  const { token, user } = useAuth();
  const addressRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleOrder() {
    const address = addressRef.current?.value?.trim();
    if (!address) { setError('Please enter a delivery address'); return; }
    setLoading(true);
    setError('');
    const res = await apiPost('/orders', {
      restaurantId: cart.restaurantId,
      items: cart.items.map(i => ({ productId: i.id, quantity: i.quantity })),
      deliveryAddress: address,
    }, token);
    if (res.ok) {
      setSuccess(true);
      clearCart();
      setTimeout(() => { setSuccess(false); onClose(); if (onOrderPlaced) onOrderPlaced(); }, 2000);
    } else {
      setError(res.data?.error || 'Failed to place order');
    }
    setLoading(false);
  }

  return (
    <>
      {open && <div className="cart-overlay" onClick={onClose} />}
      <div className={'cart-drawer card' + (open ? ' open' : '')}>
        <div className="cart-header">
          <h2 className="cart-title">?? Your Order</h2>
          <button className="btn-icon" onClick={onClose}>?</button>
        </div>

        {success && <div className="alert alert-success">?? Order placed successfully!</div>}

        {!success && (
          <>
            {cart.restaurantName && (
              <p className="cart-restaurant">From: <strong>{cart.restaurantName}</strong></p>
            )}

            {cart.items.length === 0 ? (
              <div className="cart-empty">
                <span>??</span>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.items.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">�{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <button className="qty-btn" onClick={() => removeItem(item.id)}>?</button>
                        <span className="qty-val">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => addItem({ id: cart.restaurantId, name: cart.restaurantName }, item)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total-price">�{totalPrice.toFixed(2)}</span>
                </div>

                <div className="input-group" style={{marginTop: 12}}>
                  <label>Delivery address</label>
                  <input
                    ref={addressRef}
                    className="input"
                    type="text"
                    defaultValue={user?.address || ''}
                    placeholder="Enter delivery address"
                  />
                </div>

                {error && <div className="alert alert-error" style={{marginTop:8}}>{error}</div>}

                <button className="btn btn-primary btn-full" style={{marginTop:16}} onClick={handleOrder} disabled={loading}>
                  {loading ? 'Placing order...' : 'Place Order 🛒'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
