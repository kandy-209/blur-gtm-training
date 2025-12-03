# PowerShell test runner script
Write-Host "🧪 Starting Test Suite..." -ForegroundColor Cyan

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please ensure Node.js is installed and in PATH." -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host "`n📋 Running unit tests..." -ForegroundColor Yellow
npm test

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some tests failed. Check output above." -ForegroundColor Red
    exit $LASTEXITCODE
}


