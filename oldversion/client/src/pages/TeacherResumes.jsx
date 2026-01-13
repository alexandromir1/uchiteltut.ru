import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeacherResumes.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TeacherResumes = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      // Заменяем Supabase на REST API
      // Если есть endpoint для учителей, используйте его
      // const response = await axios.get(`${BASE_URL}/api/teachers`);
      // setTeachers(response.data.teachers || []);
      
      // Пока используем пустой массив или тестовые данные
      setTeachers([]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subjects?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading">Загрузка резюме...</div>;

  return (
    <div className="teacher-resumes">
      <div className="resumes-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← На главную
        </button>
        <h1>Резюме учителей</h1>
        <p>Найдите подходящего кандидата для вашей школы</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Поиск по имени, специализации или предметам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="resumes-grid">
        {filteredTeachers.length === 0 ? (
          <div className="no-resumes">
            <p>Резюме не найдены</p>
          </div>
        ) : (
          filteredTeachers.map(teacher => (
            <div key={teacher.id} className="resume-card">
              <div className="resume-header">
                <h3>{teacher.full_name}</h3>
                <span className="experience">{teacher.experience} лет опыта</span>
              </div>
              
              <div className="resume-details">
                <p><strong>Специализация:</strong> {teacher.specialization}</p>
                <p><strong>Предметы:</strong> {teacher.subjects}</p>
                <p><strong>Образование:</strong> {teacher.education}</p>
                <p><strong>Квалификация:</strong> {teacher.qualification}</p>
                
                {teacher.skills && (
                  <p><strong>Навыки:</strong> {teacher.skills}</p>
                )}
                
                <p><strong>Контакты:</strong> {teacher.contact_email} {teacher.contact_phone}</p>
              </div>

              <div className="resume-actions">
                <button className="btn-primary">
                  Связаться
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherResumes;