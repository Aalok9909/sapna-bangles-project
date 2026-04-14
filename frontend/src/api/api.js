import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sapna-admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sapna-admin-token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;