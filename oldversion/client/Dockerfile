# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
ARG REACT_APP_GRAPHQL_URL=http://localhost:4000/graphql
ENV REACT_APP_GRAPHQL_URL=$REACT_APP_GRAPHQL_URL

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

