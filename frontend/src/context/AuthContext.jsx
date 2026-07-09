import { createContext, useContext, useEffect, useState } from 'react';
import { loginUser as loginRequest } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on first load.
  useEffect(() => {
    const storedUser = localStorage.getItem('loadshare_user');
    const token = localStorage.getItem('loadshare_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginRequest({ email, password });
    localStorage.setItem('loadshare_token', data.token);
    localStorage.setItem('loadshare_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('loadshare_token');
    localStorage.removeItem('loadshare_user');
    setUser(null);
  };

  // Used after editing the profile (PATCH /auth/me) to sync the fresh
  // user object into both state and localStorage without a full re-login.
  const updateUser = (updatedUser) => {
    localStorage.setItem('loadshare_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};