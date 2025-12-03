# Test Summary Script
Write-Host "`n📊 TEST SUMMARY`n" -ForegroundColor Cyan
Write-Host "=" * 50

# Run tests with coverage
Write-Host "`nRunning tests with coverage..." -ForegroundColor Yellow
npm run test:coverage

Write-Host "`n" + ("=" * 50)
Write-Host "`n✅ Test summary complete!" -ForegroundColor Green


