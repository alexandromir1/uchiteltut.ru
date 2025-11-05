# Quick Start Guide

## Быстрый старт

### 1. Установка зависимостей

```bash
cd newServer
npm install
```

### 2. Запуск PostgreSQL в Docker

```bash
docker-compose up -d
```

Проверьте, что контейнер запущен:
```bash
docker ps
```

### 3. Настройка базы данных

```bash
# Генерируем Prisma Client
npm run prisma:generate

# Создаем миграции и применяем их
npm run prisma:migrate
```

При первом запуске миграции вам будет предложено ввести имя миграции. Используйте: `init`

### 4. Запуск сервера

```bash
# Development режим
npm run dev
```

Сервер будет доступен на:
- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## Примеры GraphQL запросов

Откройте GraphQL Playground по адресу http://localhost:4000/graphql

### Регистрация нового пользователя

```graphql
mutation Register {
  register(input: {
    email: "teacher@example.com"
    password: "password123"
    name: "Иван Иванов"
    role: "teacher"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Регистрация школы

```graphql
mutation RegisterSchool {
  register(input: {
    email: "school@example.com"
    password: "password123"
    name: "Школа №1"
    role: "school"
    schoolName: "Средняя школа №1"
    district: "Якутск"
    phone: "+7 (999) 123-45-67"
  }) {
    token
    user {
      id
      email
      name
      role
      school {
        id
        schoolName
        district
      }
    }
  }
}
```

### Вход в систему

```graphql
mutation Login {
  login(input: {
    email: "teacher@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Получить все вакансии (требует авторизации)

В разделе HTTP Headers добавьте:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Запрос:
```graphql
query GetJobs {
  jobs(active: true) {
    id
    position
    school
    region
    salary
    hours
    housing
    benefits
    createdAt
  }
}
```

### Создать вакансию (требует авторизации)

```graphql
mutation CreateJob {
  createJob(input: {
    position: "Учитель математики"
    school: "Школа №1"
    region: "Якутск"
    hours: "18 часов"
    salary: "45000 руб."
    housing: "Предоставляется общежитие"
    benefits: "Социальный пакет"
    contacts: "+7 (999) 123-45-67"
    email: "school@example.com"
    duties: "Преподавание математики в 5-11 классах"
  }) {
    id
    position
    school
    region
    createdAt
  }
}
```

### Получить текущего пользователя

```graphql
query Me {
  me {
    id
    email
    name
    role
    teacher {
      id
      fullName
      specialization
    }
    school {
      id
      schoolName
      district
    }
  }
}
```

## Структура проекта

```
newServer/
├── src/
│   ├── graphql/
│   │   ├── schema.js      # GraphQL схема
│   │   └── resolvers.js   # GraphQL resolvers
│   ├── lib/
│   │   ├── prisma.js      # Prisma Client
│   │   └── auth.js        # Функции аутентификации
│   └── index.js           # Точка входа
├── prisma/
│   └── schema.prisma      # Prisma схема базы данных
├── docker-compose.yml     # Docker конфигурация для PostgreSQL
├── package.json
└── README.md
```

## Полезные команды

```bash
# Просмотр данных в базе через Prisma Studio
npm run prisma:studio

# Создать новую миграцию
npm run prisma:migrate

# Сбросить базу данных (ОСТОРОЖНО!)
npx prisma migrate reset

# Остановить Docker контейнер
docker-compose down

# Остановить и удалить данные (ОСТОРОЖНО!)
docker-compose down -v
```

## Troubleshooting

### Проблема: Не удается подключиться к базе данных

Убедитесь, что PostgreSQL контейнер запущен:
```bash
docker ps
```

Если контейнер не запущен:
```bash
docker-compose up -d
```

### Проблема: Prisma Client не найден

Выполните:
```bash
npm run prisma:generate
```

### Проблема: Порты заняты

Измените порты в:
- `docker-compose.yml` - для PostgreSQL
- `.env` - для сервера

