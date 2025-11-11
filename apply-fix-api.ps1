# Скрипт для применения исправления /api/respond через plink
# Использует пароль из документации

$hostname = "91.229.9.105"
$username = "root"
$password = "Z0ri0zb0XNMQPlt5"

# Проверяем наличие plink
$plinkPath = $null
$commonPaths = @(
    "${env:ProgramFiles}\PuTTY\plink.exe",
    "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
    "$env:USERPROFILE\Desktop\putty\plink.exe",
    ".\tools\plink.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $plinkPath = $path
        Write-Host "Найден plink: $path" -ForegroundColor Green
        break
    }
}

if (-not $plinkPath) {
    # Пробуем найти в PATH
    $plinkCmd = Get-Command plink -ErrorAction SilentlyContinue
    if ($plinkCmd) {
        $plinkPath = "plink"
    }
}

if (-not $plinkPath) {
    Write-Host "❌ plink.exe не найден!" -ForegroundColor Red
    Write-Host "Попробуем использовать sshpass или другой метод..." -ForegroundColor Yellow
    
    # Альтернатива: используем ssh с паролем через expect или другой способ
    Write-Host "`nВыполните команды вручную:" -ForegroundColor Cyan
    Write-Host "ssh root@91.229.9.105" -ForegroundColor White
    Write-Host "Пароль: $password" -ForegroundColor Gray
    Write-Host "`nЗатем выполните:" -ForegroundColor Cyan
    Write-Host @"
cd /opt/uchiteltut
sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf
if ! grep -q 'location /api/' nginx/client-http-only.conf; then
    cat >> nginx/client-http-only.conf << 'EOF'

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
fi
docker-compose -f docker-compose.prod.yml build nginx
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx
echo '✅ Готово!'
"@ -ForegroundColor White
    exit 1
}

Write-Host "🔧 Применение исправлений на сервере..." -ForegroundColor Cyan
Write-Host ""

# Команды для выполнения на сервере
$commands = @"
cd /opt/uchiteltut && \
echo '🔧 Исправление конфигурации nginx...' && \
cp nginx/client.conf nginx/client.conf.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true && \
sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf && \
if ! grep -q 'client_max_body_size' nginx/client.conf; then sed -i '/location \/api\//a\        client_max_body_size 10M;' nginx/client.conf; fi && \
sed -i 's/proxy_send_timeout 60s/proxy_send_timeout 120s/g' nginx/client.conf && \
sed -i 's/proxy_read_timeout 60s/proxy_read_timeout 120s/g' nginx/client.conf && \
if ! grep -q 'location /api/' nginx/client-http-only.conf; then cat >> nginx/client-http-only.conf << 'ENDOFFILE'

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
ENDOFFILE
fi && \
echo '✅ Конфигурация обновлена' && \
echo '🔨 Пересборка nginx...' && \
docker-compose -f docker-compose.prod.yml build nginx && \
echo '🔄 Перезапуск nginx...' && \
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx && \
echo '✅ Готово! Исправления применены.'
"@

try {
    if ($plinkPath -eq "plink") {
        # Используем plink из PATH
        $env:PLINK_PASSWORD = $password
        echo y | & $plinkPath -ssh -pw $password "$username@$hostname" $commands
    } else {
        # Используем полный путь
        echo y | & $plinkPath -ssh -pw $password "$username@$hostname" $commands
    }
    
    Write-Host "`n✅ Исправления успешно применены!" -ForegroundColor Green
    Write-Host "Проверьте работу на https://uchiteltut.ru" -ForegroundColor Yellow
} catch {
    Write-Host "`n❌ Ошибка при выполнении команд" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nПопробуйте выполнить команды вручную (см. выше)" -ForegroundColor Yellow
}

