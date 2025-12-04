import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { Layout, Card, Row, Col, Statistic, Table, Tag, Spin, Alert, Button } from 'antd';
import 'antd/dist/reset.css';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { GET_STATISTICS } from '../graphql/adminQueries';
import { GET_JOBS } from '../graphql/queries';
import { GET_TEACHERS } from '../graphql/queries';
import { GET_RESPONSES } from '../graphql/queries';
import AdminLogin from '../components/AdminLogin';

const { Header, Content } = Layout;

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, авторизован ли админ
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    navigate('/');
  };

  // Все хуки должны вызываться до условного возврата
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_STATISTICS, {
    skip: !isAuthenticated,
  });
  const { data: jobsData, loading: jobsLoading } = useQuery(GET_JOBS, { 
    variables: { active: true },
    skip: !isAuthenticated,
  });
  const { data: teachersData, loading: teachersLoading } = useQuery(GET_TEACHERS, { 
    variables: { publicOnly: false },
    skip: !isAuthenticated,
  });
  const { data: responsesData, loading: responsesLoading } = useQuery(GET_RESPONSES, {
    skip: !isAuthenticated,
  });

  // Если не авторизован, показываем форму входа
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (statsLoading || jobsLoading || teachersLoading || responsesLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (statsError) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '50px' }}>
          <Alert
            message="Ошибка загрузки статистики"
            description={statsError.message}
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  const stats = statsData?.statistics || {};
  const jobs = jobsData?.jobs || [];
  const teachers = teachersData?.teachers || [];
  const responses = responsesData?.responses || [];

  // Таблица вакансий по регионам
  const jobsByRegionColumns = [
    {
      title: 'Район',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Количество вакансий',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
  ];

  // Таблица откликов по регионам
  const responsesByRegionColumns = [
    {
      title: 'Регион',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Количество откликов',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
  ];

  // Таблица последних откликов
  const recentResponsesColumns = [
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      responsive: ['md'],
    },
    {
      title: 'Вакансия',
      key: 'job',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.job?.position}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.job?.school}</div>
        </div>
      ),
    },
    {
      title: 'Район',
      key: 'region',
      width: 120,
      responsive: ['md'],
      render: (_, record) => record.job?.region || 'Не указан',
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString('ru-RU'),
    },
  ];

  // Таблица резюме учителей
  const teachersColumns = [
    {
      title: 'Имя',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
    },
    {
      title: 'Специализация',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 150,
      responsive: ['md'],
    },
    {
      title: 'Предметы',
      dataIndex: 'subjects',
      key: 'subjects',
      width: 200,
      responsive: ['lg'],
    },
    {
      title: 'Опыт',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      render: (exp) => exp ? `${exp} лет` : 'Не указан',
    },
    {
      title: 'Публичное',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      render: (isPublic) => (
        <Tag color={isPublic ? 'green' : 'red'}>
          {isPublic ? 'Да' : 'Нет'}
        </Tag>
      ),
    },
  ];

  return (
    <ConfigProvider locale={ruRU}>
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header 
        style={{ 
          background: '#2637A1', 
          padding: '0 16px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          minHeight: '64px',
        }}
      >
        <h1 style={{ color: '#fff', margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', flex: 1 }}>
          <BarChartOutlined /> Панель администратора
        </h1>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ marginLeft: '16px' }}
        >
          Выйти
        </Button>
      </Header>
      <Content style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Основная статистика */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="Всего вакансий"
                value={stats.totalJobs || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="Активных вакансий"
                value={stats.activeJobs || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="Всего откликов"
                value={stats.totalResponses || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="Учителей"
                value={stats.totalTeachers || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="Школ"
                value={stats.totalSchools || 0}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Статистика по регионам */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Вакансии по районам" bordered={false}>
              <Table
                dataSource={stats.jobsByRegion || []}
                columns={jobsByRegionColumns}
                rowKey="region"
                pagination={false}
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Отклики по регионам" bordered={false}>
              <Table
                dataSource={stats.responsesByRegion || []}
                columns={responsesByRegionColumns}
                rowKey="region"
                pagination={false}
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        {/* Последние отклики */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card title="Последние отклики" bordered={false}>
              <Table
                dataSource={stats.recentResponses || []}
                columns={recentResponsesColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        {/* Резюме учителей */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title={`Резюме учителей (${teachers.length})`} bordered={false}>
              <Table
                dataSource={teachers}
                columns={teachersColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
    </ConfigProvider>
  );
};

export default AdminDashboard;

