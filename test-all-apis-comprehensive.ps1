# Comprehensive API Testing Suite
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Comprehensive API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://howtosellcursor.me"
$results = @{
    passed = 0
    failed = 0
    warnings = 0
    missing = @()
    configured = @()
    needsKeys = @()
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
    Write-Host ""
    Write-Host "  Summary:" -ForegroundColor Yellow
    if ($apiKeysStatus.summary) {
        Write-Host "    Total Keys: $($apiKeysStatus.summary.total)" -ForegroundColor White
        Write-Host "    Valid: $($apiKeysStatus.summary.valid)" -ForegroundColor Green
        Write-Host "    Invalid: $($apiKeysStatus.summary.invalid)" -ForegroundColor $(if ($apiKeysStatus.summary.invalid -gt 0) { 'Red' } else { 'Green' })
        Write-Host "    Missing: $($apiKeysStatus.summary.missing)" -ForegroundColor $(if ($apiKeysStatus.summary.missing -gt 0) { 'Yellow' } else { 'Green' })
    }
    
    Write-Host ""
    Write-Host "  Detailed Status:" -ForegroundColor Yellow
    if ($apiKeysStatus.status) {
        foreach ($key in $apiKeysStatus.status.PSObject.Properties) {
            $keyInfo = $key.Value
            $keyName = $keyInfo.name
            
            if ($keyInfo.required -and -not $keyInfo.set) {
                Write-Host "    ✗ $keyName - MISSING (Required)" -ForegroundColor Red
                $script:results.missing += $keyName
                $script:results.needsKeys += @{
                    name = $keyName
                    envVar = $key.Name
                    required = $true
                    category = $keyInfo.category
                }
            } elseif ($keyInfo.set -and $keyInfo.valid) {
                Write-Host "    ✓ $keyName - Configured" -ForegroundColor Green
                $script:results.configured += $keyName
            } elseif ($keyInfo.set) {
                Write-Host "    ⚠ $keyName - Invalid Format" -ForegroundColor Yellow
                $script:results.warnings++
            } elseif (-not $keyInfo.required -and -not $keyInfo.set) {
                Write-Host "    ○ $keyName - Optional (Not Set)" -ForegroundColor Gray
            }
        }
    }
}

# Test 2: Health Check
Write-Host ""
Write-Host "2. Health Check" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$healthStatus = Test-Endpoint "Health" "$baseUrl/api/health"

if ($healthStatus) {
    Write-Host ""
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
    Write-Host ""
    Write-Host "  Status: $($supabaseStatus.status)" -ForegroundColor $(if ($supabaseStatus.status -eq 'success') { 'Green' } else { 'Yellow' })
    if ($supabaseStatus.checks) {
        Write-Host "  URL: $($supabaseStatus.checks.url)" -ForegroundColor $(if ($supabaseStatus.checks.url) { 'Green' } else { 'Red' })
        Write-Host "  Anon Key: $($supabaseStatus.checks.anonKey)" -ForegroundColor $(if ($supabaseStatus.checks.anonKey) { 'Green' } else { 'Red' })
        Write-Host "  Service Role Key: $($supabaseStatus.checks.serviceRoleKey)" -ForegroundColor $(if ($supabaseStatus.checks.serviceRoleKey) { 'Green' } else { 'Red' })
        Write-Host "  Connection: $($supabaseStatus.checks.connection)" -ForegroundColor $(if ($supabaseStatus.checks.connection) { 'Green' } else { 'Red' })
        Write-Host "  Tables: $($supabaseStatus.checks.tables)" -ForegroundColor $(if ($supabaseStatus.checks.tables) { 'Green' } else { 'Yellow' })
    }
}

# Test 4: Test Individual API Endpoints
Write-Host ""
Write-Host "4. Testing Individual API Endpoints" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray

# Test TTS endpoint (ElevenLabs)
Write-Host ""
Write-Host "  Testing TTS (ElevenLabs)..." -ForegroundColor Yellow -NoNewline
try {
    $ttsTest = Invoke-RestMethod -Uri "$baseUrl/api/tts" -Method Post -Body (@{ text = "test" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop -TimeoutSec 5
    Write-Host " ✓ Working" -ForegroundColor Green
} catch {
    if ($null -ne $_.Exception.Response -and $_.Exception.Response.StatusCode -eq 400) {
        Write-Host " ⚠ Endpoint exists but may need API key" -ForegroundColor Yellow
    } else {
        Write-Host " ✗ Failed" -ForegroundColor Red
    }
}

# Test Roleplay endpoint (Anthropic/OpenAI)
Write-Host "  Testing Roleplay (AI)..." -ForegroundColor Yellow -NoNewline
try {
    $roleplayTest = Invoke-RestMethod -Uri "$baseUrl/api/roleplay" -Method Post -Body (@{ message = "test"; scenarioId = "test" } | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop -TimeoutSec 5
    Write-Host " ✓ Working" -ForegroundColor Green
} catch {
    if ($null -ne $_.Exception.Response -and ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 500)) {
        Write-Host " ⚠ Endpoint exists but may need API key" -ForegroundColor Yellow
    } else {
        Write-Host " ✗ Failed" -ForegroundColor Red
    }
}

# Test Alpha Vantage endpoint
Write-Host "  Testing Alpha Vantage..." -ForegroundColor Yellow -NoNewline
try {
    $avTest = Invoke-RestMethod -Uri "$baseUrl/api/alphavantage/quote?symbol=AAPL" -Method Get -ErrorAction Stop -TimeoutSec 5
    Write-Host " ✓ Working" -ForegroundColor Green
} catch {
    Write-Host " ⚠ May need API key" -ForegroundColor Yellow
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

# Missing Keys Report
if ($results.missing.Count -gt 0) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Missing Required API Keys" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    foreach ($key in $results.needsKeys) {
        Write-Host "  ✗ $($key.name)" -ForegroundColor Red
        Write-Host "    Environment Variable: $($key.envVar)" -ForegroundColor White
        Write-Host "    Category: $($key.category)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Configured Keys Report
if ($results.configured.Count -gt 0) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Configured API Keys" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    foreach ($key in $results.configured) {
        Write-Host "  ✓ $key" -ForegroundColor Green
    }
    Write-Host ""
}

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add missing API keys to Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Go to: Settings → Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "3. Add each missing key listed above" -ForegroundColor White
Write-Host ""
Write-Host "4. Redeploy after adding keys" -ForegroundColor White
Write-Host ""
