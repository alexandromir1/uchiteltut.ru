# Start Docker containers locally using Docker Compose v2
# This script uses 'docker compose' (v2) instead of 'docker-compose' (v1)

$ErrorActionPreference = "Stop"

Write-Host "=== Starting Docker Containers ===" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$newServerDir = Join-Path $scriptDir "newServer"

if (-not (Test-Path $newServerDir)) {
    Write-Host "Error: newServer directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Directory: $newServerDir" -ForegroundColor Gray
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker is not running or not accessible!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Change to newServer directory
Set-Location $newServerDir

Write-Host "Starting containers with docker compose v2..." -ForegroundColor Cyan
Write-Host ""

# Use docker compose (v2) instead of docker-compose (v1)
try {
    docker compose up -d
    Write-Host ""
    Write-Host "Containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Yellow
    Write-Host "  docker compose logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To stop containers:" -ForegroundColor Yellow
    Write-Host "  docker compose down" -ForegroundColor Gray
}
catch {
    Write-Host ""
    Write-Host "Error starting containers: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor Gray
    Write-Host "2. Try restarting Docker Desktop" -ForegroundColor Gray
    Write-Host "3. Check if port 5432 is already in use" -ForegroundColor Gray
    exit 1
}

