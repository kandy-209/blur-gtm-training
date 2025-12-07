# Comprehensive API Status Checker
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API Status Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://howtosellcursor.me"

# Function to check endpoint
function Check-Endpoint {
    param($name, $url)
    Write-Host "Checking $name..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        Write-Host "  ✓ Success" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Check API Keys Status
Write-Host "1. API Keys Status" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$apiKeysStatus = Check-Endpoint "API Keys Status" "$baseUrl/api/admin/api-keys/status"
if ($apiKeysStatus) {
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Yellow
    if ($apiKeysStatus.summary) {
        Write-Host "  Total Keys: $($apiKeysStatus.summary.total)" -ForegroundColor White
        Write-Host "  Valid: $($apiKeysStatus.summary.valid)" -ForegroundColor Green
        Write-Host "  Invalid: $($apiKeysStatus.summary.invalid)" -ForegroundColor Red
        Write-Host "  Missing: $($apiKeysStatus.summary.missing)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Key Status:" -ForegroundColor Yellow
    if ($apiKeysStatus.status) {
        foreach ($key in $apiKeysStatus.status.PSObject.Properties) {
            $keyInfo = $key.Value
            if ($keyInfo.set -and $keyInfo.valid) {
                $status = "✓ Configured"
                $color = "Green"
            } elseif ($keyInfo.set) {
                $status = "⚠ Invalid"
                $color = "Yellow"
            } elseif ($keyInfo.required) {
                $status = "✗ Missing (Required)"
                $color = "Red"
            } else {
                $status = "○ Optional"
                $color = "Gray"
            }
            Write-Host "  $($keyInfo.name): " -NoNewline -ForegroundColor White
            Write-Host $status -ForegroundColor $color
        }
    }
}

Write-Host ""

# Check Health Status
Write-Host "2. Health Check" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$healthStatus = Check-Endpoint "Health" "$baseUrl/api/health"
if ($healthStatus) {
    Write-Host ""
    Write-Host "Health Status:" -ForegroundColor Yellow
    Write-Host "  Status: $($healthStatus.status)" -ForegroundColor $(if ($healthStatus.status -eq 'healthy') { 'Green' } else { 'Red' })
    if ($healthStatus.checks) {
        Write-Host "  Database: $($healthStatus.checks.database)" -ForegroundColor White
        Write-Host "  Redis: $($healthStatus.checks.redis)" -ForegroundColor White
        Write-Host "  External APIs: $($healthStatus.checks.external_apis)" -ForegroundColor White
    }
}

Write-Host ""

# Check Supabase Status
Write-Host "3. Supabase Connection" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Gray
$supabaseStatus = Check-Endpoint "Supabase" "$baseUrl/api/verify-supabase"
if ($supabaseStatus) {
    Write-Host ""
    Write-Host "Supabase Status: $($supabaseStatus.status)" -ForegroundColor $(if ($supabaseStatus.status -eq 'success') { 'Green' } else { 'Yellow' })
    if ($supabaseStatus.checks) {
        Write-Host "  URL: $($supabaseStatus.checks.url)" -ForegroundColor White
        Write-Host "  Anon Key: $($supabaseStatus.checks.anonKey)" -ForegroundColor White
        Write-Host "  Service Role Key: $($supabaseStatus.checks.serviceRoleKey)" -ForegroundColor White
        Write-Host "  Connection: $($supabaseStatus.checks.connection)" -ForegroundColor White
        Write-Host "  Tables: $($supabaseStatus.checks.tables)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Recommendations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check Vercel Dashboard for environment variables:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Required APIs:" -ForegroundColor Yellow
Write-Host "   - Supabase (all 3 keys)" -ForegroundColor White
Write-Host "   - Anthropic OR OpenAI (at least one)" -ForegroundColor White
Write-Host ""
Write-Host "3. Optional APIs:" -ForegroundColor Yellow
Write-Host "   - ElevenLabs (voice features)" -ForegroundColor White
Write-Host "   - Vapi (phone calls)" -ForegroundColor White
Write-Host "   - Alpha Vantage (financial data)" -ForegroundColor White
Write-Host ""
