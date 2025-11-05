#!/bin/bash

# Скрипт для начальной настройки VPS

set -e

echo "🚀 Настройка VPS для деплоя..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker установлен. Требуется перелогиниться для применения изменений."
else
    echo "✅ Docker уже установлен"
fi

# Установка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose установлен"
else
    echo "✅ Docker Compose уже установлен"
fi

# Установка Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Установка Nginx..."
    sudo apt install nginx -y
    echo "✅ Nginx установлен"
else
    echo "✅ Nginx уже установлен"
fi

# Установка Certbot
if ! command -v certbot &> /dev/null; then
    echo "🔒 Установка Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot установлен"
else
    echo "✅ Certbot уже установлен"
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Перелогиньтесь или выполните: newgrp docker"
echo "2. Создайте файл .env из env.example"
echo "3. Настройте Nginx конфигурации (nginx-client.conf и nginx-api.conf)"
echo "4. Замените 'yourdomain.com' на ваш домен в nginx конфигурациях"
echo "5. Запустите: ./deploy.sh"

