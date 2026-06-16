import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';
import Navbar from '../components/Navbar';
import './ManagePage.css';

export default function ManagePage({ theme, setTheme }) {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const nameRef    = useRef(null);
  const addressRef = useRef(null);
  const phoneRef   = useRef(null);
  const cuisineRef = useRef(null);
  const hoursRef   = useRef(null);

  useEffect(() => { fetchRestaurants(); }, []);

  async function fetchRestaurants() {
    setLoading(true);
    const res = await apiGet('/restaurants', token);
    if (res.ok) setRestaurants(res.data);
    else setError('Failed to load restaurants');
    setLoading(false);
  }

  function openCreate() {
    setEditTarget(null);
    setShowForm(true);
    setFormError('');
    setTimeout(() => { if (nameRef.current) nameRef.current.value = ''; }, 0);
  }

  function openEdit(r) {
    setEditTarget(r);
    setShowForm(true);
    setFormError('');
    setTimeout(() => {
      if (nameRef.current)    nameRef.current.value    = r.name || '';
      if (addressRef.current) addressRef.current.value = r.address || '';
      if (phoneRef.current)   phoneRef.current.value   = r.phone || '';
      if (cuisineRef.current) cuisineRef.current.value = r.cuisineType || '';
      if (hoursRef.current)   hoursRef.current.value   = r.openingHours || '';
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    if (!name) { setFormError('Restaurant name is required'); return; }
    setFormLoading(true);
    setFormError('');
    const body = {
      name,
      address:      addressRef.current.value.trim(),
      phone:        phoneRef.current.value.trim(),
      cuisineType:  cuisineRef.current.value.trim(),
      openingHours: hoursRef.current.value.trim(),
    };
    const res = editTarget
      ? await apiPatch('/restaurants/' + editTarget.id, body, token)
      : await apiPost('/restaurants', body, token);
    if (res.ok) {
      setShowForm(false);
      fetchRestaurants();
    } else {
      setFormError(res.data?.error || 'Failed to save restaurant');
    }
    setFormLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this restaurant and all its products?')) return;
    await apiDelete('/restaurants/' + id, token);
    fetchRestaurants();
  }

  return (
    <div className="manage-page">
      <Navbar theme={theme} setTheme={setTheme} />
      <div className="manage-content">
        <div className="manage-header">
          <h1 className="manage-title">🏪 Manage Restaurants</h1>
          <button className="btn btn-primary" onClick={openCreate}>+ New Restaurant</button>
        </div>

        {loading && <div className="manage-loading">Loading...</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {showForm && (
          <div className="manage-form card">
            <h2>{editTarget ? 'Edit Restaurant' : 'New Restaurant'}</h2>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="input-group">
                  <label>Name *</label>
                  <input ref={nameRef} className="input" type="text" placeholder="Restaurant name" />
                </div>
                <div className="input-group">
                  <label>Cuisine Type</label>
                  <input ref={cuisineRef} className="input" type="text" placeholder="e.g. Pizza, Sushi" />
                </div>
                <div className="input-group">
                  <label>Address</label>
                  <input ref={addressRef} className="input" type="text" placeholder="Street address" />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input ref={phoneRef} className="input" type="text" placeholder="Phone number" />
                </div>
                <div className="input-group">
                  <label>Opening Hours</label>
                  <input ref={hoursRef} className="input" type="text" placeholder="e.g. Sun-Thu 10:00-22:00" />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editTarget ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {!loading && restaurants.length === 0 && !showForm && (
          <div className="manage-empty">
            <span className="empty-icon">🍽️</span>
            <p>No restaurants yet. Create one!</p>
          </div>
        )}

        <div className="manage-list">
          {restaurants.map(r => (
            <div key={r.id} className="manage-card card">
              <div className="manage-card-info">
                <h3>{r.name}</h3>
                {r.cuisineType  && <p>🍴 {r.cuisineType}</p>}
                {r.address      && <p>📍 {r.address}</p>}
                {r.phone        && <p>📞 {r.phone}</p>}
                {r.openingHours && <p>🕐 {r.openingHours}</p>}
              </div>
              <div className="manage-card-actions">
                <button className="btn btn-outline" onClick={() => openEdit(r)}>✏️ Edit</button>
                <button className="btn btn-danger"  onClick={() => handleDelete(r.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
