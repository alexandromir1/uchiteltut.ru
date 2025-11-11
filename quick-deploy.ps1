# Быстрый деплой изменений на сервер
# Использование: .\quick-deploy.ps1

$hostname = "91.229.9.105"
$username = "root"
$password = "Z0ri0zb0XNMQPlt5"
$port = 22
$APP_DIR = "/opt/uchiteltut"

Write-Host "=== Быстрый деплой изменений ===" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия файла
$filePath = "newServer\src\index.js"
if (-not (Test-Path $filePath)) {
    Write-Host "Ошибка: файл $filePath не найден!" -ForegroundColor Red
    Write-Host "Убедитесь, что вы находитесь в корневой директории проекта" -ForegroundColor Yellow
    exit 1
}

# Путь к PuTTY
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
$pscpPath = "C:\Program Files\PuTTY\pscp.exe"

if (-not (Test-Path $plinkPath)) {
    Write-Host "Ошибка: PuTTY не найден в $plinkPath" -ForegroundColor Red
    Write-Host "Установите PuTTY или используйте инструкцию ИНСТРУКЦИЯ_ДЕПЛОЯ.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "📤 Копирование файла на сервер..." -ForegroundColor Green
try {
    & $pscpPath -P $port -pw $password -batch "$filePath" "${username}@${hostname}:${APP_DIR}/newServer/src/index.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Файл успешно загружен" -ForegroundColor Green
    } else {
        throw "Ошибка копирования файла"
    }
} catch {
    Write-Host "❌ Ошибка при копировании файла: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Попробуйте выполнить вручную:" -ForegroundColor Yellow
    Write-Host "  ssh root@$hostname" -ForegroundColor Gray
    Write-Host "  cd $APP_DIR" -ForegroundColor Gray
    Write-Host "  # Скопируйте содержимое newServer/src/index.js" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🔄 Перезапуск сервера..." -ForegroundColor Green
try {
    $restartCmd = "cd $APP_DIR && docker-compose -f docker-compose.prod.yml restart server"
    & $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname $restartCmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Сервер перезапущен" -ForegroundColor Green
    } else {
        throw "Ошибка перезапуска"
    }
} catch {
    Write-Host "❌ Ошибка при перезапуске: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Попробуйте выполнить вручную:" -ForegroundColor Yellow
    Write-Host "  ssh root@$hostname" -ForegroundColor Gray
    Write-Host "  cd $APP_DIR" -ForegroundColor Gray
    Write-Host "  docker-compose -f docker-compose.prod.yml restart server" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "✅ Деплой завершен успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте логи:" -ForegroundColor Yellow
Write-Host "  ssh root@$hostname 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f server'" -ForegroundColor Gray
Write-Host ""

