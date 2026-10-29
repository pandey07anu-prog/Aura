import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('aura_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('aura_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { token: jwtToken, user: userProfile } = res.data.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem('aura_token', jwtToken);
      localStorage.setItem('aura_user', JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (res.data?.success && res.data?.data) {
      const { token: jwtToken, user: userProfile } = res.data.data;
      if (jwtToken) {
        setToken(jwtToken);
        localStorage.setItem('aura_token', jwtToken);
      }
      if (userProfile) {
        setUser(userProfile);
        localStorage.setItem('aura_user', JSON.stringify(userProfile));
      }
      return userProfile || res.data.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    if (res.data?.success && res.data?.data) {
      const { token: jwtToken, user: userProfile } = res.data.data;
      setToken(jwtToken);
      setUser(userProfile);
      localStorage.setItem('aura_token', jwtToken);
      localStorage.setItem('aura_user', JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error(res.data?.message || 'Verification failed');
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('aura_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
