import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import {
  SchoolProfileContainer,
  ProfileHeader,
  ProfileSection,
  ProfileForm,
  FormRow,
  FormGroup,
  Label,
  Input,
  Textarea,
  EmailInfo,
  AddJobSection,
  JobForm,
  JobsSection,
  JobsList,
  JobCard,
  JobHeader,
  JobInfo,
  ButtonPrimary,
  ButtonDanger,
  LoadingContainer,
  EmptyMessage,
} from './styles';

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

  if (loading) {
    return (
      <LoadingContainer>
        Загрузка...
      </LoadingContainer>
    );
  }

  if (!currentUser || currentUser.role !== 'school') {
    navigate('/login');
    return null;
  }

  return (
    <SchoolProfileContainer>
      <ProfileHeader>
        <h1>Профиль школы</h1>
        <ButtonPrimary onClick={() => navigate('/dashboard/school')}>
          Панель управления
        </ButtonPrimary>
      </ProfileHeader>

      <ProfileSection>
        <h2>Информация о школе</h2>
        <ProfileForm>
          <FormRow>
            <FormGroup>
              <Label>Название школы *</Label>
              <Input
                type="text"
                value={profile?.school_name || ''}
                onChange={(e) => setProfile({ ...profile, school_name: e.target.value })}
                placeholder="Введите название школы"
              />
            </FormGroup>
            <FormGroup>
              <Label>Район</Label>
              <Input
                type="text"
                value={profile?.district || ''}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                placeholder="Введите район"
              />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <Label>Контактный телефон</Label>
            <Input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </FormGroup>
          <EmailInfo>
            <strong>Email:</strong> {currentUser.email}
          </EmailInfo>
          <ButtonPrimary onClick={saveProfile}>
            Сохранить профиль
          </ButtonPrimary>
        </ProfileForm>
      </ProfileSection>

      <AddJobSection>
        <h2>Добавить вакансию</h2>
        <JobForm onSubmit={handleAddJob}>
          <FormRow>
            <Input
              type="text"
              placeholder="Должность *"
              value={newJob.position}
              onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Часы нагрузки"
              value={newJob.hours}
              onChange={(e) => setNewJob({ ...newJob, hours: e.target.value })}
            />
          </FormRow>

          <FormRow>
            <Input
              type="text"
              placeholder="Зарплата"
              value={newJob.salary}
              onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Жилье"
              value={newJob.housing}
              onChange={(e) => setNewJob({ ...newJob, housing: e.target.value })}
            />
          </FormRow>

          <Textarea
            placeholder="Обязанности"
            value={newJob.duties}
            onChange={(e) => setNewJob({ ...newJob, duties: e.target.value })}
            rows="3"
          />

          <Textarea
            placeholder="Льготы и поддержка"
            value={newJob.benefits}
            onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
            rows="2"
          />

          <FormRow>
            <Input
              type="text"
              placeholder="Контакты"
              value={newJob.contacts}
              onChange={(e) => setNewJob({ ...newJob, contacts: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email для откликов"
              value={newJob.email}
              onChange={(e) => setNewJob({ ...newJob, email: e.target.value })}
            />
          </FormRow>

          <Input
            type="text"
            placeholder="Поддержка для молодых специалистов"
            value={newJob.support}
            onChange={(e) => setNewJob({ ...newJob, support: e.target.value })}
          />

          <Input
            type="text"
            placeholder="Трудоустройство студентов"
            value={newJob.studentEmployment}
            onChange={(e) => setNewJob({ ...newJob, studentEmployment: e.target.value })}
          />

          <ButtonPrimary type="submit">
            Добавить вакансию
          </ButtonPrimary>
        </JobForm>
      </AddJobSection>

      <JobsSection>
        <h2>Мои вакансии ({schoolJobs.length})</h2>
        {schoolJobs.length === 0 ? (
          <EmptyMessage>Нет добавленных вакансий</EmptyMessage>
        ) : (
          <JobsList>
            {schoolJobs.map(job => (
              <JobCard key={job.id}>
                <JobHeader>
                  <h3>{job.position}</h3>
                  <ButtonDanger onClick={() => handleDeleteJob(job.id)}>
                    Удалить
                  </ButtonDanger>
                </JobHeader>
                <JobInfo>
                  <strong>Зарплата:</strong> {job.salary || 'Не указана'}
                </JobInfo>
                <JobInfo>
                  <strong>Нагрузка:</strong> {job.hours || 'Не указана'}
                </JobInfo>
                <JobInfo>
                  <strong>Жилье:</strong> {job.housing || 'Не указано'}
                </JobInfo>
                <JobInfo>
                  <strong>Дата публикации:</strong> {new Date(job.openDate || job.created_at).toLocaleDateString('ru-RU')}
                </JobInfo>
                {job.duties && (
                  <JobInfo>
                    <strong>Обязанности:</strong> {job.duties}
                  </JobInfo>
                )}
              </JobCard>
            ))}
          </JobsList>
        )}
      </JobsSection>
    </SchoolProfileContainer>
  );
};

export default SchoolProfile;

