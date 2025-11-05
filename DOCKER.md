# Docker Deployment Guide

## Быстрый старт

### 1. Создайте файл `.env`

```bash
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками.

### 2. Запустите все сервисы

```bash
docker-compose up -d
```

### 3. Примените миграции базы данных

```bash
docker-compose exec server npx prisma migrate deploy
```

### 4. Импортируйте данные из Excel (опционально)

```bash
docker-compose exec server npm run import-excel
```

## Доступ к приложению

- **Клиент (React)**: http://localhost:3000
- **Сервер (GraphQL)**: http://localhost:4000/graphql
- **PostgreSQL**: localhost:5432

## Команды

### Остановить все сервисы
```bash
docker-compose down
```

### Просмотреть логи
```bash
docker-compose logs -f
```

### Пересобрать образы
```bash
docker-compose build --no-cache
```

### Остановить и удалить volumes (включая базу данных)
```bash
docker-compose down -v
```

## Production Deployment

Для production используйте `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Важно для production:**
- Измените `JWT_SECRET` на безопасный случайный ключ
- Настройте правильный `REACT_APP_GRAPHQL_URL` (должен указывать на ваш публичный домен, например: `https://api.yourdomain.com/graphql`)
- Настройте `CORS_ORIGINS` чтобы разрешить запросы с вашего домена клиента
- Используйте обратный прокси (nginx/traefik) для HTTPS
- Настройте резервное копирование базы данных
- Не используйте порты по умолчанию в production

## Структура сервисов

- **postgres**: PostgreSQL база данных
- **server**: GraphQL API сервер (Fastify + Apollo Server)
- **client**: React приложение (Nginx для статики)

## Переменные окружения

См. `.env.example` для списка всех переменных окружения.

