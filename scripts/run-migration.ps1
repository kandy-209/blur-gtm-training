# Voice Coaching Database Migration Helper
# This script helps you run the migration in Supabase

Write-Host "📋 Voice Coaching Database Migration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$migrationFile = "scripts/create-elevenlabs-advanced-features-tables.sql"

if (Test-Path $migrationFile) {
    Write-Host "✅ Migration file found: $migrationFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Open Supabase Dashboard:" -ForegroundColor White
    Write-Host "   https://app.supabase.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Navigate to:" -ForegroundColor White
    Write-Host "   SQL Editor → New Query" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Copy the migration script:" -ForegroundColor White
    Write-Host "   File: $migrationFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Paste into SQL Editor and click 'Run'" -ForegroundColor White
    Write-Host ""
    
    # Ask if user wants to open the file
    $openFile = Read-Host "Would you like to open the migration file? (Y/N)"
    if ($openFile -eq "Y" -or $openFile -eq "y") {
        Start-Process notepad.exe -ArgumentList $migrationFile
        Write-Host ""
        Write-Host "✅ File opened in Notepad. Copy the contents and paste into Supabase SQL Editor." -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📋 After running migration:" -ForegroundColor Yellow
    Write-Host "   → Open: http://localhost:3000/test/voice-coaching" -ForegroundColor Cyan
    Write-Host "   → Click 'Start Analysis' and test!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "ERROR: Migration file not found: $migrationFile" -ForegroundColor Red
}

