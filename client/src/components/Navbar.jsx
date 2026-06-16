import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ theme, setTheme, onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = searchRef.current.value.trim();
    if (onSearch) onSearch(q);
  }

  function handleSearchInput(e) {
    if (e.target.value.trim() === '' && onSearch) onSearch('');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="navbar-logo">🍔</span>
          <span className="navbar-name">Wolt</span>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            ref={searchRef}
            className="search-input"
            type="text"
            placeholder="Search restaurants or dishes..."
            onChange={handleSearchInput}
          />
        </form>

        <div className="navbar-actions">
          <button
            className="btn-icon"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="user-menu">
              <button className="user-trigger" onClick={() => setMenuOpen(o => !o)}>
                <div className="user-avatar">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="user-name">{user.name}</span>
                <span className="chevron">{menuOpen ? '?' : '?'}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown card">
                  <div className="dropdown-header">
                    <div className="user-avatar user-avatar-lg">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-username">@{user.username}</div>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/orders'); }}>
                    📦 My Orders
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/manage'); }}>
                    🏪 Manage Restaurants
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
