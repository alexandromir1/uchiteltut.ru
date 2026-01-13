# SSH Connection Script to VPS using PuTTY (plink)
param(
    [string]$hostname = "91.229.9.105",
    [string]$username = "root",
    [string]$password = "Z0ri0zb0XNMQPlt5",
    [int]$port = 22,
    [string]$command = ""
)

Write-Host "=== VPS Connection Script ===" -ForegroundColor Cyan
Write-Host "Host: $hostname" -ForegroundColor Gray
Write-Host "User: $username" -ForegroundColor Gray
Write-Host "Port: $port" -ForegroundColor Gray
Write-Host ""

# Check if plink is available
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue
if (-not $plinkPath) {
    Write-Host "PuTTY plink not found in PATH!" -ForegroundColor Red
    Write-Host "Trying common locations..." -ForegroundColor Yellow
    
    # Try common PuTTY installation paths
    $commonPaths = @(
        "${env:ProgramFiles}\PuTTY\plink.exe",
        "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
        "$env:USERPROFILE\Desktop\putty\plink.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Host "Found plink at: $path" -ForegroundColor Green
            $plinkPath = $path
            break
        }
    }
    
    if (-not $plinkPath) {
        Write-Host "Error: plink.exe not found!" -ForegroundColor Red
        Write-Host "Please install PuTTY or add plink.exe to PATH" -ForegroundColor Yellow
        Write-Host "Download from: https://www.chiark.greenend.org.uk/~sgtatham/putty/" -ForegroundColor Cyan
        exit 1
    }
}

# Use full path if found in common locations
if ($plinkPath -is [System.String]) {
    $plinkExe = $plinkPath
} else {
    $plinkExe = "plink"
}

Write-Host "Connecting to $hostname as $username..." -ForegroundColor Green
Write-Host ""

try {
    if ($command) {
        # Execute single command
        Write-Host "Executing command: $command" -ForegroundColor Cyan
        & $plinkExe -ssh -P $port -l $username -pw $password -batch $hostname $command
    }
    else {
        # Interactive session
        Write-Host "Starting interactive SSH session..." -ForegroundColor Cyan
        Write-Host "Press Ctrl+C or type 'exit' to disconnect" -ForegroundColor Gray
        Write-Host ""
        
        # Auto-accept host key on first connection
        & $plinkExe -ssh -P $port -l $username -pw $password $hostname
    }
    
    Write-Host ""
    Write-Host "Connection closed." -ForegroundColor Yellow
}
catch {
    Write-Host "Error connecting: $_" -ForegroundColor Red
    exit 1
}
