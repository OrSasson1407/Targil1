import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../api';
import Navbar from '../components/Navbar';
import RestaurantCard from '../components/RestaurantCard';
import './HomePage.css';

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Sushi', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Salad', 'Dessert'];

export default function HomePage({ theme, setTheme }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    setLoading(true);
    setError('');
    const res = await apiGet('/restaurants', token);
    if (res.ok) {
      setRestaurants(res.data);
    } else {
      setError('Failed to load restaurants');
    }
    setLoading(false);
  }

  async function handleSearch(q) {
    setSearchQuery(q);
    if (!q) { setSearchResults(null); return; }
    const res = await apiGet('/search/' + encodeURIComponent(q), token);
    if (res.ok) setSearchResults(res.data);
  }

  const displayedRestaurants = (() => {
    if (searchResults) return searchResults.restaurants || [];
    if (activeCategory === 'All') return restaurants;
    return restaurants.filter(r =>
      r.cuisineType?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  })();

  return (
    <div className="home-page">
      <Navbar theme={theme} setTheme={setTheme} onSearch={handleSearch} />

      <div className="home-content">
        {/* Hero */}
        {!searchQuery && (
          <div className="hero">
            <h1 className="hero-title">Hungry? We've got you ??</h1>
            <p className="hero-sub">Order food from the best restaurants near you</p>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="search-header">
            <h2>Results for "<strong>{searchQuery}</strong>"</h2>
            {searchResults && (
              <p className="search-meta">
                {searchResults.restaurants?.length || 0} restaurants ·{' '}
                {searchResults.products?.length || 0} dishes
              </p>
            )}
          </div>
        )}

        {/* Category pills */}
        {!searchQuery && (
          <div className="categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={'cat-pill' + (activeCategory === cat ? ' active' : '')}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Restaurants grid */}
        <section className="section">
          {!searchQuery && (
            <div className="section-header">
              <h2 className="section-title">
                {activeCategory === 'All' ? '?? All Restaurants' : ??? }
              </h2>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/manage')}>
                + Add Restaurant
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && displayedRestaurants.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">???</span>
              <p>{searchQuery ? 'No restaurants found for your search' : 'No restaurants yet. Add one!'}</p>
              {!searchQuery && (
                <button className="btn btn-primary" style={{marginTop:16}} onClick={() => navigate('/manage')}>
                  Add first restaurant
                </button>
              )}
            </div>
          )}

          {!loading && !error && displayedRestaurants.length > 0 && (
            <div className="restaurants-grid">
              {displayedRestaurants.map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>

        {/* Dish results from search */}
        {searchQuery && searchResults?.products?.length > 0 && (
          <section className="section">
            <h2 className="section-title">?? Matching Dishes</h2>
            <div className="products-list">
              {searchResults.products.map(p => (
                <div key={p.id} className="product-row card" onClick={() => navigate('/restaurant/' + p.restaurantId)}>
                  <div className="product-row-info">
                    <span className="product-row-name">{p.name}</span>
                    {p.description && <span className="product-row-desc">{p.description}</span>}
                  </div>
                  <span className="product-row-price">¤{p.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
