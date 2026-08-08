Write-Host "Starting Pulse frontend (Windows)..." -ForegroundColor Cyan

if (-not (Test-Path node_modules)) {
    Write-Host "node_modules not found, running npm install first..." -ForegroundColor Yellow
    npm install
}

npm run dev -- --host