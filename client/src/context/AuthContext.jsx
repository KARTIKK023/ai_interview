import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('studentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(
    localStorage.getItem('studentToken') || localStorage.getItem('token') || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const studentTok = localStorage.getItem('studentToken') || localStorage.getItem('token');
      if (studentTok) {
        try {
          const res = await API.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('studentUser', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to load student user session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentUser', JSON.stringify(res.data.user));
      localStorage.removeItem('token'); // clean legacy key
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data && res.data.token) {
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentUser', JSON.stringify(res.data.user));
      localStorage.removeItem('token'); // clean legacy key
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentUser');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
