import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Layout } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';

const { Content } = Layout;

const AdminLogin = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    setError('');
    setLoading(true);

    // Проверка логина и пароля
    if (values.username === 'admin' && values.password === 'teacher123job') {
      // Сохраняем в localStorage, что админ авторизован
      localStorage.setItem('adminAuthenticated', 'true');
      setLoading(false);
      onLogin();
    } else {
      setError('Неверный логин или пароль');
      setLoading(false);
    }
  };

  return (
    <ConfigProvider locale={ruRU}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <Card
            title={
              <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                Вход в панель администратора
              </div>
            }
            style={{
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError('')}
                style={{ marginBottom: '16px' }}
              />
            )}
            <Form
              name="admin-login"
              onFinish={handleSubmit}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Пожалуйста, введите логин!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Логин"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Пожалуйста, введите пароль!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Пароль"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  style={{ height: '45px', fontSize: '16px' }}
                >
                  Войти
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLogin;

