# Comprehensive API Status Test Suite
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API Status Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://howtosellcursor.me"
$results = @{
    passed = 0
    failed = 0
    warnings = 0
}

function Test-Endpoint {
    param($name, $url, $expectedStatus = 200)
    Write-Host "Testing $name..." -ForegroundColor Yellow -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq $expectedStatus) {
            Write-Host " ✓ PASSED" -ForegroundColor Green
            $script:results.passed++
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Host " ✗ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:results.failed++
            return $null
        }
    } catch {
        Write-Host " ✗ FAILED ($($_.Exception.Message))" -ForegroundColor Red
        $script:results.failed++
        return $null
    }
}

# Test 1: API Keys Status
Write-Host ""
Write-Host "1. API Keys Status" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$apiKeysStatus = Test-Endpoint "API Keys Status" "$baseUrl/api/admin/api-keys/status"

if ($apiKeysStatus) {
    Write-Host "  Summary:" -ForegroundColor Yellow
    if ($apiKeysStatus.summary) {
        Write-Host "    Total Keys: $($apiKeysStatus.summary.total)" -ForegroundColor White
        Write-Host "    Valid: $($apiKeysStatus.summary.valid)" -ForegroundColor Green
        Write-Host "    Invalid: $($apiKeysStatus.summary.invalid)" -ForegroundColor $(if ($apiKeysStatus.summary.invalid -gt 0) { 'Red' } else { 'Green' })
        Write-Host "    Missing: $($apiKeysStatus.summary.missing)" -ForegroundColor $(if ($apiKeysStatus.summary.missing -gt 0) { 'Yellow' } else { 'Green' })
    }
    
    Write-Host ""
    Write-Host "  Key Details:" -ForegroundColor Yellow
    if ($apiKeysStatus.status) {
        $requiredKeys = @()
        $optionalKeys = @()
        
        foreach ($key in $apiKeysStatus.status.PSObject.Properties) {
            $keyInfo = $key.Value
            if ($keyInfo.required -and -not $keyInfo.set) {
                $requiredKeys += $keyInfo.name
                Write-Host "    ✗ $($keyInfo.name) - MISSING (Required)" -ForegroundColor Red
            } elseif ($keyInfo.set -and $keyInfo.valid) {
                Write-Host "    ✓ $($keyInfo.name) - Configured" -ForegroundColor Green
            } elseif ($keyInfo.set) {
                Write-Host "    ⚠ $($keyInfo.name) - Invalid Format" -ForegroundColor Yellow
                $script:results.warnings++
            } elseif (-not $keyInfo.required) {
                $optionalKeys += $keyInfo.name
            }
        }
        
        if ($requiredKeys.Count -gt 0) {
            Write-Host ""
            Write-Host "  ⚠ Missing Required Keys:" -ForegroundColor Red
            $requiredKeys | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        }
    }
}

# Test 2: Health Check
Write-Host ""
Write-Host "2. Health Check" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$healthStatus = Test-Endpoint "Health" "$baseUrl/api/health"

if ($healthStatus) {
    Write-Host "  Status: $($healthStatus.status)" -ForegroundColor $(if ($healthStatus.status -eq 'healthy') { 'Green' } else { 'Red' })
    if ($healthStatus.checks) {
        Write-Host "  Database: $($healthStatus.checks.database)" -ForegroundColor $(if ($healthStatus.checks.database -eq 'ok') { 'Green' } else { 'Yellow' })
        Write-Host "  Redis: $($healthStatus.checks.redis)" -ForegroundColor $(if ($healthStatus.checks.redis -eq 'ok') { 'Green' } else { 'Gray' })
        Write-Host "  External APIs: $($healthStatus.checks.external_apis)" -ForegroundColor $(if ($healthStatus.checks.external_apis -eq 'ok') { 'Green' } else { 'Yellow' })
    }
}

# Test 3: Supabase Connection
Write-Host ""
Write-Host "3. Supabase Connection" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$supabaseStatus = Test-Endpoint "Supabase" "$baseUrl/api/verify-supabase"

if ($supabaseStatus) {
    Write-Host "  Status: $($supabaseStatus.status)" -ForegroundColor $(if ($supabaseStatus.status -eq 'success') { 'Green' } else { 'Yellow' })
    if ($supabaseStatus.checks) {
        Write-Host "  URL: $($supabaseStatus.checks.url)" -ForegroundColor $(if ($supabaseStatus.checks.url) { 'Green' } else { 'Red' })
        Write-Host "  Anon Key: $($supabaseStatus.checks.anonKey)" -ForegroundColor $(if ($supabaseStatus.checks.anonKey) { 'Green' } else { 'Red' })
        Write-Host "  Service Role Key: $($supabaseStatus.checks.serviceRoleKey)" -ForegroundColor $(if ($supabaseStatus.checks.serviceRoleKey) { 'Green' } else { 'Red' })
        Write-Host "  Connection: $($supabaseStatus.checks.connection)" -ForegroundColor $(if ($supabaseStatus.checks.connection) { 'Green' } else { 'Red' })
        Write-Host "  Tables: $($supabaseStatus.checks.tables)" -ForegroundColor $(if ($supabaseStatus.checks.tables) { 'Green' } else { 'Yellow' })
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $($results.passed)" -ForegroundColor Green
Write-Host "  Failed: $($results.failed)" -ForegroundColor $(if ($results.failed -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Warnings: $($results.warnings)" -ForegroundColor $(if ($results.warnings -gt 0) { 'Yellow' } else { 'Green' })
Write-Host ""

if ($results.failed -eq 0 -and $results.warnings -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} elseif ($results.failed -eq 0) {
    Write-Host "⚠️  Tests passed with warnings" -ForegroundColor Yellow
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
}

Write-Host ""
