# Портал по трудоустройству учителей

Веб-приложение для поиска работы учителей в Республике Саха (Якутия).

## 🚀 Быстрый деплой на VPS

### Автоматический деплой

```bash
# На вашем VPS выполните:
wget https://raw.githubusercontent.com/arri1/uchiteltut.ru/main/deploy-vps.sh
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

### Ручной деплой

1. **Клонируйте репозиторий:**
```bash
cd /opt
git clone https://github.com/arri1/uchiteltut.ru.git uchiteltut
cd uchiteltut
```

2. **Настройте переменные окружения:**
```bash
cp env.example .env
nano .env
```

3. **Запустите деплой:**
```bash
chmod +x deploy.sh
./deploy.sh
```

4. **Настройте DNS и SSL** (см. [QUICK_DEPLOY.md](./QUICK_DEPLOY.md))

## 📁 Структура проекта

```
uchiteltut.ru/
├── client/              # React приложение
├── newServer/           # GraphQL API сервер
├── docker-compose.yml   # Docker конфигурация для разработки
├── docker-compose.prod.yml  # Docker конфигурация для production
└── deploy.sh            # Скрипт автоматического деплоя
```

## 🛠 Технологии

### Frontend
- React 18
- Apollo Client (GraphQL)
- Ant Design
- Styled Components
- React Router

### Backend
- Node.js
- Fastify
- Apollo Server (GraphQL)
- Prisma ORM
- PostgreSQL

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)
- Let's Encrypt SSL

## 📚 Документация

- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Быстрая инструкция по деплою
- [VPS_DEPLOY.md](./VPS_DEPLOY.md) - Подробная инструкция по деплою на VPS
- [DOCKER.md](./DOCKER.md) - Документация по Docker

## 🔧 Разработка

### Локальный запуск

```bash
# Запуск базы данных
cd newServer
docker-compose up -d postgres

# Запуск сервера
cd newServer
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Запуск клиента
cd client
npm install
npm start
```

## 📝 Лицензия

MIT

