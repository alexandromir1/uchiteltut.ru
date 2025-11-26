import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_JOBS } from "../../graphql/queries";
import toast from "react-hot-toast";
import background from "../../assets/background.png";
import herb from "../../assets/herb.png";
import {
  Container,
  Header,
  Bar,
  HeaderLeft,
  Herb,
  HeaderTitle,
  LogoutButton,
  Title,
  Text,
  Main,
  Section,
  SectionTitle,
  Form,
  Input,
  Textarea,
  FileInput,
  FilesContainer,
  FileCard,
  FileLink,
  RemoveButton,
  NoFiles,
  JobList,
  JobItem,
  TextCenter,
  LoginButton,
  ButtonBack,
  ButtonPrimary,
  ButtonGroup,
} from './styles';

const ProfileTeacher = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    // Загружаем сохранённые данные, если они есть
    const saved = localStorage.getItem("teacherProfile");
    return saved ? JSON.parse(saved) : {
      name: currentUser?.name || "",
      surname: "",
      patronymic: "",
      birthDate: "",
      education: "",
      experience: "",
      skills: "",
      diplomas: [],
      viewedJobs: [],
    };
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewedJobsData, setViewedJobsData] = useState([]);

  // Загружаем все вакансии для получения данных просмотренных
  const { data: jobsData } = useQuery(GET_JOBS, {
    variables: { active: true },
    skip: !currentUser,
    errorPolicy: 'all',
  });

  // Загружаем данные просмотренных вакансий
  useEffect(() => {
    if (!jobsData?.jobs) return;

    const viewedJobIds = JSON.parse(localStorage.getItem("viewedJobs") || "[]");
    if (viewedJobIds.length === 0) {
      setViewedJobsData([]);
      return;
    }

    // Получаем полные данные вакансий по сохраненным ID
    const jobs = jobsData.jobs.filter(job => 
      viewedJobIds.includes(job.id) || viewedJobIds.includes(String(job.id))
    );

    // Преобразуем в формат для отображения
    const jobsForDisplay = jobs.map(job => ({
      id: job.id,
      position: job.position,
      school: job.school,
      region: job.region,
    }));

    setViewedJobsData(jobsForDisplay);
  }, [jobsData]);

  // Сохраняем профиль при изменении
  useEffect(() => {
    localStorage.setItem("teacherProfile", JSON.stringify(profile));
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));

    setProfile((prev) => ({
      ...prev,
      diplomas: [...prev.diplomas, ...newFiles],
    }));
    setSelectedFiles([]);
  };

  const removeFile = (name) => {
    setProfile((prev) => ({
      ...prev,
      diplomas: prev.diplomas.filter((f) => f.name !== name),
    }));
  };

  const saveProfile = async () => {
    try {
      // Обновляем имя пользователя в AuthContext, если оно изменилось
      const fullName = [profile.surname, profile.name, profile.patronymic]
        .filter(Boolean)
        .join(' ')
        .trim();
      
      if (fullName && fullName !== currentUser.name) {
        await updateUser({ name: fullName || profile.name || currentUser.name });
        toast.success('Профиль успешно сохранен!');
      } else if (profile.name && profile.name !== currentUser.name) {
        await updateUser({ name: profile.name });
        toast.success('Профиль успешно сохранен!');
      } else {
        // Профиль уже сохраняется автоматически в localStorage через useEffect
        toast.success('Профиль сохранен локально!');
      }
      
      // Здесь можно добавить сохранение дополнительных данных профиля на сервер через GraphQL API
      // Например: await updateTeacherProfile(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка при сохранении профиля: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  if (!currentUser) {
    return (
      <Container>
        <TextCenter>Вы не авторизованы 😢</TextCenter>
        <LoginButton onClick={() => navigate("/login")}>
          Войти
        </LoginButton>
      </Container>
    );
  }

  return (
    <Container>
      {/* Хедер */}
      <Header backgroundImage={background}>
        <Bar>
          <HeaderLeft>
            <Link to={'/'}>
              <Herb src={herb} alt="Герб" />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ButtonBack onClick={() => navigate(-1)}>
                ← Назад
              </ButtonBack>
              <HeaderTitle>Профиль учителя</HeaderTitle>
            </div>
          </HeaderLeft>

          <LogoutButton
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Выйти
          </LogoutButton>
        </Bar>

        <Title>{profile.name || "Ваш профиль"}</Title>
        <Text>
          Управляйте своими данными, загружайте документы и следите за вакансиями
        </Text>
      </Header>

      {/* Контент */}
      <Main>
        <Section>
          <SectionTitle>👤 Личные данные</SectionTitle>

          <Form>
            <Input
              name="surname"
              placeholder="Фамилия"
              value={profile.surname}
              onChange={handleChange}
            />
            <Input
              name="name"
              placeholder="Имя"
              value={profile.name}
              onChange={handleChange}
            />
            <Input
              name="patronymic"
              placeholder="Отчество"
              value={profile.patronymic}
              onChange={handleChange}
            />
            <Input
              name="birthDate"
              type="date"
              value={profile.birthDate}
              onChange={handleChange}
            />
            <Input
              name="education"
              placeholder="Образование"
              value={profile.education}
              onChange={handleChange}
            />
            <Input
              name="experience"
              placeholder="Опыт работы"
              value={profile.experience}
              onChange={handleChange}
            />
            <Textarea
              name="skills"
              placeholder="Ключевые навыки"
              value={profile.skills}
              onChange={handleChange}
            />
            <ButtonGroup>
              <ButtonPrimary onClick={saveProfile}>
                Сохранить профиль
              </ButtonPrimary>
              <ButtonBack onClick={() => navigate(-1)}>
                Отмена
              </ButtonBack>
            </ButtonGroup>
          </Form>
        </Section>

        <Section>
          <SectionTitle>📄 Дипломы и сертификаты</SectionTitle>
          <FileInput
            type="file"
            multiple
            onChange={handleFileUpload}
          />
          <FilesContainer>
            {profile.diplomas.length > 0 ? (
              profile.diplomas.map((file, i) => (
                <FileCard key={i}>
                  <FileLink href={file.url} target="_blank" rel="noreferrer">
                    {file.name}
                  </FileLink>
                  <RemoveButton
                    onClick={() => removeFile(file.name)}
                  >
                    ✖
                  </RemoveButton>
                </FileCard>
              ))
            ) : (
              <NoFiles>Файлы не загружены</NoFiles>
            )}
          </FilesContainer>
        </Section>

        <Section>
          <SectionTitle>⭐ Просмотренные вакансии</SectionTitle>
          {viewedJobsData.length === 0 ? (
            <NoFiles>Вы пока не просматривали вакансии</NoFiles>
          ) : (
            <JobList>
              {viewedJobsData.map((job) => (
                <JobItem key={job.id}>
                  <strong>{job.position}</strong> — {job.school}
                  {job.region && <span> ({job.region})</span>}
                </JobItem>
              ))}
            </JobList>
          )}
        </Section>
      </Main>
    </Container>
  );
};

export default ProfileTeacher;

