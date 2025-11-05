# Быстрый деплой на VPS

## Шаг 1: Подключитесь к VPS

```bash
ssh root@your-vps-ip
```

## Шаг 2: Установите зависимости

```bash
# Обновление
apt update && apt upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Nginx
apt install nginx certbot python3-certbot-nginx -y
```

## Шаг 3: Клонируйте проект

```bash
cd /opt
git clone https://github.com/arri1/uchiteltut.ru.git uchiteltut
cd uchiteltut
```

## Шаг 4: Настройте переменные окружения

```bash
cp env.example .env
nano .env
```

Установите:
- `POSTGRES_PASSWORD` - сильный пароль для БД
- `JWT_SECRET` - сгенерируйте: `openssl rand -base64 32`
- `REACT_APP_GRAPHQL_URL` - https://api.ваш-домен.ru/graphql
- `CORS_ORIGINS` - https://ваш-домен.ru,https://www.ваш-домен.ru

## Шаг 5: Настройте Nginx

Замените `yourdomain.com` на ваш домен:

```bash
# Обновите конфигурации
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-client.conf
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-api.conf

# Скопируйте конфигурации
cp nginx-client.conf /etc/nginx/sites-available/uchiteltut
cp nginx-api.conf /etc/nginx/sites-available/uchiteltut-api

# Активируйте
ln -s /etc/nginx/sites-available/uchiteltut /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/uchiteltut-api /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t
systemctl reload nginx
```

## Шаг 6: Настройте DNS

Войдите в панель: https://dnsadmin.hosting.reg.ru/manager/ispmgr

**Логин:** ce72594395  
**Пароль:** pXeI3f1Gqtk!0ky

Создайте A-записи:
- `ваш-домен.ru` → IP вашего VPS
- `www.ваш-домен.ru` → IP вашего VPS
- `api.ваш-домен.ru` → IP вашего VPS

Подождите 5-15 минут для распространения DNS.

## Шаг 7: Получите SSL сертификаты

```bash
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
certbot --nginx -d api.ваш-домен.ru
```

## Шаг 8: Запустите приложение

```bash
chmod +x deploy.sh
./deploy.sh
```

## Шаг 9: Импортируйте данные (опционально)

```bash
docker-compose -f docker-compose.prod.yml exec server npm run import-excel
```

## Готово! 🎉

Приложение доступно:
- Клиент: https://ваш-домен.ru
- API: https://api.ваш-домен.ru/graphql

## Полезные команды

```bash
# Логи
docker-compose -f docker-compose.prod.yml logs -f

# Статус
docker-compose -f docker-compose.prod.yml ps

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Обновление
git pull && ./deploy.sh
```

