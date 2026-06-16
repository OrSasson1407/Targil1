import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPost, apiGet } from '../api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef  = useRef(null);
  const nameRef     = useRef(null);
  const phoneRef    = useRef(null);
  const addressRef  = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function validate(fields) {
    const errs = {};
    if (!fields.username.trim()) {
      errs.username = 'Username is required';
    } else if (fields.username.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
      errs.username = 'Only letters, numbers and underscores allowed';
    }

    if (!fields.password) {
      errs.password = 'Password is required';
    } else if (fields.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(fields.password)) {
      errs.password = 'Password must contain letters and numbers';
    }

    if (!fields.confirm) {
      errs.confirm = 'Please confirm your password';
    } else if (fields.password !== fields.confirm) {
      errs.confirm = 'Passwords do not match';
    }

    if (!fields.name.trim()) errs.name = 'Display name is required';
    if (!fields.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(fields.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!fields.address.trim()) errs.address = 'Address is required';

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fields = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      confirm:  confirmRef.current.value,
      name:     nameRef.current.value,
      phone:    phoneRef.current.value,
      address:  addressRef.current.value,
    };

    const errs = validate(fields);
    setErrors(errs);
    setServerError('');
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await apiPost('/users', {
        username: fields.username,
        password: fields.password,
        name: fields.name,
        phone: fields.phone,
        address: fields.address,
      });

      if (!res.ok) {
        setServerError(res.data?.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after register
      const loginRes = await apiPost('/tokens', {
        username: fields.username,
        password: fields.password,
      });
      if (!loginRes.ok) {
        navigate('/login');
        return;
      }
      const { token, userId } = loginRes.data;
      const userRes = await apiGet('/users/' + userId, token);
      login(userRes.data, token);
      navigate('/');
    } catch {
      setServerError('Network error. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide card">
        <div className="auth-logo">??</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join Wolt and order your favorite food</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="avatar-section">
            <div className="avatar-preview">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" />
                : <span>??</span>
              }
            </div>
            <label className="btn btn-outline avatar-btn">
              {avatar ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </label>
          </div>

          <div className="auth-fields auth-grid">
            <div className="input-group">
              <label htmlFor="reg-username">Username *</label>
              <input
                id="reg-username"
                ref={usernameRef}
                className={'input' + (errors.username ? ' error' : '')}
                type="text"
                placeholder="e.g. john_doe"
              />
              {errors.username
                ? <span className="field-error">{errors.username}</span>
                : <span className="field-hint">Letters, numbers, underscores. Min 3 chars.</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-name">Display name *</label>
              <input
                id="reg-name"
                ref={nameRef}
                className={'input' + (errors.name ? ' error' : '')}
                type="text"
                placeholder="Your full name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-password">Password *</label>
              <input
                id="reg-password"
                ref={passwordRef}
                className={'input' + (errors.password ? ' error' : '')}
                type="password"
                placeholder="Min 8 chars, letters + numbers"
              />
              {errors.password
                ? <span className="field-error">{errors.password}</span>
                : <span className="field-hint">At least 8 characters with letters and numbers.</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-confirm">Confirm password *</label>
              <input
                id="reg-confirm"
                ref={confirmRef}
                className={'input' + (errors.confirm ? ' error' : '')}
                type="password"
                placeholder="Repeat your password"
              />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-phone">Phone *</label>
              <input
                id="reg-phone"
                ref={phoneRef}
                className={'input' + (errors.phone ? ' error' : '')}
                type="tel"
                placeholder="e.g. 050-1234567"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-address">Delivery address *</label>
              <input
                id="reg-address"
                ref={addressRef}
                className={'input' + (errors.address ? ' error' : '')}
                type="text"
                placeholder="Your default address"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
