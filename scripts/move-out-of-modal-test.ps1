# PowerShell script to move cursor-gtm-training out of "Modal Test" folder
# Moves to: C:\Users\Laxmo\cursor-gtm-training (or Projects folder)

Write-Host "Moving project out of 'Modal Test' folder..." -ForegroundColor Cyan
Write-Host ""

# Define paths
$sourcePath = Join-Path $env:USERPROFILE "Modal Test\cursor-gtm-training"
$destinationPath = Join-Path $env:USERPROFILE "cursor-gtm-training"
$projectsPath = Join-Path $env:USERPROFILE "Projects\cursor-gtm-training"

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "Error: Source folder not found!" -ForegroundColor Red
    Write-Host "Expected: $sourcePath" -ForegroundColor Yellow
    exit 1
}

# Ask user where to move it
Write-Host "Where would you like to move the project?" -ForegroundColor Yellow
Write-Host "1. $destinationPath (direct)" -ForegroundColor White
Write-Host "2. $projectsPath (organized)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2, default: 2)"

if ($choice -eq "1") {
    $finalDestination = $destinationPath
} else {
    $finalDestination = $projectsPath
    $projectsDir = Join-Path $env:USERPROFILE "Projects"
    if (-not (Test-Path $projectsDir)) {
        Write-Host "Creating Projects folder..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $projectsDir -Force | Out-Null
    }
}

# Check if destination already exists
if (Test-Path $finalDestination) {
    Write-Host "Warning: Destination folder already exists!" -ForegroundColor Yellow
    Write-Host "Location: $finalDestination" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "Move cancelled." -ForegroundColor Red
        exit 1
    }
    Remove-Item $finalDestination -Recurse -Force
}

# Check if Cursor is running
$cursorProcesses = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
if ($cursorProcesses) {
    Write-Host "Warning: Cursor IDE is running!" -ForegroundColor Yellow
    Write-Host "Found $($cursorProcesses.Count) Cursor process(es)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For best results:" -ForegroundColor Cyan
    Write-Host "1. Close Cursor IDE completely" -ForegroundColor White
    Write-Host "2. Close all terminals" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Move cancelled. Please close Cursor and try again." -ForegroundColor Red
        exit 1
    }
}

# Stop any Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Move the folder
Write-Host "Moving project..." -ForegroundColor Yellow
Write-Host "From: $sourcePath" -ForegroundColor Gray
Write-Host "To: $finalDestination" -ForegroundColor Gray
Write-Host ""

try {
    Move-Item -Path $sourcePath -Destination $finalDestination -Force
    Write-Host "Successfully moved project!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New location: $finalDestination" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open Cursor IDE" -ForegroundColor White
    Write-Host "2. File -> Open Folder" -ForegroundColor White
    Write-Host "3. Navigate to: $finalDestination" -ForegroundColor White
    Write-Host "4. Run: npm install (if needed)" -ForegroundColor White
    Write-Host ""
    Write-Host "Project moved successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error moving folder: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "The folder might be in use. Try:" -ForegroundColor Yellow
    Write-Host "1. Close Cursor IDE completely" -ForegroundColor White
    Write-Host "2. Close all terminals" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
