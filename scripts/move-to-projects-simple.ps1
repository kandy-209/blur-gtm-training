# Simple script to move project to Projects folder
$sourcePath = Join-Path $env:USERPROFILE "Modal Test\cursor-gtm-training"
$destPath = Join-Path $env:USERPROFILE "Projects\cursor-gtm-training"
$projectsDir = Join-Path $env:USERPROFILE "Projects"

Write-Host "Moving project to Projects folder..." -ForegroundColor Cyan

# Create Projects folder if needed
if (-not (Test-Path $projectsDir)) {
    New-Item -ItemType Directory -Path $projectsDir -Force | Out-Null
}

# Check if destination exists
if (Test-Path $destPath) {
    Write-Host "Warning: Destination exists. Removing..." -ForegroundColor Yellow
    Remove-Item $destPath -Recurse -Force
}

# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Move folder
try {
    Move-Item -Path $sourcePath -Destination $destPath -Force
    Write-Host "Success! Moved to: $destPath" -ForegroundColor Green
    Write-Host "Open this folder in Cursor IDE" -ForegroundColor Yellow
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Close Cursor IDE and try again" -ForegroundColor Yellow
}


