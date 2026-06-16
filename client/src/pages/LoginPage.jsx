import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost, apiGet } from '../api';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(username, password) {
    const errs = {};
    if (!username.trim()) errs.username = 'Username is required';
    if (!password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value;

    const errs = validate(username, password);
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await apiPost('/tokens', { username, password });
      if (!res.ok) {
        setServerError(res.data?.error || 'Login failed');
        setLoading(false);
        return;
      }
      const { token, userId } = res.data;
      const userRes = await apiGet('/users/' + userId, token);
      if (!userRes.ok) {
        setServerError('Could not fetch user profile');
        setLoading(false);
        return;
      }
      login(userRes.data, token);
      navigate('/');
    } catch {
      setServerError('Network error. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">??</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your Wolt account</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-fields">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                ref={usernameRef}
                className={'input' + (errors.username ? ' error' : '')}
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                ref={passwordRef}
                className={'input' + (errors.password ? ' error' : '')}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
