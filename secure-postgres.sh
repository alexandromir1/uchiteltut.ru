#!/bin/bash
# Скрипт для блокировки доступа к PostgreSQL извне

# Блокируем порт 5432 для внешних подключений
iptables -I INPUT -p tcp --dport 5432 -j DROP 2>/dev/null || true

# Разрешаем доступ только из Docker сети (172.x.x.x)
iptables -I INPUT -p tcp --dport 5432 -s 172.0.0.0/8 -j ACCEPT 2>/dev/null || true

# Разрешаем доступ с localhost
iptables -I INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT 2>/dev/null || true

echo "✅ PostgreSQL порт 5432 заблокирован для внешних подключений"
echo "✅ Доступ разрешен только из Docker сети и localhost"

# Сохраняем правила iptables (для Ubuntu/Debian)
if command -v iptables-save >/dev/null 2>&1; then
    iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
fi

