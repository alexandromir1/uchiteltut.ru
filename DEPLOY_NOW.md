# 🚀 Быстрый деплой на VPS 91.229.9.105

## Выполните эти команды на VPS:

```bash
# Подключитесь к VPS
ssh root@91.229.9.105
# Пароль: Z0ri0zb0XNMQPlt5

# Скопируйте и выполните все команды ниже:

# 1. Установка зависимостей
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
apt install -y nginx certbot python3-certbot-nginx

# 2. Клонирование репозитория
cd /opt
git clone https://github.com/arri1/uchiteltut.ru.git uchiteltut
cd uchiteltut

# 3. Создание .env файла
cp env.example .env

# 4. Генерация JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# 5. Настройка .env (отредактируйте вручную)
nano .env

# Установите:
# POSTGRES_PASSWORD=<сильный-пароль>
# REACT_APP_GRAPHQL_URL=https://api.ваш-домен.ru/graphql
# CORS_ORIGINS=https://ваш-домен.ru,https://www.ваш-домен.ru

# 6. Запуск деплоя
chmod +x deploy.sh
./deploy.sh

# 7. Импорт данных (опционально)
docker-compose -f docker-compose.prod.yml exec server npm run import-excel
```

## После деплоя:

1. **Настройте DNS** в панели https://dnsadmin.hosting.reg.ru/manager/ispmgr
   - Логин: ce72594395
   - Пароль: pXeI3f1Gqtk!0ky
   - Создайте A-записи для вашего домена → 91.229.9.105

2. **Настройте Nginx:**
```bash
cd /opt/uchiteltut
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-client.conf
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-api.conf
cp nginx-client.conf /etc/nginx/sites-available/uchiteltut
cp nginx-api.conf /etc/nginx/sites-available/uchiteltut-api
ln -s /etc/nginx/sites-available/uchiteltut /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/uchiteltut-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

3. **Получите SSL:**
```bash
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
certbot --nginx -d api.ваш-домен.ru
```

## Проверка:

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Логи
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:4000/health
```

