#!/bin/bash
# Скрипт для настройки SSL сертификатов через Let's Encrypt

set -e

DOMAIN="uchiteltut.ru"
EMAIL="admin@uchiteltut.ru"
PROJECT_DIR="/opt/uchiteltut"

echo "🔒 Настройка SSL сертификатов для $DOMAIN..."

# Создаем директории для certbot
mkdir -p $PROJECT_DIR/certbot/conf
mkdir -p $PROJECT_DIR/certbot/www

# Переходим в директорию проекта
cd $PROJECT_DIR

# Останавливаем nginx временно для получения сертификатов
echo "⏸️  Временно останавливаем nginx..."
docker-compose -f docker-compose.prod.yml stop nginx

# Получаем сертификаты
echo "📜 Получение SSL сертификатов..."
docker-compose -f docker-compose.prod.yml run --rm certbot

# Запускаем nginx обратно
echo "▶️  Запускаем nginx с SSL..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Проверяем сертификаты
if [ -f "$PROJECT_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ SSL сертификаты успешно установлены!"
    echo "🌐 Приложение доступно по адресу: https://$DOMAIN"
else
    echo "❌ Ошибка: сертификаты не найдены"
    exit 1
fi

# Настраиваем автоматическое обновление сертификатов
echo "🔄 Настройка автоматического обновления сертификатов..."
cat > /etc/cron.d/certbot-renew << EOF
0 3 * * * root cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF

echo "✅ Настройка SSL завершена!"

