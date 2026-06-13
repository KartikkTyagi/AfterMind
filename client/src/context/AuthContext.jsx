import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if token exists and load user details
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('aftermind_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.auth.me();
        setUser(data.user || data);
        setIsAuthenticated(true);
      } catch (err) {
        console.warn("[Auth Context] Token invalid or expired. Logging out.");
        localStorage.removeItem('aftermind_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      localStorage.setItem('aftermind_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, full_name, date_of_birth) => {
    setLoading(true);
    try {
      const data = await api.auth.signup({ email, password, full_name, date_of_birth });
      localStorage.setItem('aftermind_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aftermind_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
