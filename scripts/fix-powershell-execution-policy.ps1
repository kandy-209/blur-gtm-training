# Fix PowerShell Execution Policy
# Run this script to enable PowerShell scripts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PowerShell Execution Policy Fix" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This will set PowerShell execution policy to allow scripts.`n" -ForegroundColor White

Write-Host "Current execution policy:" -ForegroundColor Yellow
Get-ExecutionPolicy -List

Write-Host "`nSetting execution policy for CurrentUser to RemoteSigned..." -ForegroundColor Yellow
Write-Host "(This allows local scripts but requires signed scripts from internet)`n" -ForegroundColor Gray

try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "[OK] Execution policy updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New execution policy:" -ForegroundColor Yellow
    Get-ExecutionPolicy -List
    Write-Host ""
    Write-Host "You can now run npm scripts and PowerShell scripts!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to set execution policy" -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use Command Prompt (cmd) instead:" -ForegroundColor Cyan
    Write-Host "  Press Windows Key + R" -ForegroundColor White
    Write-Host "  Type: cmd" -ForegroundColor White
    Write-Host "  Press Enter" -ForegroundColor White
    Write-Host "  Then run: npm run api-keys:supabase" -ForegroundColor White
}

