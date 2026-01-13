# Быстрое применение исправления для /api/respond

## Вариант 1: Автоматический (рекомендуется)

### На Windows:
```powershell
.\fix-api-route.ps1
```

### На Linux/Mac или прямо на сервере:
```bash
ssh root@91.229.9.105 'bash -s' < fix-api-route.sh
```

## Вариант 2: Вручную (скопируйте и выполните на сервере)

Подключитесь к серверу:
```bash
ssh root@91.229.9.105
```

Затем выполните эти команды:

```bash
cd /opt/uchiteltut

# Создаем резервные копии
cp nginx/client.conf nginx/client.conf.backup.$(date +%Y%m%d_%H%M%S)
cp nginx/client-http-only.conf nginx/client-http-only.conf.backup.$(date +%Y%m%d_%H%M%S)

# Исправляем proxy_pass в client.conf
sed -i 's|proxy_pass $api_upstream/api/;|proxy_pass $api_upstream;|g' nginx/client.conf

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        if ($request_method = OPTIONS) {
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

# Пересобираем и перезапускаем nginx
docker-compose -f docker-compose.prod.yml build nginx
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx

echo "✅ Готово! Проверьте работу на сайте."
```

## Вариант 3: Через одну команду (самый быстрый)

Скопируйте и выполните эту команду на вашем компьютере:

### Windows (PowerShell):
```powershell
ssh root@91.229.9.105 "cd /opt/uchiteltut && sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf && if ! grep -q 'location /api/' nginx/client-http-only.conf; then cat >> nginx/client-http-only.conf << 'EOF'

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
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\" always;
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\" always;
        if (\$request_method = OPTIONS) { return 204; }
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
EOF
fi && docker-compose -f docker-compose.prod.yml build nginx && docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx && echo '✅ Готово!'"
```

### Linux/Mac:
```bash
ssh root@91.229.9.105 "cd /opt/uchiteltut && sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf && if ! grep -q 'location /api/' nginx/client-http-only.conf; then cat >> nginx/client-http-only.conf << 'EOF'

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
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS, PUT, DELETE\" always;
        add_header Access-Control-Allow-Headers \"Content-Type, Authorization\" always;
        if (\$request_method = OPTIONS) { return 204; }
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
EOF
fi && docker-compose -f docker-compose.prod.yml build nginx && docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx && echo '✅ Готово!'"
```

## Проверка

После выполнения команд:
1. Подождите 10-15 секунд
2. Откройте https://uchiteltut.ru
3. Попробуйте отправить отклик на вакансию
4. Ошибка 404 должна исчезнуть

## Если что-то пошло не так

Восстановите из резервной копии:
```bash
ssh root@91.229.9.105
cd /opt/uchiteltut
ls -la nginx/*.backup*  # Найдите последнюю резервную копию
cp nginx/client.conf.backup.XXXXXXXX_XXXXXX nginx/client.conf
cp nginx/client-http-only.conf.backup.XXXXXXXX_XXXXXX nginx/client-http-only.conf
docker-compose -f docker-compose.prod.yml build nginx
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

