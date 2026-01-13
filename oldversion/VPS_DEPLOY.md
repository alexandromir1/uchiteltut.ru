# Инструкция по деплою на VPS

## Быстрый старт

Если у вас чистый VPS, выполните:

```bash
# 1. Клонируйте репозиторий
cd /opt
sudo git clone <your-repo-url> uchiteltut
cd uchiteltut

# 2. Запустите скрипт автоматической настройки
chmod +x setup-vps.sh
./setup-vps.sh

# 3. Перелогиньтесь (чтобы применить права docker)
exit
# Зайдите снова на VPS

# 4. Создайте .env файл
cp env.example .env
nano .env  # Настройте переменные

# 5. Замените 'yourdomain.com' в nginx конфигурациях на ваш домен
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-client.conf
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-api.conf

# 6. Настройте Nginx и SSL (см. раздел ниже)

# 7. Запустите деплой
chmod +x deploy.sh
./deploy.sh
```

## Подготовка VPS

### 1. Установите Docker и Docker Compose

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Клонируйте репозиторий на VPS

```bash
cd /opt
sudo git clone <your-repo-url> uchiteltut
cd uchiteltut
```

### 3. Создайте файл `.env` для production

```bash
cp env.example .env
nano .env
```

Настройте переменные:

```env
# PostgreSQL
POSTGRES_USER=teacher_portal
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=teacher_portal_db

# Server
JWT_SECRET=<generate-strong-secret>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Client
REACT_APP_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

**Генерация JWT_SECRET:**
```bash
openssl rand -base64 32
```

## Настройка Nginx (обратный прокси)

### 1. Установите Nginx

```bash
sudo apt install nginx -y
```

### 2. Создайте конфигурацию для клиента

```bash
sudo nano /etc/nginx/sites-available/uchiteltut
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Proxy to Docker client
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Создайте конфигурацию для API

```bash
sudo nano /etc/nginx/sites-available/uchiteltut-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Proxy to Docker server
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Активируйте конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/uchiteltut /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/uchiteltut-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Установите SSL сертификаты (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y

# Для основного домена
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Для API домена
sudo certbot --nginx -d api.yourdomain.com
```

## Деплой приложения

### 1. Обновите docker-compose.prod.yml

В файле `.env` установите правильные URL:

```env
REACT_APP_GRAPHQL_URL=https://api.yourdomain.com/graphql
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Соберите и запустите контейнеры

```bash
# Соберите образы
docker-compose -f docker-compose.prod.yml build

# Запустите контейнеры
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps

# Просмотрите логи
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Примените миграции базы данных

```bash
docker-compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

### 4. Импортируйте данные из Excel

```bash
docker-compose -f docker-compose.prod.yml exec server npm run import-excel
```

## Настройка DNS

### В панели DNS (https://dnsadmin.hosting.reg.ru/manager/ispmgr)

Создайте следующие записи:

**A записи:**
- `yourdomain.com` → IP вашего VPS
- `www.yourdomain.com` → IP вашего VPS
- `api.yourdomain.com` → IP вашего VPS

**NS записи** (уже настроены):
- ns5.hosting.reg.ru
- ns6.hosting.reg.ru

## Обновление приложения

```bash
cd /opt/uchiteltut

# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Применить новые миграции (если есть)
docker-compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

## Мониторинг

### Просмотр логов
```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Только сервер
docker-compose -f docker-compose.prod.yml logs -f server

# Только клиент
docker-compose -f docker-compose.prod.yml logs -f client
```

### Проверка статуса
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Health check
```bash
curl https://api.yourdomain.com/health
```

## Резервное копирование

### Бэкап базы данных

```bash
# Создать бэкап
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U teacher_portal teacher_portal_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U teacher_portal teacher_portal_db < backup.sql
```

## Автоматический деплой (опционально)

Создайте скрипт `deploy.sh`:

```bash
#!/bin/bash
cd /opt/uchiteltut
git pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
echo "Deployment completed!"
```

Сделайте его исполняемым:
```bash
chmod +x deploy.sh
```

## Troubleshooting

### Проблемы с правами доступа
```bash
sudo chown -R $USER:$USER /opt/uchiteltut
```

### Проблемы с портами
```bash
# Проверьте, какие порты заняты
sudo netstat -tulpn | grep LISTEN
```

### Перезапуск всех сервисов
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Очистка и пересборка
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

