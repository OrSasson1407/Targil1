import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wolt_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('wolt_token') || null);

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('wolt_user', JSON.stringify(userData));
    localStorage.setItem('wolt_token', jwt);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wolt_user');
    localStorage.removeItem('wolt_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
