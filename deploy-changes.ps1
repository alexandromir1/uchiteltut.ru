# Скрипт для загрузки изменений на сервер и перезапуска
param(
    [string]$hostname = "91.229.9.105",
    [string]$username = "root",
    [string]$password = "Z0ri0zb0XNMQPlt5",
    [int]$port = 22
)

Write-Host "=== Загрузка изменений на сервер ===" -ForegroundColor Cyan
Write-Host "Host: $hostname" -ForegroundColor Gray
Write-Host ""

# Проверка наличия plink
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue
if (-not $plinkPath) {
    $commonPaths = @(
        "${env:ProgramFiles}\PuTTY\plink.exe",
        "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
        "$env:USERPROFILE\Desktop\putty\plink.exe",
        ".\tools\plink.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $plinkExe = $path
            break
        }
    }
    
    if (-not $plinkExe) {
        Write-Host "Ошибка: plink.exe не найден!" -ForegroundColor Red
        Write-Host "Установите PuTTY или поместите plink.exe в папку tools/" -ForegroundColor Yellow
        exit 1
    }
} else {
    $plinkExe = "plink"
}

# Проверка наличия pscp
$pscpPath = Get-Command pscp -ErrorAction SilentlyContinue
if (-not $pscpPath) {
    $commonPaths = @(
        "${env:ProgramFiles}\PuTTY\pscp.exe",
        "${env:ProgramFiles(x86)}\PuTTY\pscp.exe",
        "$env:USERPROFILE\Desktop\putty\pscp.exe",
        ".\tools\pscp.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $pscpExe = $path
            break
        }
    }
    
    if (-not $pscpExe) {
        Write-Host "Ошибка: pscp.exe не найден!" -ForegroundColor Red
        Write-Host "Установите PuTTY или поместите pscp.exe в папку tools/" -ForegroundColor Yellow
        exit 1
    }
} else {
    $pscpExe = "pscp"
}

$APP_DIR = "/opt/uchiteltut"

Write-Host "📤 Копирование измененных файлов..." -ForegroundColor Green

# Копируем измененный файл сервера
Write-Host "  - newServer/src/index.js" -ForegroundColor Gray
& $pscpExe -P $port -pw $password -batch "newServer\src\index.js" "${username}@${hostname}:${APP_DIR}/newServer/src/index.js"

# Копируем документацию (опционально)
if (Test-Path "НАСТРОЙКА_ОТПРАВКИ_ОТКЛИКОВ.md") {
    Write-Host "  - НАСТРОЙКА_ОТПРАВКИ_ОТКЛИКОВ.md" -ForegroundColor Gray
    & $pscpExe -P $port -pw $password -batch "НАСТРОЙКА_ОТПРАВКИ_ОТКЛИКОВ.md" "${username}@${hostname}:${APP_DIR}/НАСТРОЙКА_ОТПРАВКИ_ОТКЛИКОВ.md"
}

Write-Host ""
Write-Host "🔄 Перезапуск сервера (без потери данных)..." -ForegroundColor Green

# Команды для выполнения на сервере
$commands = @(
    "cd $APP_DIR",
    "docker-compose -f docker-compose.prod.yml restart server",
    "sleep 3",
    "docker-compose -f docker-compose.prod.yml ps server"
)

$fullCommand = $commands -join " && "

Write-Host "Выполняю команды на сервере..." -ForegroundColor Cyan
& $plinkExe -ssh -P $port -l $username -pw $password -batch $hostname $fullCommand

Write-Host ""
Write-Host "✅ Изменения загружены и сервер перезапущен!" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте логи:" -ForegroundColor Yellow
Write-Host "  ssh root@$hostname 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f server'" -ForegroundColor Gray
Write-Host ""

