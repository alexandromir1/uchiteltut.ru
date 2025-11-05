# Деплой на VPS 91.229.9.105

## Автоматический деплой (с вашего компьютера)

### Вариант 1: Использование готового скрипта

```bash
# Установите sshpass (если нужно)
# macOS:
brew install hudochenkov/sshpass/sshpass

# Linux:
sudo apt-get install sshpass

# Запустите деплой
./deploy-to-vps.sh
```

### Вариант 2: Ручной деплой через SSH

```bash
# 1. Подключитесь к VPS
ssh root@91.229.9.105
# Пароль: Z0ri0zb0XNMQPlt5

# 2. Выполните команды на VPS:

# Установка зависимостей
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
apt install -y nginx certbot python3-certbot-nginx

# Клонирование репозитория
cd /opt
git clone https://github.com/arri1/uchiteltut.ru.git uchiteltut
cd uchiteltut

# Настройка .env
cp env.example .env
nano .env  # Настройте переменные:
# - POSTGRES_PASSWORD (сильный пароль)
# - JWT_SECRET (openssl rand -base64 32)
# - REACT_APP_GRAPHQL_URL (https://api.ваш-домен.ru/graphql)
# - CORS_ORIGINS (https://ваш-домен.ru,https://www.ваш-домен.ru)

# Запуск деплоя
chmod +x deploy.sh
./deploy.sh

# Импорт данных (опционально)
docker-compose -f docker-compose.prod.yml exec server npm run import-excel
```

## Настройка DNS

Войдите в панель: https://dnsadmin.hosting.reg.ru/manager/ispmgr

**Логин:** ce72594395  
**Пароль:** pXeI3f1Gqtk!0ky

Создайте A-записи, указывающие на IP **91.229.9.105**:
- `ваш-домен.ru` → 91.229.9.105
- `www.ваш-домен.ru` → 91.229.9.105
- `api.ваш-домен.ru` → 91.229.9.105

## Настройка Nginx и SSL

После настройки DNS:

```bash
ssh root@91.229.9.105
cd /opt/uchiteltut

# Замените yourdomain.com на ваш домен
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-client.conf
sed -i 's/yourdomain.com/ваш-домен.ru/g' nginx-api.conf

# Скопируйте конфигурации
cp nginx-client.conf /etc/nginx/sites-available/uchiteltut
cp nginx-api.conf /etc/nginx/sites-available/uchiteltut-api

# Активируйте
ln -s /etc/nginx/sites-available/uchiteltut /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/uchiteltut-api /etc/nginx/sites-enabled/

# Проверьте и перезагрузите
nginx -t
systemctl reload nginx

# Получите SSL сертификаты
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
certbot --nginx -d api.ваш-домен.ru
```

## Проверка работы

```bash
# Проверка статуса контейнеров
ssh root@91.229.9.105 'cd /opt/uchiteltut && docker-compose -f docker-compose.prod.yml ps'

# Просмотр логов
ssh root@91.229.9.105 'cd /opt/uchiteltut && docker-compose -f docker-compose.prod.yml logs -f'

# Health check
curl http://91.229.9.105:4000/health
```

## Обновление приложения

```bash
ssh root@91.229.9.105
cd /opt/uchiteltut
git pull
./deploy.sh
```

