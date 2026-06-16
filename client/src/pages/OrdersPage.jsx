import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../api';
import Navbar from '../components/Navbar';
import './OrdersPage.css';

export default function OrdersPage({ theme, setTheme }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    const res = await apiGet('/orders', token);
    if (res.ok) {
      setOrders(res.data.slice().reverse());
    } else {
      setError('Failed to load orders');
    }
    setLoading(false);
  }

  return (
    <div className="orders-page">
      <Navbar theme={theme} setTheme={setTheme} />
      <div className="orders-content">
        <h1 className="orders-title">📦 My Orders</h1>

        {loading && <div className="orders-loading">Loading orders...</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <span className="empty-icon">🛒</span>
            <p>You have no orders yet.</p>
          </div>
        )}

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card card">
              <div className="order-header">
                <span className="order-status" data-status={order.status}>{order.status}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <p className="order-address">📍 {order.deliveryAddress}</p>
              <ul className="order-items">
                {order.items.map((item, i) => (
                  <li key={i} className="order-item">
                    <span>{item.productId}</span>
                    <span>x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
