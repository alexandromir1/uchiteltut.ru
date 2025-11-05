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

# Используем временную HTTP конфигурацию
echo "📝 Устанавливаем временную HTTP конфигурацию..."
cp $PROJECT_DIR/nginx/client-http-only.conf $PROJECT_DIR/nginx/client.conf

# Пересобираем и запускаем nginx
echo "▶️  Запускаем nginx в HTTP режиме для валидации..."
cd $PROJECT_DIR/nginx
docker-compose -f ../docker-compose.prod.yml build nginx
cd $PROJECT_DIR
docker-compose -f docker-compose.prod.yml up -d nginx

# Ждем запуска nginx
echo "⏳ Ожидание запуска nginx..."
sleep 10

# Получаем сертификаты
echo "📜 Получение SSL сертификатов..."
docker-compose -f docker-compose.prod.yml run --rm certbot

# Восстанавливаем HTTPS конфигурацию
echo "📝 Восстанавливаем HTTPS конфигурацию..."
cp $PROJECT_DIR/nginx/client-http-only.conf $PROJECT_DIR/nginx/client.conf
# Добавляем HTTPS блок (используем sed для добавления HTTPS секции)
cat >> $PROJECT_DIR/nginx/client.conf << 'HTTPS_EOF'

# HTTPS
server {
    listen 443 ssl http2;
    server_name uchiteltut.ru www.uchiteltut.ru;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/uchiteltut.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uchiteltut.ru/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Proxy GraphQL API to server
    location /graphql {
        proxy_pass http://server:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy to Docker client container
    location / {
        proxy_pass http://client:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://client:80;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
HTTPS_EOF

# Пересобираем и перезапускаем nginx с SSL
echo "🔄 Перезапускаем nginx с SSL..."
cd $PROJECT_DIR/nginx
docker-compose -f ../docker-compose.prod.yml build nginx
cd $PROJECT_DIR
docker-compose -f docker-compose.prod.yml restart nginx

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

