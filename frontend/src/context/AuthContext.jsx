import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('trademind_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 1,
      name: 'Alpha Trader',
      email: 'trader@trademind.ai',
      role: 'Institutional Analyst'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('trademind_token'));

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      const { access_token, user_id, name, role } = res.data;
      const userData = { id: user_id, name, email, role };
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('trademind_token', access_token);
      localStorage.setItem('trademind_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authService.register({ name, email, password });
      const { access_token, user_id, role } = res.data;
      const userData = { id: user_id, name, email, role };
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('trademind_token', access_token);
      localStorage.setItem('trademind_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('trademind_token');
    localStorage.removeItem('trademind_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

