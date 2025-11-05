import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { LOGIN, REGISTER, UPDATE_USER } from '../graphql/mutations';
import { ME } from '../graphql/queries';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Мутации
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [updateUserMutation] = useMutation(UPDATE_USER);
  const [fetchMe] = useLazyQuery(ME);

  // Проверяем сохраненную сессию
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
        setLoading(false);
        
        // Обновляем данные пользователя через GraphQL в фоне
        fetchMe().then(({ data }) => {
          if (data?.me) {
            setCurrentUser(data.me);
            localStorage.setItem('user', JSON.stringify(data.me));
          }
        }).catch(() => {
          // Если токен невалиден, очищаем
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        });
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  // 📝 РЕГИСТРАЦИЯ
  const register = async (userData) => {
    try {
      console.log('Отправка данных регистрации...', userData);
      
      const { data } = await registerMutation({
        variables: {
          input: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role,
            schoolName: userData.school_name,
            district: userData.district,
            phone: userData.phone,
          },
        },
      });

      if (data?.register) {
        const { token, user } = data.register;
        
        // Сохраняем данные
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        
        return { success: true, token, user };
      }
      
      throw new Error('Ошибка регистрации');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  // 🔐 ВХОД
  const login = async (email, password) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (data?.login) {
        const { token, user } = data.login;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        
        return { success: true, token, user };
      }
      
      throw new Error('Ошибка входа');
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  // 🚪 ВЫХОД
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // 🔄 ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  const updateUser = async (userData) => {
    try {
      // Отправляем запрос на сервер
      const { data } = await updateUserMutation({
        variables: {
          input: {
            name: userData.name,
          },
        },
      });

      if (data?.updateUser) {
        // Обновляем локальное состояние
        const updatedUser = { ...currentUser, ...data.updateUser };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      // В случае ошибки обновляем локально (fallback)
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      throw error;
    }
  };

  const value = { 
    currentUser, 
    login, 
    logout, 
    register, 
    loading,
    updateUser,
    refetchUser: () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchMe().then(({ data }) => {
          if (data?.me) {
            setCurrentUser(data.me);
            localStorage.setItem('user', JSON.stringify(data.me));
          }
        });
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};