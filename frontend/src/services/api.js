import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do obsługi błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralne miejsce do obsługi błędów API
    const errorMessage = error.response?.data?.message || 'Wystąpił nieznany błąd';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Funkcja pomocnicza do dodawania klucza administratora
export const withAdminAuth = (config = {}) => {
  const adminKey = localStorage.getItem('adminKey');
  
  if (adminKey) {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Admin-Key': adminKey,
      },
    };
  }
  
  return config;
};

export default api;
