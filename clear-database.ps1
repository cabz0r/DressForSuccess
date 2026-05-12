# Dress for Success - Clear Database
# Deletes the SQLite database file and restarts the API to recreate it fresh

$apiDir = "$PSScriptRoot\DressForSuccess.API"
$dbPath = "$apiDir\dressforsuccess.db"

Write-Host "`n========================================" -ForegroundColor Red
Write-Host " Dress for Success - Clear Database" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

# 1. Stop the API if running
Write-Host "Stopping API processes..." -ForegroundColor Yellow
Get-Process -Name dotnet -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  Done." -ForegroundColor Green

# 2. Delete the database file
if (Test-Path $dbPath) {
    Remove-Item $dbPath -Force
    Write-Host "  Deleted: $dbPath" -ForegroundColor Green
} else {
    Write-Host "  No database file found at $dbPath (already clean)." -ForegroundColor Yellow
}

# Also remove WAL and SHM journal files if they exist
Remove-Item "$dbPath-wal" -Force -ErrorAction SilentlyContinue
Remove-Item "$dbPath-shm" -Force -ErrorAction SilentlyContinue

Write-Host "`n  Database cleared!" -ForegroundColor Green
Write-Host "  The database will be recreated automatically when the API starts." -ForegroundColor Gray
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Run: .\start.ps1          (to restart the application)" -ForegroundColor Gray
Write-Host "    2. Run: .\seed-data.ps1      (to populate test data)" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Red

