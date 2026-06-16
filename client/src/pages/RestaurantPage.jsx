import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import './RestaurantPage.css';

export default function RestaurantPage({ theme, setTheme }) {
  const { id } = useParams();
  const { token } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [cartOpen, setCartOpen]     = useState(false);

  // Add product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addError, setAddError]   = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const nameRef     = useRef(null);
  const descRef     = useRef(null);
  const priceRef    = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true); setError('');
    const [rRes, pRes] = await Promise.all([
      apiGet('/restaurants/' + id, token),
      apiGet('/restaurants/' + id + '/products', token),
    ]);
    if (!rRes.ok) { setError('Restaurant not found'); setLoading(false); return; }
    setRestaurant(rRes.data);
    setProducts(pRes.ok ? pRes.data : []);
    setLoading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const name  = nameRef.current.value.trim();
    const price = parseFloat(priceRef.current.value);
    if (!name)        { setAddError('Name is required'); return; }
    if (isNaN(price) || price <= 0) { setAddError('Enter a valid price'); return; }
    setAddLoading(true); setAddError('');
    const res = await apiPost('/restaurants/' + id + '/products', {
      name,
      description: descRef.current.value.trim(),
      price,
      category: categoryRef.current.value.trim(),
    }, token);
    if (res.ok) {
      nameRef.current.value = ''; descRef.current.value = '';
      priceRef.current.value = ''; categoryRef.current.value = '';
      setShowAddProduct(false);
      fetchAll();
    } else {
      setAddError(res.data?.error || 'Failed to add product');
    }
    setAddLoading(false);
  }

  async function handleDeleteProduct(pId) {
    if (!window.confirm('Delete this product?')) return;
    await apiDelete('/restaurants/' + id + '/products/' + pId, token);
    fetchAll();
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const grouped = categories.length > 0
    ? categories.map(cat => ({ cat, items: products.filter(p => p.category === cat) }))
    : [{ cat: null, items: products }];
  const uncategorized = products.filter(p => !p.category);
  if (categories.length > 0 && uncategorized.length > 0) grouped.push({ cat: 'Other', items: uncategorized });

  if (loading) return (
    <div className="rp-page">
      <Navbar theme={theme} setTheme={setTheme} />
      <div className="rp-loading">Loading restaurant...</div>
    </div>
  );

  if (error) return (
    <div className="rp-page">
      <Navbar theme={theme} setTheme={setTheme} />
      <div className="rp-content">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" style={{marginTop:16}} onClick={() => navigate('/')}>? Back</button>
      </div>
    </div>
  );

  return (
    <div className="rp-page">
      <Navbar theme={theme} setTheme={setTheme} />

      <div className="rp-hero">
        <div className="rp-hero-inner">
          <button className="btn-back" onClick={() => navigate('/')}>? Back</button>
          <div className="rp-hero-emoji">🏪</div>
          <h1 className="rp-name">{restaurant.name}</h1>
          <div className="rp-meta">
            {restaurant.cuisineType  && <span className="rp-tag">{restaurant.cuisineType}</span>}
            {restaurant.address      && <span className="rp-meta-item">📍 {restaurant.address}</span>}
            {restaurant.phone        && <span className="rp-meta-item">📞 {restaurant.phone}</span>}
            {restaurant.openingHours && <span className="rp-meta-item">🕐 {restaurant.openingHours}</span>}
          </div>
        </div>
      </div>

      <div className="rp-content">
        <div className="rp-toolbar">
          <h2 className="section-title">Menu</h2>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddProduct(o => !o)}>
            {showAddProduct ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {showAddProduct && (
          <form className="add-product-form card" onSubmit={handleAddProduct}>
            <h3 style={{fontWeight:700, marginBottom:4}}>New Menu Item</h3>
            {addError && <div className="alert alert-error">{addError}</div>}
            <div className="add-product-grid">
              <div className="input-group">
                <label>Name *</label>
                <input ref={nameRef} className="input" type="text" placeholder="Item name" />
              </div>
              <div className="input-group">
                <label>Category</label>
                <input ref={categoryRef} className="input" type="text" placeholder="e.g. Starters" />
              </div>
              <div className="input-group">
                <label>Price (₪) *</label>
                <input ref={priceRef} className="input" type="number" min="0" step="0.01" placeholder="0.00" />
              </div>
              <div className="input-group" style={{gridColumn:'1/-1'}}>
                <label>Description</label>
                <input ref={descRef} className="input" type="text" placeholder="Short description" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add to Menu'}
            </button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🍽️</span>
            <p>No menu items yet. Add the first one!</p>
          </div>
        ) : (
          grouped.map(({ cat, items }) => (
            <div key={cat || 'all'} className="menu-section">
              {cat && <h3 className="menu-cat-title">{cat}</h3>}
              <div className="products-grid">
                {items.map(p => (
                  <div key={p.id} className="product-wrapper">
                    <ProductCard product={p} restaurant={restaurant} />
                    <button
                      className="delete-product-btn"
                      onClick={() => handleDeleteProduct(p.id)}
                      title="Delete item"
                    >✏️</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {totalItems > 0 && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          🛒 {totalItems} {totalItems === 1 ? 'item' : 'items'} · ₪{totalPrice.toFixed(2)}
        </button>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
