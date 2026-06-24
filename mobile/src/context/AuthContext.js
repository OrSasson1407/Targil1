import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token  = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) setUser({ token, userId });
      setLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    const data = await api.login({ username, password });
    await AsyncStorage.setItem('token',  data.token);
    await AsyncStorage.setItem('userId', data.userId);
    setUser({ token: data.token, userId: data.userId });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token','userId']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);