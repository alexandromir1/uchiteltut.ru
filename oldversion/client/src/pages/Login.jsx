import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Attempting login...');
      
      await login(email, password);
      console.log('Login successful, navigating...');
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Вход в систему</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="login-links">
          <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;