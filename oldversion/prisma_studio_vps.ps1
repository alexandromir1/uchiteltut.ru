# Prisma Studio on VPS via SSH Tunnel
param(
    [string]$hostname = "91.229.9.105",
    [string]$username = "root",
    [string]$password = "Z0ri0zb0XNMQPlt5",
    [int]$port = 22,
    [int]$studioPort = 5555,
    [string]$projectPath = "/opt/uchiteltut/newServer",
    [string]$plinkPath = ""
)

Write-Host "=== Prisma Studio on VPS ===" -ForegroundColor Cyan
Write-Host "VPS: $hostname" -ForegroundColor Gray
Write-Host "Project: $projectPath" -ForegroundColor Gray
Write-Host "Studio Port: $studioPort" -ForegroundColor Gray
Write-Host ""

# Find plink.exe
if ([string]::IsNullOrEmpty($plinkPath)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $possiblePaths = @(
        Join-Path $scriptDir "tools\plink.exe",
        Join-Path $PSScriptRoot "tools\plink.exe",
        "${env:ProgramFiles}\PuTTY\plink.exe",
        "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
        "$env:USERPROFILE\Desktop\putty\plink.exe"
    )
    
    $plinkFound = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $plinkPath = $path
            $plinkFound = $true
            Write-Host "Found plink.exe at: $plinkPath" -ForegroundColor Green
            break
        }
    }
    
    # Try to find in PATH
    if (-not $plinkFound) {
        $plinkInPath = Get-Command plink -ErrorAction SilentlyContinue
        if ($plinkInPath) {
            $plinkPath = $plinkInPath.Path
            $plinkFound = $true
            Write-Host "Found plink.exe in PATH: $plinkPath" -ForegroundColor Green
        }
    }
    
    # Download if not found
    if (-not $plinkFound) {
        Write-Host "plink.exe not found. Downloading..." -ForegroundColor Yellow
        $toolsDir = Join-Path $scriptDir "tools"
        if (-not (Test-Path $toolsDir)) {
            New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
        }
        $plinkPath = Join-Path $toolsDir "plink.exe"
        
        try {
            $url = "https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe"
            Invoke-WebRequest -Uri $url -OutFile $plinkPath -UseBasicParsing -ErrorAction Stop
            Write-Host "Downloaded plink.exe to: $plinkPath" -ForegroundColor Green
            $plinkFound = $true
        }
        catch {
            Write-Host "Error downloading plink.exe: $_" -ForegroundColor Red
            Write-Host "Please download PuTTY manually from: https://www.chiark.greenend.org.uk/~sgtatham/putty/" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Verify plink exists
if (-not (Test-Path $plinkPath)) {
    Write-Host "Error: plink.exe not found at $plinkPath" -ForegroundColor Red
    Write-Host "Please download it first or update the path." -ForegroundColor Yellow
    exit 1
}

$plinkPath = Resolve-Path $plinkPath
Write-Host "Using plink: $plinkPath" -ForegroundColor Cyan
Write-Host ""

# Check if project exists on VPS
Write-Host "Checking project on VPS..." -ForegroundColor Yellow
$checkProject = & $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname "test -d '$projectPath' && echo 'exists' || echo 'not found'"
if ($checkProject -notmatch "exists") {
    Write-Host "Error: Project not found at $projectPath on VPS" -ForegroundColor Red
    Write-Host "Please check the project path." -ForegroundColor Yellow
    exit 1
}

Write-Host "Project found!" -ForegroundColor Green
Write-Host ""

# Kill existing Prisma Studio if running
Write-Host "Checking for existing Prisma Studio processes..." -ForegroundColor Yellow
& $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname "pkill -f 'prisma studio' || true"
Start-Sleep -Seconds 2

# Create SSH tunnel in background
Write-Host "Creating SSH tunnel (localhost:$studioPort -> VPS:$studioPort)..." -ForegroundColor Cyan
Write-Host "This will run in the background." -ForegroundColor Gray
Write-Host ""

$tunnelJob = Start-Job -ScriptBlock {
    param($plink, $hostname, $username, $password, $port, $studioPort)
    & $plink -ssh -P $port -l $username -pw $password -L "${studioPort}:localhost:${studioPort}" -N $hostname
} -ArgumentList $plinkPath, $hostname, $username, $password, $port, $studioPort

Start-Sleep -Seconds 3

# Start Prisma Studio on VPS
Write-Host "Starting Prisma Studio on VPS..." -ForegroundColor Green
Write-Host ""

# Run Prisma Studio in background on VPS
# Load .env file if exists and export DATABASE_URL
$studioCommand = "cd '$projectPath' && if [ -f .env ]; then export $(cat .env | grep -v '^#' | xargs); fi && nohup npx prisma studio --port $studioPort --browser none > /tmp/prisma-studio.log 2>&1 & echo `$!"
$processId = & $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname $studioCommand

if ($processId) {
    Write-Host "Prisma Studio started! PID: $processId" -ForegroundColor Green
    Write-Host ""
    Write-Host "Waiting for Studio to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check if Studio is running
    $checkStudio = & $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname "ps -p $processId > /dev/null 2>&1 && echo 'running' || echo 'stopped'"
    
    if ($checkStudio -match "running") {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Prisma Studio is running!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access Prisma Studio at:" -ForegroundColor Cyan
        Write-Host "  http://localhost:$studioPort" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SSH Tunnel is running in background." -ForegroundColor Gray
        Write-Host ""
        Write-Host "To stop Prisma Studio, press Ctrl+C or run:" -ForegroundColor Gray
        Write-Host "  tools\plink.exe -ssh -P $port root@$hostname -pw $password 'pkill -f \"prisma studio\"'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Press Ctrl+C to close the tunnel and exit..." -ForegroundColor Yellow
        
        # Keep script running
        try {
            while ($true) {
                Start-Sleep -Seconds 5
                # Check if tunnel job is still running
                if ($tunnelJob.State -eq "Completed" -or $tunnelJob.State -eq "Failed") {
                    Write-Host "SSH tunnel stopped!" -ForegroundColor Red
                    break
                }
            }
        }
        catch {
            Write-Host "`nStopping..." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Error: Prisma Studio failed to start!" -ForegroundColor Red
        Write-Host "Check logs on VPS: /tmp/prisma-studio.log" -ForegroundColor Yellow
        & $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname "cat /tmp/prisma-studio.log"
    }
}
else {
    Write-Host "Error: Failed to start Prisma Studio!" -ForegroundColor Red
}

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
Stop-Job $tunnelJob -ErrorAction SilentlyContinue
Remove-Job $tunnelJob -ErrorAction SilentlyContinue
& $plinkPath -ssh -P $port -l $username -pw $password -batch $hostname "pkill -f 'prisma studio' || true"

Write-Host "Done!" -ForegroundColor Green

