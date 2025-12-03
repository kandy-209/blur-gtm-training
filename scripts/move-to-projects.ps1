# PowerShell script to move cursor-gtm-training to Mac-like Projects folder
# This creates a structure similar to ~/Projects/ on Mac
# Run this script as Administrator for best results

Write-Host "🚀 Reorganizing to Mac-like structure..." -ForegroundColor Cyan
Write-Host ""

# Define paths (Mac-like structure)
$projectsPath = "C:\Users\Laxmo\Projects"
$sourcePath = "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
$destinationPath = "$projectsPath\cursor-gtm-training"

# Create Projects folder (Mac-like)
if (-not (Test-Path $projectsPath)) {
    Write-Host "📁 Creating Projects folder (Mac-like)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $projectsPath -Force | Out-Null
    Write-Host "✅ Created: $projectsPath" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Projects folder exists: $projectsPath" -ForegroundColor Green
    Write-Host ""
}

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Error: Source folder not found!" -ForegroundColor Red
    Write-Host "   Expected: $sourcePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please verify the current location of your project." -ForegroundColor Yellow
    exit 1
}

# Check if destination already exists
if (Test-Path $destinationPath) {
    Write-Host "⚠️  Warning: Destination folder already exists!" -ForegroundColor Yellow
    Write-Host "   Location: $destinationPath" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "❌ Move cancelled." -ForegroundColor Red
        exit 1
    }
    Remove-Item $destinationPath -Recurse -Force
}

# Stop any Node.js processes that might be using the folder
Write-Host "🛑 Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Move the folder
Write-Host "📦 Moving project to Mac-like structure..." -ForegroundColor Yellow
Write-Host "   From: $sourcePath" -ForegroundColor Gray
Write-Host "   To:   $destinationPath" -ForegroundColor Gray
Write-Host ""
Write-Host "   (Matches Mac: ~/Projects/cursor-gtm-training)" -ForegroundColor Cyan
Write-Host ""

try {
    Move-Item -Path $sourcePath -Destination $destinationPath -Force
    Write-Host "✅ Successfully moved project!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 New location: $destinationPath" -ForegroundColor Cyan
    Write-Host "   (Mac equivalent: ~/Projects/cursor-gtm-training)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Open Cursor IDE" -ForegroundColor White
    Write-Host "   2. File → Open Folder" -ForegroundColor White
    Write-Host "   3. Navigate to: $destinationPath" -ForegroundColor White
    Write-Host "   4. Run: npm install (if needed)" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Your project is now organized like Mac!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error moving folder: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try:" -ForegroundColor Yellow
    Write-Host "   1. Close Cursor IDE completely" -ForegroundColor White
    Write-Host "   2. Close all terminals" -ForegroundColor White
    Write-Host "   3. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✨ Done!" -ForegroundColor Green

