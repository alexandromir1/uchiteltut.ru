# Исправление ошибки 404 для /api/respond

## Проблема
При отправке отклика на вакансию возникает ошибка 404 для `/api/respond`.

## Что было исправлено

1. ✅ Исправлена конфигурация nginx для проксирования `/api/` запросов
2. ✅ Добавлено проксирование `/api/` в HTTP-only конфигурацию
3. ✅ Увеличены таймауты для загрузки файлов (резюме)
4. ✅ Добавлен лимит размера файла (10MB)

## Применение исправлений на сервере

### Шаг 1: Подключитесь к серверу

```bash
ssh root@91.229.9.105
```

### Шаг 2: Перейдите в директорию проекта

```bash
cd /opt/uchiteltut
```

### Шаг 3: Получите последние изменения из git

```bash
git pull
```

Если изменений нет, обновите файлы вручную:

```bash
# Проверьте текущую конфигурацию
cat nginx/client.conf | grep -A 20 "location /api/"
```

### Шаг 4: Пересоберите nginx контейнер

```bash
docker-compose -f docker-compose.prod.yml build nginx
```

### Шаг 5: Перезапустите nginx

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

Или перезапустите все сервисы:

```bash
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

### Шаг 6: Проверьте логи

```bash
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Шаг 7: Проверьте конфигурацию nginx

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

Должно показать: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

## Проверка работы

1. Откройте сайт: https://uchiteltut.ru
2. Найдите вакансию с указанным email
3. Нажмите "Откликнуться на вакансию"
4. Заполните форму и отправьте
5. Проверьте консоль браузера (F12) - ошибка 404 должна исчезнуть

## Если проблема сохраняется

### Проверка 1: Убедитесь, что сервер работает

```bash
docker-compose -f docker-compose.prod.yml ps
```

Все контейнеры должны быть в статусе `Up`.

### Проверка 2: Проверьте, что сервер отвечает на /api/respond

```bash
docker-compose -f docker-compose.prod.yml exec server curl -X POST http://localhost:4000/api/respond
```

Должна быть ошибка валидации (это нормально), но не 404.

### Проверка 3: Проверьте логи сервера

```bash
docker-compose -f docker-compose.prod.yml logs server | tail -50
```

Ищите ошибки или предупреждения.

### Проверка 4: Проверьте логи nginx

```bash
docker-compose -f docker-compose.prod.yml logs nginx | tail -50
```

Ищите ошибки проксирования.

## Альтернативное решение (если git pull не работает)

Если не можете обновить через git, обновите файлы вручную:

```bash
cd /opt/uchiteltut

# Создайте резервную копию
cp nginx/client.conf nginx/client.conf.backup
cp nginx/client-http-only.conf nginx/client-http-only.conf.backup

# Отредактируйте файлы
nano nginx/client.conf
```

В файле `nginx/client.conf` найдите строку:
```
proxy_pass $api_upstream/api/;
```

И замените на:
```
proxy_pass $api_upstream;
```

Также убедитесь, что есть настройки:
```
client_max_body_size 10M;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

В файле `nginx/client-http-only.conf` добавьте блок:

```nginx
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
```

После редактирования пересоберите и перезапустите nginx (см. шаги 4-5 выше).

