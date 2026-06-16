import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider }    from './context/AuthContext';
import { CartProvider }    from './context/CartContext';
import ProtectedRoute      from './components/ProtectedRoute';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import HomePage            from './pages/HomePage';
import RestaurantPage      from './pages/RestaurantPage';
import ManagePage          from './pages/ManagePage';
import OrdersPage          from './pages/OrdersPage';
import './index.css';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('wolt_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wolt_theme', theme);
  }, [theme]);

  const themeProps = { theme, setTheme };

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
              <ProtectedRoute><HomePage {...themeProps} /></ProtectedRoute>
            } />
            <Route path="/restaurant/:id" element={
              <ProtectedRoute><RestaurantPage {...themeProps} /></ProtectedRoute>
            } />
            <Route path="/manage" element={
              <ProtectedRoute><ManagePage {...themeProps} /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><OrdersPage {...themeProps} /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
