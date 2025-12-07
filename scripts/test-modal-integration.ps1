# Modal Integration Test Script
# Tests Modal function deployment and integration

Write-Host "🧪 Testing Modal Integration" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if Modal CLI is installed
Write-Host "Checking Modal CLI installation..." -ForegroundColor Yellow
try {
    $modalVersion = modal --version 2>&1
    Write-Host "✅ Modal CLI installed: $modalVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Modal CLI not installed" -ForegroundColor Red
    Write-Host "   Install with: pip install modal" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check authentication
Write-Host "Checking Modal authentication..." -ForegroundColor Yellow
try {
    $tokenList = modal token list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Modal authenticated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not authenticated. Run: modal token new" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check authentication" -ForegroundColor Yellow
}

Write-Host ""

# Check secrets
Write-Host "Checking Modal secrets..." -ForegroundColor Yellow
try {
    $secrets = modal secret list 2>&1
    if ($secrets -match "openai-secret") {
        Write-Host "✅ Secrets configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Secrets not found. Run: bash modal_functions/setup_secrets.sh" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check secrets" -ForegroundColor Yellow
}

Write-Host ""

# Test function deployment (dry run)
Write-Host "Testing function syntax..." -ForegroundColor Yellow
try {
    Push-Location modal_functions
    $result = modal deploy analyze_call.py --dry-run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Function syntax valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Function syntax error" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
    Pop-Location
} catch {
    Write-Host "⚠️  Could not test function syntax" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Modal Integration Tests Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Deploy: modal deploy modal_functions/analyze_call.py" -ForegroundColor White
Write-Host "  2. Get function URL from Modal dashboard" -ForegroundColor White
Write-Host "  3. Add MODAL_FUNCTION_URL to Vercel environment variables" -ForegroundColor White

