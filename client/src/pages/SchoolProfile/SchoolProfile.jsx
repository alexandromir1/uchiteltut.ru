import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  ButtonBack,
  ButtonGroup,
  LoadingContainer,
  EmptyMessage,
} from './styles';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SchoolProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const { jobs, addJob, deleteJob, refetch, loading: jobsLoading } = useJobs();
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
  const schoolJobs = React.useMemo(() => {
    if (!currentUser || !currentUser.id || !jobs || jobs.length === 0) {
      return [];
    }
    
    // Нормализуем ID пользователя (может быть строка или число)
    const currentUserId = typeof currentUser.id === 'string' ? parseInt(currentUser.id) : Number(currentUser.id);
    const currentUserSchoolId = currentUser.school?.id 
      ? (typeof currentUser.school.id === 'string' ? parseInt(currentUser.school.id) : Number(currentUser.school.id))
      : null;
    
    const filtered = jobs.filter(job => {
      if (!job) return false;
      
      // Нормализуем ID вакансии
      const jobUserId = job.userId ? (typeof job.userId === 'string' ? parseInt(job.userId) : Number(job.userId)) : null;
      const jobSchoolId = job.schoolId ? (typeof job.schoolId === 'string' ? parseInt(job.schoolId) : Number(job.schoolId)) : null;
      
      // Проверяем по userId (вакансия создана этим пользователем) - основной способ
      if (jobUserId && jobUserId === currentUserId) {
        return true;
      }
      
      // Проверяем по user.id (если есть связь через user)
      if (job.user?.id) {
        const jobUserDbId = typeof job.user.id === 'string' ? parseInt(job.user.id) : Number(job.user.id);
        if (jobUserDbId === currentUserId) {
          return true;
        }
      }
      
      // Проверяем по schoolId (если есть связь со школой)
      if (currentUserSchoolId && jobSchoolId && jobSchoolId === currentUserSchoolId) {
        return true;
      }
      
      // Проверяем по schoolInfo.id
      if (currentUserSchoolId && job.schoolInfo?.id) {
        const jobSchoolInfoId = typeof job.schoolInfo.id === 'string' ? parseInt(job.schoolInfo.id) : Number(job.schoolInfo.id);
        if (jobSchoolInfoId === currentUserSchoolId) {
          return true;
        }
      }
      
      return false;
    });
    
    // Отладочная информация (можно убрать после проверки)
    if (process.env.NODE_ENV === 'development') {
      console.log('SchoolProfile - Filtering jobs:', {
        totalJobs: jobs.length,
        filteredJobs: filtered.length,
        currentUserId,
        currentUserSchoolId,
        jobs: jobs.map(j => ({ id: j.id, userId: j.userId, schoolId: j.schoolId, user: j.user?.id, schoolInfo: j.schoolInfo?.id }))
      });
    }
    
    return filtered;
  }, [jobs, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      setLoading(false);
    }
  }, [currentUser, fetchProfile]);

  const handleAddJob = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Пожалуйста, войдите в систему');
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
      await refetch();

      toast.success('Вакансия успешно добавлена!');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Ошибка при добавлении вакансии: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту вакансию?')) return;

    try {
      await deleteJob(jobId);
      toast.success('Вакансия успешно удалена');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Ошибка при удалении вакансии');
    }
  };

  const saveProfile = async () => {
    if (!currentUser) return;

    try {
      // Обновляем имя пользователя в AuthContext, если оно изменилось
      if (profile?.school_name && profile.school_name !== currentUser.name) {
        await updateUser({ name: profile.school_name });
        toast.success('Профиль успешно сохранен!');
      } else {
        toast.success('Профиль сохранен локально!');
      }
      
      // Здесь можно добавить сохранение дополнительных данных профиля школы на сервер через GraphQL API
      // Например: await updateSchoolProfile(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка при сохранении профиля: ' + (error.message || 'Неизвестная ошибка'));
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ButtonBack onClick={() => navigate(-1)}>
            ← Назад
          </ButtonBack>
          <h1>Профиль школы</h1>
        </div>
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
          <ButtonGroup>
            <ButtonPrimary onClick={saveProfile}>
              Сохранить профиль
            </ButtonPrimary>
            <ButtonBack onClick={() => navigate(-1)}>
              Отмена
            </ButtonBack>
          </ButtonGroup>
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

