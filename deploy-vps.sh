#!/bin/bash

# Полный скрипт деплоя на VPS
# Использование: ./deploy-vps.sh

set -e

REPO_URL="https://github.com/arri1/uchiteltut.ru.git"
APP_DIR="/opt/uchiteltut"

echo "🚀 Начинаем деплой приложения на VPS..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Запустите скрипт с sudo или от root"
    exit 1
fi

# 1. Обновление системы
echo "📦 Обновление системы..."
apt update && apt upgrade -y

# 2. Установка Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "✅ Docker уже установлен"
fi

# 3. Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose уже установлен"
fi

# 4. Установка Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Установка Nginx..."
    apt install nginx -y
else
    echo "✅ Nginx уже установлен"
fi

# 5. Установка Certbot
if ! command -v certbot &> /dev/null; then
    echo "🔒 Установка Certbot..."
    apt install certbot python3-certbot-nginx -y
else
    echo "✅ Certbot уже установлен"
fi

# 6. Клонирование репозитория
echo "📥 Клонирование репозитория..."
if [ -d "$APP_DIR" ]; then
    echo "📂 Директория уже существует, обновляем..."
    cd $APP_DIR
    git pull || echo "⚠️  Не удалось обновить, возможно есть изменения"
else
    mkdir -p /opt
    cd /opt
    git clone $REPO_URL uchiteltut
    cd $APP_DIR
fi

# 7. Создание .env файла
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️  Создание .env файла..."
    cp $APP_DIR/env.example $APP_DIR/.env
    echo "⚠️  ВАЖНО: Отредактируйте файл .env перед продолжением!"
    echo "   nano $APP_DIR/.env"
    read -p "Нажмите Enter после редактирования .env файла..."
else
    echo "✅ Файл .env уже существует"
fi

# 8. Сборка и запуск контейнеров
echo "🔨 Сборка Docker образов..."
cd $APP_DIR
docker-compose -f docker-compose.prod.yml build

echo "▶️  Запуск контейнеров..."
docker-compose -f docker-compose.prod.yml up -d

# 9. Ожидание готовности базы данных
echo "⏳ Ожидание готовности базы данных..."
sleep 15

# 10. Применение миграций
echo "📊 Применение миграций базы данных..."
docker-compose -f docker-compose.prod.yml exec -T server npx prisma migrate deploy || echo "⚠️  Миграции уже применены"

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Настройте DNS записи в панели https://dnsadmin.hosting.reg.ru/manager/ispmgr"
echo "2. Настройте Nginx конфигурации (замените yourdomain.com на ваш домен)"
echo "3. Получите SSL сертификаты: certbot --nginx -d ваш-домен.ru"
echo ""
echo "Проверьте логи: docker-compose -f docker-compose.prod.yml logs -f"
echo "Проверьте статус: docker-compose -f docker-compose.prod.yml ps"

