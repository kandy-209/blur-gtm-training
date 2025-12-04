# Voice Coaching Test Runner
# Runs all voice coaching tests

Write-Host "🧪 Running Voice Coaching Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$testFiles = @(
    "src/__tests__/voice-coaching/audio-analyzer.test.ts",
    "src/__tests__/voice-coaching/coaching-engine.test.ts",
    "src/__tests__/voice-coaching/api.test.ts"
)

$allPassed = $true

foreach ($testFile in $testFiles) {
    if (Test-Path $testFile) {
        Write-Host "Running: $testFile" -ForegroundColor Yellow
        npm test -- $testFile --passWithNoTests
        if ($LASTEXITCODE -ne 0) {
            $allPassed = $false
        }
        Write-Host ""
    } else {
        Write-Host "⚠️  Test file not found: $testFile" -ForegroundColor Yellow
    }
}

if ($allPassed) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "To run all tests:" -ForegroundColor Cyan
Write-Host "  npm test" -ForegroundColor White
Write-Host ""
Write-Host "To run with coverage:" -ForegroundColor Cyan
Write-Host "  npm test -- --coverage" -ForegroundColor White

