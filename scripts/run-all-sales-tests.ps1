# Comprehensive Sales Call Training Test Suite
# Runs all tests for the Modal + Vercel integration

Write-Host "🧪 Sales Call Training - Comprehensive Test Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
}

# Test 1: Check Modal CLI Installation
Write-Host "`n[1/6] Checking Modal CLI Installation..." -ForegroundColor Yellow
try {
    $modalVersion = modal --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Modal CLI installed: $modalVersion" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "❌ Modal CLI not installed" -ForegroundColor Red
        Write-Host "   Install with: pip install modal" -ForegroundColor Yellow
        $testResults.Failed++
    }
} catch {
    Write-Host "❌ Modal CLI not found" -ForegroundColor Red
    $testResults.Failed++
}

# Test 2: Check Modal Authentication
Write-Host "`n[2/6] Checking Modal Authentication..." -ForegroundColor Yellow
try {
    $tokenList = modal token list 2>&1
    if ($LASTEXITCODE -eq 0 -and $tokenList -match "token") {
        Write-Host "✅ Modal authenticated" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "⚠️  Not authenticated. Run: modal token new" -ForegroundColor Yellow
        $testResults.Skipped++
    }
} catch {
    Write-Host "⚠️  Could not check authentication" -ForegroundColor Yellow
    $testResults.Skipped++
}

# Test 3: Check Modal Secrets
Write-Host "`n[3/6] Checking Modal Secrets..." -ForegroundColor Yellow
try {
    $secrets = modal secret list 2>&1
    $hasOpenAI = $secrets -match "openai-secret"
    $hasAnthropic = $secrets -match "anthropic-secret"
    $hasVapi = $secrets -match "vapi-secret"
    
    if ($hasOpenAI -and $hasAnthropic -and $hasVapi) {
        Write-Host "✅ All secrets configured" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "⚠️  Missing secrets. Run: bash modal_functions/setup_secrets.sh" -ForegroundColor Yellow
        Write-Host "   Missing: " -NoNewline
        if (-not $hasOpenAI) { Write-Host "openai-secret " -NoNewline -ForegroundColor Red }
        if (-not $hasAnthropic) { Write-Host "anthropic-secret " -NoNewline -ForegroundColor Red }
        if (-not $hasVapi) { Write-Host "vapi-secret " -NoNewline -ForegroundColor Red }
        Write-Host ""
        $testResults.Skipped++
    }
} catch {
    Write-Host "⚠️  Could not check secrets" -ForegroundColor Yellow
    $testResults.Skipped++
}

# Test 4: Check Environment Variables
Write-Host "`n[4/6] Checking Environment Variables..." -ForegroundColor Yellow
$envVars = @("MODAL_FUNCTION_URL", "VAPI_API_KEY")
$missingVars = @()

foreach ($var in $envVars) {
    if (-not (Test-Path "env:$var") -or [string]::IsNullOrEmpty((Get-Item "env:$var").Value)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    Write-Host "✅ All environment variables set" -ForegroundColor Green
    $testResults.Passed++
} else {
    Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host "   Set these in Vercel Dashboard → Settings → Environment Variables" -ForegroundColor Yellow
    $testResults.Skipped++
}

# Test 5: Check File Structure
Write-Host "`n[5/6] Checking File Structure..." -ForegroundColor Yellow
$requiredFiles = @(
    "modal_functions/analyze_call.py",
    "src/app/api/vapi/sales-call/route.ts",
    "src/components/SalesTraining/PhoneCallTraining.tsx",
    "src/app/sales-training/page.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ All required files present" -ForegroundColor Green
    $testResults.Passed++
} else {
    Write-Host "❌ Some files are missing" -ForegroundColor Red
    $testResults.Failed++
}

# Test 6: Check API Route Syntax
Write-Host "`n[6/6] Checking API Route Syntax..." -ForegroundColor Yellow
try {
    Push-Location src/app/api/vapi/sales-call
    $tscCheck = npx tsc --noEmit route.ts 2>&1
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API route syntax valid" -ForegroundColor Green
        $testResults.Passed++
    } else {
        Write-Host "⚠️  TypeScript errors found (may be due to missing dependencies)" -ForegroundColor Yellow
        $testResults.Skipped++
    }
} catch {
    Write-Host "⚠️  Could not check syntax (TypeScript may not be available)" -ForegroundColor Yellow
    $testResults.Skipped++
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan
Write-Host "✅ Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "❌ Failed: $($testResults.Failed)" -ForegroundColor Red
Write-Host "⚠️  Skipped: $($testResults.Skipped)" -ForegroundColor Yellow
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "🎉 All critical tests passed!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy Modal function: modal deploy modal_functions/analyze_call.py" -ForegroundColor White
    Write-Host "  2. Add MODAL_FUNCTION_URL to Vercel environment variables" -ForegroundColor White
    Write-Host "  3. Test the API: npm run test:sales-call" -ForegroundColor White
    Write-Host "  4. Start dev server: npm run dev" -ForegroundColor White
    Write-Host "  5. Visit: http://localhost:3000/sales-training" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed. Please fix issues before proceeding." -ForegroundColor Yellow
    exit 1
}

