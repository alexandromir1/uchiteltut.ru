import React from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Регистрация</h2>
        <p>Выберите тип аккаунта:</p>
        
        <div className="register-options">
          <Link to="/register/teacher" className="register-option">
            <div className="option-card">
              <h3>👨‍🏫 Учитель</h3>
              <p>Ищу работу в школе</p>
              <ul>
                <li>Создайте резюме</li>
                <li>Откликайтесь на вакансии</li>
                <li>Получайте предложения</li>
              </ul>
            </div>
          </Link>
          
          <Link to="/register/school" className="register-option">
            <div className="option-card">
              <h3>🏫 Школа</h3>
              <p>Ищу учителей</p>
              <ul>
                <li>Публикуйте вакансии</li>
                <li>Просматривайте резюме</li>
                <li>Находите сотрудников</li>
              </ul>
            </div>
          </Link>
        </div>
        
        <div className="register-links">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;