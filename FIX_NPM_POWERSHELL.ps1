# Fix npm in PowerShell - Run this script

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Finding Node.js and npm" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Common Node.js installation paths
$searchPaths = @(
    "$env:ProgramFiles\nodejs",
    "$env:ProgramFiles(x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm",
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs"
)

$foundNode = $null
$foundNpm = $null

# Search for node.exe
foreach ($path in $searchPaths) {
    if (Test-Path "$path\node.exe") {
        $foundNode = "$path\node.exe"
        Write-Host "[OK] Found Node.js at: $path" -ForegroundColor Green
        break
    }
}

# Search for npm.cmd
foreach ($path in $searchPaths) {
    if (Test-Path "$path\npm.cmd") {
        $foundNpm = "$path\npm.cmd"
        Write-Host "[OK] Found npm at: $path" -ForegroundColor Green
        break
    }
}

if (-not $foundNode) {
    Write-Host "`n[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "`nOr try using the batch file: START_SERVER_EASY.bat`n" -ForegroundColor Yellow
    exit 1
}

if (-not $foundNpm) {
    Write-Host "`n[ERROR] npm not found!" -ForegroundColor Red
    Write-Host "npm should come with Node.js installation" -ForegroundColor Yellow
    exit 1
}

# Get directory paths
$nodeDir = Split-Path $foundNode -Parent
$npmDir = Split-Path $foundNpm -Parent

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Adding to PATH for this session" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Add to PATH for current session
$env:PATH = "$nodeDir;$npmDir;$env:PATH"

Write-Host "[OK] Added to PATH (this session only)" -ForegroundColor Green
Write-Host "`nTesting npm...`n" -ForegroundColor Cyan

# Test npm
try {
    $npmVersion = & npm --version
    Write-Host "[SUCCESS] npm version: $npmVersion" -ForegroundColor Green
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Starting Dev Server" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "Server will start at: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
    
    # Change to project directory
    Set-Location $PSScriptRoot
    
    # Start dev server
    & npm run dev
}
catch {
    Write-Host "`n[ERROR] npm not working: $_" -ForegroundColor Red
    Write-Host "`nTry using: START_SERVER_EASY.bat instead`n" -ForegroundColor Yellow
}

