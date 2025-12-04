# Comprehensive Cache System Test Runner
# Tests all cache-related functionality

Write-Host "🚀 Starting Comprehensive Cache System Tests..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$testResults = @()

function Run-TestSuite {
    param(
        [string]$TestName,
        [string]$TestPath,
        [string]$Description
    )
    
    Write-Host "`n📋 $TestName" -ForegroundColor Yellow
    Write-Host "   $Description" -ForegroundColor Gray
    
    try {
        $output = npx jest $TestPath --no-coverage --silent --verbose 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ PASSED" -ForegroundColor Green
            $script:testResults += @{ Name = $TestName; Status = "PASSED"; Path = $TestPath }
            return $true
        } else {
            Write-Host "   ❌ FAILED" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            $script:testResults += @{ Name = $TestName; Status = "FAILED"; Path = $TestPath }
            return $false
        }
    } catch {
        Write-Host "   ⚠️  ERROR: $_" -ForegroundColor Red
        $script:testResults += @{ Name = $TestName; Status = "ERROR"; Path = $TestPath }
        return $false
    }
}

# Core Cache Tests
Write-Host "`n🔧 CORE CACHE TESTS" -ForegroundColor Magenta
Run-TestSuite "Cache Wrapper" "src/lib/__tests__/next-cache-wrapper.test.ts" "Basic cache operations"
Run-TestSuite "Cache Headers" "src/lib/__tests__/cache-headers.test.ts" "HTTP cache headers"
Run-TestSuite "Edge Cases" "src/lib/__tests__/next-cache-wrapper-edge-cases.test.ts" "Edge case handling"
Run-TestSuite "Integration Flow" "src/lib/__tests__/integration-cache-flow.test.ts" "Complete cache lifecycle"

# API Integration Tests
Write-Host "`n🌐 API INTEGRATION TESTS" -ForegroundColor Magenta
Run-TestSuite "Alpha Vantage Enhanced" "src/lib/__tests__/alphavantage-enhanced.test.ts" "Enhanced financial API"
Run-TestSuite "Company Enrichment" "src/lib/__tests__/company-enrichment-apis.test.ts" "Company data enrichment"
Run-TestSuite "News & Sentiment" "src/lib/__tests__/news-sentiment-api.test.ts" "News and sentiment analysis"

# API Route Tests
Write-Host "`n🛣️  API ROUTE TESTS" -ForegroundColor Magenta
Run-TestSuite "Quote API Enhanced" "src/app/api/__tests__/alphavantage-quote-enhanced.test.ts" "Enhanced quote endpoint"
Run-TestSuite "Company Enrich API" "src/app/api/__tests__/company-enrich.test.ts" "Company enrichment endpoint"
Run-TestSuite "Cache Metrics API" "src/app/api/__tests__/cache-metrics.test.ts" "Cache metrics endpoint"

# Performance & Optimization Tests
Write-Host "`n⚡ PERFORMANCE TESTS" -ForegroundColor Magenta
Run-TestSuite "Cache Optimizer" "src/lib/__tests__/cache-optimizer.test.ts" "Performance optimization"
Run-TestSuite "Cache Helpers" "src/lib/__tests__/cache-helpers.test.ts" "Cache utility functions"
Run-TestSuite "Cache Headers Comprehensive" "src/lib/__tests__/cache-headers-comprehensive.test.ts" "All header presets"

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$errors = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count
$total = $testResults.Count

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "⚠️  Errors: $errors" -ForegroundColor Yellow

if ($failed -eq 0 -and $errors -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some tests failed. Review output above." -ForegroundColor Yellow
    exit 1
}

