import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import herb from "../../assets/herb.png";
import background from "../../assets/background.png";
import profileIcon from "../../assets/teacherProfileIcon.png";

import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../hooks/useJobs";
import {
  Container,
  Header,
  Bar,
  HeaderLeft,
  Herb,
  HeaderTitle,
  HeaderRight,
  HeaderVakancies,
  HeaderRightLogin,
  HeaderRightLoginLink,
  UserSection,
  UserName,
  ProfileIconContainer,
  ProfileIcon,
  DropdownMenu,
  DropdownItem,
  Title,
  Text,
  InputContainer,
  Input,
  SearchButton,
  Main,
  Grid,
  LoadingContainer,
  LoadingText,
  ErrorContainer,
  ErrorText,
  ErrorSubtext,
  NoJobs,
  NoJobsText,
  Item,
  TitleItem,
  RateContainer,
  Price,
  Rate,
  TextItem,
  MoreLink,
  More,
  CategoryContainer,
  Category,
  CategoryText,
} from './styles';

// 🔹 Выносим HeaderComponent наружу и мемоизируем его
const HeaderComponent = React.memo(({ 
  jobCount, 
  searchQuery, 
  onSearchChange,
  currentUser,
  isMenuOpen,
  menuRef,
  onMenuToggle,
  onProfileClick,
  onResumesClick,
  onLogoutClick,
  onLoginClick,
}) => (
  <Header $backgroundImage={background}>
    <Bar>
      <HeaderLeft>
        <Link to={'/'}>
          <Herb src={herb} alt="Герб" />
        </Link>
        <HeaderTitle>Республика Саха (Якутия)</HeaderTitle>
      </HeaderLeft>

      <HeaderRight>
        <HeaderVakancies>Вакансии: {jobCount}</HeaderVakancies>

        {currentUser ? (
          <UserSection ref={menuRef}>
            <UserName>Привет, {currentUser.name}</UserName>

            <ProfileIconContainer onClick={onMenuToggle}>
              <ProfileIcon
                src={profileIcon}
                alt="Профиль"
              />
            </ProfileIconContainer>

            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem onClick={onProfileClick}>
                  🧑‍🏫 Мой профиль
                </DropdownItem>
                {currentUser.role === "school" && (
                  <DropdownItem onClick={onResumesClick}>
                    📄 Резюме учителей
                  </DropdownItem>
                )}
                <DropdownItem danger onClick={onLogoutClick}>
                  🚪 Выйти
                </DropdownItem>
              </DropdownMenu>
            )}
          </UserSection>
        ) : (
          <HeaderRightLogin onClick={onLoginClick}>
            <HeaderRightLoginLink>Войти</HeaderRightLoginLink>
          </HeaderRightLogin>
        )}
      </HeaderRight>
    </Bar>

    <Title>Найдите работу мечты</Title>
    <Text>
      Лучшие вакансии для учителей по всей Республике Саха (Якутия)
    </Text>

    <InputContainer>
      <Input
        placeholder="Поиск вакансий..."
        value={searchQuery}
        onChange={onSearchChange}
      />
      <SearchButton>
        <span style={{ color: "#fff" }}>🔍</span>
      </SearchButton>
    </InputContainer>
  </Header>
));

const Home = () => {
  const { jobs, loading, error } = useJobs();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне блока
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Исправленный поиск
  const handleSearch = useCallback((e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  }, []);

  // Исправленный useMemo для фильтрации
  const displayJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    return jobs.filter(job =>
      job.position?.toLowerCase().includes(searchQuery) ||
      job.school?.toLowerCase().includes(searchQuery) ||
      job.region?.toLowerCase().includes(searchQuery)
    );
  }, [jobs, searchQuery]);

  // Мемоизируем обработчики для меню
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleProfileClick = useCallback(() => {
    navigate(
      currentUser?.role === "teacher"
        ? "/profile/teacher"
        : "/profile/school"
    );
  }, [navigate, currentUser?.role]);

  const handleResumesClick = useCallback(() => {
    navigate("/resumes");
  }, [navigate]);

  const handleLogoutClick = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  if (loading)
    return (
      <Container>
        <HeaderComponent 
          jobCount={0} 
          searchQuery={searchQuery} 
          onSearchChange={handleSearch}
          currentUser={currentUser}
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          onMenuToggle={handleMenuToggle}
          onProfileClick={handleProfileClick}
          onResumesClick={handleResumesClick}
          onLogoutClick={handleLogoutClick}
          onLoginClick={handleLoginClick}
        />
        <LoadingContainer>
          <LoadingText>Загрузка вакансий...</LoadingText>
        </LoadingContainer>
      </Container>
    );

  if (error)
    return (
      <Container>
        <HeaderComponent 
          jobCount={0} 
          searchQuery={searchQuery} 
          onSearchChange={handleSearch}
          currentUser={currentUser}
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          onMenuToggle={handleMenuToggle}
          onProfileClick={handleProfileClick}
          onResumesClick={handleResumesClick}
          onLogoutClick={handleLogoutClick}
          onLoginClick={handleLoginClick}
        />
        <ErrorContainer>
          <ErrorText>Ошибка загрузки данных 😢</ErrorText>
          <ErrorSubtext>Попробуйте обновить страницу</ErrorSubtext>
        </ErrorContainer>
      </Container>
    );

  return (
    <Container>
      <HeaderComponent 
        jobCount={jobs.length} 
        searchQuery={searchQuery} 
        onSearchChange={handleSearch}
        currentUser={currentUser}
        isMenuOpen={isMenuOpen}
        menuRef={menuRef}
        onMenuToggle={handleMenuToggle}
        onProfileClick={handleProfileClick}
        onResumesClick={handleResumesClick}
        onLogoutClick={handleLogoutClick}
        onLoginClick={handleLoginClick}
      />

      <Main>
        {displayJobs.length === 0 ? (
          <NoJobs>
            <NoJobsText>
              {searchQuery
                ? "Ничего не найдено по вашему запросу"
                : "Нет доступных вакансий"}
            </NoJobsText>
          </NoJobs>
        ) : (
          <Grid>
            {displayJobs.map((job) => {
              const date = job.openDate
                ? new Date(job.openDate).toLocaleDateString("ru-RU")
                : "Дата не указана";

              return (
                <Item key={job.id} className="job-item">
                  <TitleItem>
                    {job.position || "Без названия"}
                  </TitleItem>

                  <RateContainer>
                    <Price>
                      {job.salary || "Зарплата не указана"}
                    </Price>
                    <Rate>
                      {job.hours || "Часы не указаны"}
                    </Rate>
                  </RateContainer>

                  <TextItem>
                    <strong style={{ marginRight: 10 }}>Школа:</strong>{" "}
                    {job.school}
                    {job.region && ` • ${job.region}`}
                  </TextItem>

                  <TextItem>
                    <strong>Дата публикации:</strong> {date}
                  </TextItem>

                  <CategoryContainer>
                    {job.housing && (
                      <Category>
                        <CategoryText>{job.housing}</CategoryText>
                      </Category>
                    )}
                    {job.benefits && (
                      <Category>
                        <CategoryText>Льготы</CategoryText>
                      </Category>
                    )}
                    {job.studentEmployment && (
                      <Category>
                        <CategoryText>Для студентов</CategoryText>
                      </Category>
                    )}
                  </CategoryContainer>

                  <MoreLink
                    to={`/job/${job.id}`}
                    className="more-link"
                  >
                    <More className="more-text">
                      Подробнее
                    </More>
                  </MoreLink>
                </Item>
              );
            })}
          </Grid>
        )}
      </Main>
    </Container>
  );
};

export default Home;

