import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: attach bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url && error.config.url.includes('/auth/');
      const hadToken = !!localStorage.getItem('aura_token');
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');

      // Never redirect to login if the user is on the homepage or public auth routes
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.includes(window.location.pathname);

      if (!isAuthEndpoint && hadToken && !isPublicPath) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
