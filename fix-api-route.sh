#!/bin/bash

# Скрипт для исправления ошибки 404 на /api/respond
# Запустите этот скрипт на сервере

set -e

echo "🔧 Исправление конфигурации nginx для /api/ маршрутов..."

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Ошибка: docker-compose.prod.yml не найден"
    echo "   Убедитесь, что вы находитесь в директории /opt/uchiteltut"
    exit 1
fi

# Создаем резервные копии
echo "📦 Создание резервных копий..."
if [ -f "nginx/client.conf" ]; then
    cp nginx/client.conf nginx/client.conf.backup.$(date +%Y%m%d_%H%M%S)
fi
if [ -f "nginx/client-http-only.conf" ]; then
    cp nginx/client-http-only.conf nginx/client-http-only.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

# Исправляем client.conf
echo "✏️  Обновление nginx/client.conf..."
if [ -f "nginx/client.conf" ]; then
    # Исправляем proxy_pass для /api/
    sed -i 's|proxy_pass $api_upstream/api/;|proxy_pass $api_upstream;|g' nginx/client.conf
    
    # Добавляем client_max_body_size если его нет
    if ! grep -q "client_max_body_size" nginx/client.conf; then
        sed -i '/location \/api\//a\        client_max_body_size 10M;' nginx/client.conf
    fi
    
    # Обновляем таймауты
    sed -i 's/proxy_send_timeout 60s/proxy_send_timeout 120s/g' nginx/client.conf
    sed -i 's/proxy_read_timeout 60s/proxy_read_timeout 120s/g' nginx/client.conf
fi

# Добавляем /api/ маршрут в client-http-only.conf если его нет
echo "✏️  Обновление nginx/client-http-only.conf..."
if [ -f "nginx/client-http-only.conf" ]; then
    if ! grep -q "location /api/" nginx/client-http-only.conf; then
        # Находим строку после location /graphql и добавляем блок /api/
        awk '
        /location \/graphql/,/^    \}/ {
            print
            if (/^    \}/ && !api_added) {
                print ""
                print "    # Proxy REST API to server"
                print "    location /api/ {"
                print "        proxy_pass http://server:4000;"
                print "        proxy_http_version 1.1;"
                print "        proxy_set_header Upgrade $http_upgrade;"
                print "        proxy_set_header Connection '\''upgrade'\'';"
                print "        proxy_set_header Host $host;"
                print "        proxy_cache_bypass $http_upgrade;"
                print "        proxy_set_header X-Real-IP $remote_addr;"
                print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
                print "        proxy_set_header X-Forwarded-Proto $scheme;"
                print ""
                print "        # CORS headers"
                print "        add_header Access-Control-Allow-Origin * always;"
                print "        add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\" always;"
                print "        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\" always;"
                print ""
                print "        if ($request_method = OPTIONS) {"
                print "            return 204;"
                print "        }"
                print ""
                print "        # Увеличиваем таймауты для загрузки файлов"
                print "        client_max_body_size 10M;"
                print "        proxy_connect_timeout 60s;"
                print "        proxy_send_timeout 120s;"
                print "        proxy_read_timeout 120s;"
                print "    }"
                api_added = 1
                next
            }
        }
        !api_added { print }
        ' nginx/client-http-only.conf > nginx/client-http-only.conf.tmp
        mv nginx/client-http-only.conf.tmp nginx/client-http-only.conf
    fi
fi

echo "✅ Конфигурация обновлена"

# Пересобираем nginx
echo "🔨 Пересборка nginx контейнера..."
docker-compose -f docker-compose.prod.yml build nginx

# Проверяем конфигурацию nginx
echo "🔍 Проверка конфигурации nginx..."
if docker-compose -f docker-compose.prod.yml run --rm nginx nginx -t 2>/dev/null; then
    echo "✅ Конфигурация nginx валидна"
else
    echo "⚠️  Не удалось проверить конфигурацию в контейнере, продолжаем..."
fi

# Перезапускаем nginx
echo "🔄 Перезапуск nginx..."
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx

# Ждем немного
sleep 3

# Проверяем статус
echo "📊 Статус контейнеров:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Готово! Исправления применены."
echo ""
echo "📋 Проверьте работу:"
echo "   1. Откройте https://uchiteltut.ru"
echo "   2. Попробуйте отправить отклик на вакансию"
echo "   3. Ошибка 404 должна исчезнуть"
echo ""
echo "📝 Логи nginx: docker-compose -f docker-compose.prod.yml logs -f nginx"
echo "📝 Логи сервера: docker-compose -f docker-compose.prod.yml logs -f server"

