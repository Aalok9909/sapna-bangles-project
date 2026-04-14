import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sapna-admin-token');
    if (token) {
      // Verify token and set admin
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could add a verify endpoint here
      setAdmin({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      const { token, admin: adminData } = response.data;
      
      localStorage.setItem('sapna-admin-token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAdmin({ ...adminData, token });
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sapna-admin-token');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  const value = {
    admin,
    login,
    logout,
    loading,
    isAuthenticated: !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};