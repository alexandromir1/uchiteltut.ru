#!/bin/bash

# Скрипт для деплоя на VPS
# Использование: ./deploy-to-vps.sh

set -e

VPS_IP="91.229.9.105"
VPS_USER="root"
VPS_PASS="Z0ri0zb0XNMQPlt5"
REPO_URL="https://github.com/arri1/uchiteltut.ru.git"
APP_DIR="/opt/uchiteltut"

echo "🚀 Начинаем деплой на VPS $VPS_IP..."

# Проверка наличия sshpass
if ! command -v sshpass &> /dev/null; then
    echo "📦 Установка sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass || echo "⚠️  Установите sshpass вручную: brew install hudochenkov/sshpass/sshpass"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y sshpass || sudo yum install -y sshpass
    fi
fi

# Функция для выполнения команд на VPS
ssh_exec() {
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $VPS_USER@$VPS_IP "$1"
}

# Функция для копирования файлов на VPS
scp_copy() {
    sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$1" $VPS_USER@$VPS_IP:"$2"
}

echo "📡 Подключение к VPS..."

# 1. Обновление системы и установка зависимостей
echo "📦 Установка зависимостей на VPS..."
ssh_exec "apt update && apt upgrade -y && \
    (command -v docker >/dev/null 2>&1 || (curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh)) && \
    (command -v docker-compose >/dev/null 2>&1 || (curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose)) && \
    (command -v nginx >/dev/null 2>&1 || apt install -y nginx) && \
    (command -v certbot >/dev/null 2>&1 || apt install -y certbot python3-certbot-nginx)"

# 2. Клонирование/обновление репозитория
echo "📥 Клонирование репозитория..."
ssh_exec "mkdir -p /opt && \
    (cd /opt && ([ -d uchiteltut ] && (cd uchiteltut && git pull) || git clone $REPO_URL uchiteltut))"

# 3. Создание .env файла (если не существует)
echo "⚙️  Настройка переменных окружения..."
ssh_exec "cd $APP_DIR && \
    ([ -f .env ] || (cp env.example .env && echo '⚠️  Файл .env создан. Настройте переменные вручную!'))"

# 4. Сборка и запуск контейнеров
echo "🔨 Сборка Docker образов..."
ssh_exec "cd $APP_DIR && docker-compose -f docker-compose.prod.yml build"

echo "▶️  Запуск контейнеров..."
ssh_exec "cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d"

# 5. Ожидание готовности базы данных
echo "⏳ Ожидание готовности базы данных..."
sleep 15

# 6. Применение миграций
echo "📊 Применение миграций..."
ssh_exec "cd $APP_DIR && docker-compose -f docker-compose.prod.yml exec -T server npx prisma migrate deploy || echo 'Миграции уже применены'"

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Настройте .env файл:"
echo "   ssh root@$VPS_IP"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Настройте DNS записи в панели https://dnsadmin.hosting.reg.ru/manager/ispmgr"
echo "3. Настройте Nginx конфигурации (замените yourdomain.com на ваш домен)"
echo "4. Получите SSL сертификаты: certbot --nginx -d ваш-домен.ru"
echo ""
echo "Проверьте статус: ssh root@$VPS_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps'"

