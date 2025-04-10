// context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Weryfikacja tokenu lub pobranie danych użytkownika
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // Implementacja logiki logowania
  };

  const register = async (userData) => {
    // Implementacja logiki rejestracji
  };

  const logout = () => {
    // Implementacja logiki wylogowania
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
