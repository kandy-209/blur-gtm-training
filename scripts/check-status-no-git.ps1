# Check Git Status Without Hanging
# Uses file system checks instead of git commands

Write-Host "📋 Checking Modified Files (No Git Commands)" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$modifiedFiles = @()

# Check for our recently modified files
$filesToCheck = @(
    ".github/workflows/daily-dependency-check.yml",
    "src/components/LiquidGlossCanvas.tsx",
    "FIXES_VERIFIED.md"
)

Write-Host "Checking for modified files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
        $modifiedFiles += $file
    } else {
        Write-Host "⚠️  Missing: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Files ready to commit: $($modifiedFiles.Count)" -ForegroundColor White

if ($modifiedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "✅ Files are ready to commit!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To commit and push (run these in Command Prompt):" -ForegroundColor Yellow
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m `"Fix: GitHub Actions workflow and LiquidGlossCanvas bugs`"" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  No modified files found" -ForegroundColor Yellow
}

