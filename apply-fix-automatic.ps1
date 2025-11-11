# Автоматическое применение исправления для /api/respond
# Использует найденный пароль из проекта

$VPS_IP = "91.229.9.105"
$VPS_USER = "root"
$VPS_PASS = "Z0ri0zb0XNMQPlt5"

Write-Host "🔧 Применение исправления для /api/respond..." -ForegroundColor Cyan
Write-Host "Подключение к серверу $VPS_IP..." -ForegroundColor Yellow

# Команды для выполнения на сервере
$commands = @"
cd /opt/uchiteltut

echo '📦 Создание резервных копий...'
cp nginx/client.conf nginx/client.conf.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp nginx/client-http-only.conf nginx/client-http-only.conf.backup.\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

echo '✏️  Исправление nginx/client.conf...'
# Исправляем proxy_pass
sed -i 's|proxy_pass \$api_upstream/api/;|proxy_pass \$api_upstream;|g' nginx/client.conf

# Добавляем client_max_body_size если его нет
if ! grep -q 'client_max_body_size' nginx/client.conf; then
    sed -i '/location \/api\//a\        client_max_body_size 10M;' nginx/client.conf
fi

# Обновляем таймауты
sed -i 's/proxy_send_timeout 60s/proxy_send_timeout 120s/g' nginx/client.conf
sed -i 's/proxy_read_timeout 60s/proxy_read_timeout 120s/g' nginx/client.conf

echo '✏️  Обновление nginx/client-http-only.conf...'
# Добавляем /api/ маршрут если его нет
if ! grep -q 'location /api/' nginx/client-http-only.conf; then
    cat >> nginx/client-http-only.conf << 'API_ROUTE'

    # Proxy REST API to server
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

        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        if (\$request_method = OPTIONS) {
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

echo '✅ Конфигурация обновлена'

echo '🔨 Пересборка nginx...'
docker-compose -f docker-compose.prod.yml build nginx

echo '🔄 Перезапуск nginx...'
docker-compose -f docker-compose.prod.yml up -d --force-recreate nginx

echo '✅ Готово! Исправления применены.'
echo ''
echo '📊 Статус контейнеров:'
docker-compose -f docker-compose.prod.yml ps
"@

# Проверяем наличие sshpass или plink
$usePlink = $false
$plinkPath = $null

# Проверяем plink (PuTTY)
$plinkPaths = @(
    "${env:ProgramFiles}\PuTTY\plink.exe",
    "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
    "$env:USERPROFILE\Desktop\putty\plink.exe",
    ".\tools\plink.exe"
)

foreach ($path in $plinkPaths) {
    if (Test-Path $path) {
        $plinkPath = $path
        $usePlink = $true
        Write-Host "Найден plink: $path" -ForegroundColor Green
        break
    }
}

if (-not $usePlink) {
    # Пробуем использовать ssh с паролем через expect или просто ssh
    Write-Host "Попытка подключения через SSH..." -ForegroundColor Yellow
    
    # Создаем временный файл с командами
    $tempScript = [System.IO.Path]::GetTempFileName()
    $commands | Out-File -FilePath $tempScript -Encoding UTF8
    
    try {
        # Пробуем подключиться через ssh (может запросить пароль)
        Write-Host "Введите пароль при запросе: $VPS_PASS" -ForegroundColor Cyan
        ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "bash -s" < $tempScript
    }
    catch {
        Write-Host "Ошибка SSH подключения. Пробуем альтернативный способ..." -ForegroundColor Yellow
        
        # Альтернатива: используем PowerShell для создания SSH сессии
        Write-Host ""
        Write-Host "=== РУЧНОЕ ПОДКЛЮЧЕНИЕ ===" -ForegroundColor Yellow
        Write-Host "Выполните эти команды вручную:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "ssh $VPS_USER@$VPS_IP" -ForegroundColor White
        Write-Host "Пароль: $VPS_PASS" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Затем выполните команды из файла: $tempScript" -ForegroundColor Cyan
        Write-Host "Или скопируйте команды ниже:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $commands -ForegroundColor White
    }
    finally {
        Remove-Item $tempScript -ErrorAction SilentlyContinue
    }
}
else {
    # Используем plink
    Write-Host "Использование plink для подключения..." -ForegroundColor Green
    
    # Создаем временный файл с командами
    $tempScript = [System.IO.Path]::GetTempFileName()
    $commands | Out-File -FilePath $tempScript -Encoding UTF8
    
    try {
        # Выполняем команды через plink
        & $plinkPath -ssh -batch -pw $VPS_PASS "$VPS_USER@$VPS_IP" "bash -s" < $tempScript
        
        Write-Host ""
        Write-Host "✅ Исправления применены успешно!" -ForegroundColor Green
        Write-Host "Проверьте работу на https://uchiteltut.ru" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Ошибка при выполнении команд через plink" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Выполните команды вручную (см. выше)" -ForegroundColor Yellow
    }
    finally {
        Remove-Item $tempScript -ErrorAction SilentlyContinue
    }
}

