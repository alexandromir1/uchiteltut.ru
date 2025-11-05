#!/bin/bash
# Скрипт для настройки автозапуска Docker контейнеров при перезагрузке VPS

set -e

echo "🔧 Настройка автозапуска Docker контейнеров..."

# Путь к проекту
PROJECT_DIR="/opt/uchiteltut"
SERVICE_FILE="/etc/systemd/system/teacher-portal.service"

# Создаем systemd service файл
cat > $SERVICE_FILE << 'EOF'
[Unit]
Description=Teacher Portal Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/uchiteltut
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd
systemctl daemon-reload

# Включаем автозапуск
systemctl enable teacher-portal.service

echo "✅ Автозапуск настроен!"
echo ""
echo "Проверка статуса:"
systemctl status teacher-portal.service --no-pager | head -10

echo ""
echo "Для проверки автозапуска после перезагрузки:"
echo "  systemctl status teacher-portal.service"
echo "  docker ps"

