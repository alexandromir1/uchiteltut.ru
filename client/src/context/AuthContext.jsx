import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5001';

  // Проверяем сохраненную сессию
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // 📝 РЕГИСТРАЦИЯ
  const register = async (userData) => {
    try {
      console.log('Отправка данных регистрации...', userData);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (!data.success) throw new Error(data.error);
      
      // Сохраняем данные
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  // 🔐 ВХОД
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // 🚪 ВЫХОД
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = { currentUser, login, logout, register, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};