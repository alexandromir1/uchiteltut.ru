FROM node:18-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (нужен prisma для миграций)
RUN npm ci

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Создаем директорию для данных
RUN mkdir -p data/excel

EXPOSE 4000

# Запускаем миграции и сервер
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]

