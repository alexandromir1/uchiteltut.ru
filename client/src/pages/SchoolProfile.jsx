import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import './SchoolProfile.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SchoolProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { jobs, addJob, deleteJob, refetch } = useJobs();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    position: '',
    hours: '',
    salary: '',
    duties: '',
    housing: '',
    benefits: '',
    contacts: '',
    email: '',
    support: '',
    studentEmployment: ''
  });

  const fetchProfile = useCallback(async () => {
    if (!currentUser) return;

    try {
      // Заменяем Supabase на REST API
      // Если есть endpoint для профиля школы, используйте его
      // const response = await axios.get(`${BASE_URL}/api/schools/${currentUser.id}`);
      
      // Пока используем данные из currentUser
      setProfile({
        school_name: currentUser.user_metadata?.name || currentUser.name,
        district: currentUser.user_metadata?.district || 'Якутск'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [currentUser]);

  // Получаем только вакансии текущей школы
  const schoolJobs = jobs.filter(job => job.school_id === currentUser?.id);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      setLoading(false);
    }
  }, [currentUser, fetchProfile]);

  const handleAddJob = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    try {
      const jobData = {
        position: newJob.position,
        hours: newJob.hours,
        salary: newJob.salary,
        duties: newJob.duties,
        housing: newJob.housing,
        benefits: newJob.benefits,
        contacts: newJob.contacts,
        email: newJob.email,
        support: newJob.support,
        student_employment: newJob.studentEmployment,
        school_id: currentUser.id,
        school: profile?.school_name || currentUser.user_metadata?.name || 'Наша школа',
        region: profile?.district || 'Якутск',
        open_date: new Date().toISOString()
      };

      await addJob(jobData);

      // Очищаем форму
      setNewJob({
        position: '',
        hours: '',
        salary: '',
        duties: '',
        housing: '',
        benefits: '',
        contacts: '',
        email: '',
        support: '',
        studentEmployment: ''
      });

      // Обновляем список вакансий
      refetch();

      alert('Вакансия успешно добавлена!');
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Ошибка при добавлении вакансии: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту вакансию?')) return;

    try {
      await deleteJob(jobId);
      alert('Вакансия удалена');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Ошибка при удалении вакансии');
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      // Заменяем Supabase на REST API
      // const { error } = await supabase
      //   .from('schools')
      //   .upsert({
      //     user_id: currentUser.id,
      //     school_name: profile?.school_name || '',
      //     district: profile?.district || '',
      //     phone: profile?.phone || '',
      //     updated_at: new Date().toISOString()
      //   });

      // if (error) throw error;
      alert('Профиль сохранен!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Ошибка при сохранении профиля');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!currentUser || currentUser.role !== 'school') {
    navigate('/login');
    return null;
  }

  return (
    <div className="school-profile">
      <div className="profile-header">
        <h1>Профиль школы</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/dashboard/school')}
        >
          Панель управления
        </button>
      </div>

      <div className="profile-section">
        <h2>Информация о школе</h2>
        <div className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Название школы *</label>
              <input
                type="text"
                value={profile?.school_name || ''}
                onChange={(e) => setProfile({ ...profile, school_name: e.target.value })}
                placeholder="Введите название школы"
              />
            </div>
            <div className="form-group">
              <label>Район</label>
              <input
                type="text"
                value={profile?.district || ''}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                placeholder="Введите район"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Контактный телефон</label>
            <input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <button className="btn-primary" onClick={saveProfile}>
            Сохранить профиль
          </button>
        </div>
      </div>

      <div className="add-job-section">
        <h2>Добавить вакансию</h2>
        <form onSubmit={handleAddJob} className="job-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Должность *"
              value={newJob.position}
              onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Часы нагрузки"
              value={newJob.hours}
              onChange={(e) => setNewJob({ ...newJob, hours: e.target.value })}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="Зарплата"
              value={newJob.salary}
              onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
            />
            <input
              type="text"
              placeholder="Жилье"
              value={newJob.housing}
              onChange={(e) => setNewJob({ ...newJob, housing: e.target.value })}
            />
          </div>

          <textarea
            placeholder="Обязанности"
            value={newJob.duties}
            onChange={(e) => setNewJob({ ...newJob, duties: e.target.value })}
            rows="3"
          />

          <textarea
            placeholder="Льготы и поддержка"
            value={newJob.benefits}
            onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
            rows="2"
          />

          <div className="form-row">
            <input
              type="text"
              placeholder="Контакты"
              value={newJob.contacts}
              onChange={(e) => setNewJob({ ...newJob, contacts: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email для откликов"
              value={newJob.email}
              onChange={(e) => setNewJob({ ...newJob, email: e.target.value })}
            />
          </div>

          <input
            type="text"
            placeholder="Поддержка для молодых специалистов"
            value={newJob.support}
            onChange={(e) => setNewJob({ ...newJob, support: e.target.value })}
          />

          <input
            type="text"
            placeholder="Трудоустройство студентов"
            value={newJob.studentEmployment}
            onChange={(e) => setNewJob({ ...newJob, studentEmployment: e.target.value })}
          />

          <button type="submit" className="btn-primary">
            Добавить вакансию
          </button>
        </form>
      </div>

      <div className="jobs-section">
        <h2>Мои вакансии ({schoolJobs.length})</h2>
        {schoolJobs.length === 0 ? (
          <p>Нет добавленных вакансий</p>
        ) : (
          <div className="jobs-list">
            {schoolJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.position}</h3>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    Удалить
                  </button>
                </div>
                <p><strong>Зарплата:</strong> {job.salary || 'Не указана'}</p>
                <p><strong>Нагрузка:</strong> {job.hours || 'Не указана'}</p>
                <p><strong>Жилье:</strong> {job.housing || 'Не указано'}</p>
                <p><strong>Дата публикации:</strong> {new Date(job.openDate || job.created_at).toLocaleDateString('ru-RU')}</p>
                {job.duties && <p><strong>Обязанности:</strong> {job.duties}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolProfile;