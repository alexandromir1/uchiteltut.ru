#!/bin/bash
# Скрипт для автоматического обновления SSL сертификатов

set -e

PROJECT_DIR="/opt/uchiteltut"

echo "🔄 Обновление SSL сертификатов..."

cd $PROJECT_DIR

# Обновляем сертификаты
docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet

# Перезагружаем nginx для применения новых сертификатов
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ Сертификаты обновлены!"

