# PowerShell скрипт для исправления ошибки 404 на /api/respond
# Запустите этот скрипт на Windows, он подключится к серверу и применит исправления

$server = "root@91.229.9.105"
$commands = @"
cd /opt/uchiteltut

echo '🔧 Исправление конфигурации nginx...'

# Создаем резервные копии
cp nginx/client.conf nginx/client.conf.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp nginx/client-http-only.conf nginx/client-http-only.conf.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Исправляем proxy_pass в client.conf
sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf

# Добавляем client_max_body_size если его нет
if ! grep -q 'client_max_body_size' nginx/client.conf; then
    sed -i '/location \/api\//a\        client_max_body_size 10M;' nginx/client.conf
fi

# Обновляем таймауты
sed -i 's/proxy_send_timeout 60s/proxy_send_timeout 120s/g' nginx/client.conf
sed -i 's/proxy_read_timeout 60s/proxy_read_timeout 120s/g' nginx/client.conf

# Добавляем /api/ маршрут в client-http-only.conf если его нет
if ! grep -q 'location /api/' nginx/client-http-only.conf; then
    cat >> nginx/client-http-only.conf << 'API_ROUTE'

    # Proxy REST API to server
    location /api/ {
        proxy_pass http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        if (\$request_method = OPTIONS) {
            return 204;
        }

        # Увеличиваем таймауты для загрузки файлов
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
API_ROUTE
fi

echo '✅ Конфигурация обновлена'

# Пересобираем nginx
echo '🔨 Пересборка nginx...'
docker-compose -f docker-compose.prod.yml build nginx

# Перезапускаем nginx
echo '🔄 Перезапуск nginx...'
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx

echo '✅ Готово! Проверьте работу на сайте.'
"@

Write-Host "Подключение к серверу и применение исправлений..." -ForegroundColor Cyan
ssh $server $commands

Write-Host "`nГотово! Исправления применены." -ForegroundColor Green
Write-Host "Проверьте работу на https://uchiteltut.ru" -ForegroundColor Yellow

