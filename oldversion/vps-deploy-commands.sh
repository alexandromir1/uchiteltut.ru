#!/bin/bash
# Команды для выполнения на VPS (скопируйте и выполните на сервере)

# 1. Обновление и установка зависимостей
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
apt install -y nginx certbot python3-certbot-nginx

# 2. Клонирование репозитория
cd /opt
git clone https://github.com/arri1/uchiteltut.ru.git uchiteltut
cd uchiteltut

# 3. Создание .env
cp env.example .env
echo "⚠️  Отредактируйте .env файл: nano .env"

# 4. Генерация JWT_SECRET
echo "JWT_SECRET=$(openssl rand -base64 32)"

# 5. Запуск деплоя
chmod +x deploy.sh
./deploy.sh

# 6. Импорт данных (опционально)
# docker-compose -f docker-compose.prod.yml exec server npm run import-excel

