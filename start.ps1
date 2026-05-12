# Dress for Success - Start All Services
Write-Host "Starting Dress for Success..." -ForegroundColor Magenta

# Kill any existing instances
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name dotnet -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start API
Write-Host "`n[1/2] Starting API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\DressForSuccess.API'; Write-Host 'API Starting...' -ForegroundColor Green; dotnet run --no-launch-profile"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\DressForSuccess.Web'; Write-Host 'Frontend Starting...' -ForegroundColor Green; node_modules\.bin\vite --port 3000"

Start-Sleep -Seconds 5

Write-Host "`n====================================" -ForegroundColor Green
Write-Host " Dress for Success is starting up!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host " Frontend: http://localhost:3000" -ForegroundColor White
Write-Host " API:      http://localhost:5000" -ForegroundColor White
Write-Host "====================================" -ForegroundColor Green
Write-Host "`nOpening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

