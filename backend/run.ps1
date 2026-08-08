Write-Host "Starting Pulse backend (Windows)..." -ForegroundColor Cyan

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator." -ForegroundColor Yellow
    Write-Host "Packet capture and device discovery will fail without it." -ForegroundColor Yellow
    Write-Host "Close this window and re-run PowerShell 'as Administrator'." -ForegroundColor Yellow
    Write-Host ""
}

$npcap = Test-Path "C:\Windows\System32\Npcap"
if (-not $npcap) {
    Write-Host "WARNING: Npcap does not appear to be installed." -ForegroundColor Yellow
    Write-Host "Packet capture requires it: https://npcap.com (check 'WinPcap API-compatible mode')" -ForegroundColor Yellow
    Write-Host ""
}

uv run uvicorn pulse.main:app --host 0.0.0.0 --port 8001 --reload