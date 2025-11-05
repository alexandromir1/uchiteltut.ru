# Teacher Portal GraphQL Server

GraphQL сервер на основе Apollo Server, Prisma и PostgreSQL в Docker.

## Технологии

- **Apollo Server** - GraphQL сервер
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных в Docker
- **Fastify** - веб-фреймворк
- **JWT** - аутентификация

## Установка и запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Запустите PostgreSQL в Docker

```bash
docker-compose up -d
```

### 3. Настройте переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

### 4. Настройте Prisma

```bash
# Генерируем Prisma Client
npm run prisma:generate

# Создаем миграции
npm run prisma:migrate
```

### 5. Запустите сервер

```bash
# Production
npm start

# Development (с автоперезагрузкой)
npm run dev
```

## Endpoints

- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## GraphQL Schema

### Queries

- `me` - получить текущего пользователя
- `jobs(active: Boolean)` - получить все вакансии
- `job(id: ID!)` - получить вакансию по ID
- `teachers(publicOnly: Boolean)` - получить всех учителей
- `teacher(id: ID!)` - получить учителя по ID
- `schools` - получить все школы
- `school(id: ID!)` - получить школу по ID
- `responses(jobId: Int)` - получить отклики
- `response(id: ID!)` - получить отклик по ID

### Mutations

- `register(input: RegisterInput!)` - регистрация
- `login(input: LoginInput!)` - вход
- `createJob(input: JobInput!)` - создать вакансию
- `updateJob(id: ID!, input: JobInput!)` - обновить вакансию
- `deleteJob(id: ID!)` - удалить вакансию
- `createResponse(input: ResponseInput!)` - создать отклик
- `deleteResponse(id: ID!)` - удалить отклик

## Аутентификация

Для защищенных операций добавьте заголовок:

```
Authorization: Bearer <your-jwt-token>
```

## Примеры запросов

### Регистрация

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

### Вход

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

### Получить все вакансии

```graphql
query GetJobs {
  jobs(active: true) {
    id
    position
    school
    region
    salary
    hours
    createdAt
  }
}
```

### Создать вакансию

```graphql
mutation CreateJob {
  createJob(input: {
    position: "Учитель математики"
    school: "Школа №1"
    region: "Якутск"
    hours: "18 часов"
    salary: "45000 руб."
    housing: "Предоставляется"
  }) {
    id
    position
    school
    createdAt
  }
}
```

## Prisma Studio

Для просмотра и редактирования данных в базе:

```bash
npm run prisma:studio
```

Откроется веб-интерфейс на http://localhost:5555

