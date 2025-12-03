# PowerShell script to add domain to Vercel via CLI
# Requires: Vercel CLI installed and authenticated

Write-Host "🌐 Adding cursor-gtm-enablement.com to Vercel..." -ForegroundColor Cyan

# Check if vercel CLI is available
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    
    # Try to find npm/node
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        Write-Host "📦 Installing Vercel CLI via npm..." -ForegroundColor Yellow
        npm install -g vercel
    } else {
        Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
        Write-Host "   Then run: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Vercel CLI found" -ForegroundColor Green

# Check if authenticated
Write-Host "🔐 Checking authentication..." -ForegroundColor Cyan
$authCheck = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not authenticated. Please login first:" -ForegroundColor Yellow
    Write-Host "   Run: vercel login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or add domain manually:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   2. Click: cursor-gtm-training project" -ForegroundColor White
    Write-Host "   3. Settings → Domains" -ForegroundColor White
    Write-Host "   4. Add Domain: cursor-gtm-enablement.com" -ForegroundColor White
    exit 1
}

Write-Host "✅ Authenticated as: $authCheck" -ForegroundColor Green

# Add domain
Write-Host ""
Write-Host "➕ Adding domain: cursor-gtm-enablement.com" -ForegroundColor Cyan
Write-Host "   Project: cursor-gtm-training" -ForegroundColor Gray

# Try to add domain via CLI
# Note: This may require project to be linked first
$domainResult = vercel domains add cursor-gtm-enablement.com --scope cursor-gtm-training 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Domain added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Configure DNS at your domain registrar" -ForegroundColor White
    Write-Host "   2. Add CNAME: @ → cname.vercel-dns.com" -ForegroundColor White
    Write-Host "   3. Wait 1-2 hours for DNS propagation" -ForegroundColor White
} else {
    Write-Host "⚠️  CLI command failed. Adding domain manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Manual Steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   2. Click: cursor-gtm-training project" -ForegroundColor White
    Write-Host "   3. Settings → Domains" -ForegroundColor White
    Write-Host "   4. Click: Add Domain" -ForegroundColor White
    Write-Host "   5. Enter: cursor-gtm-enablement.com" -ForegroundColor White
    Write-Host "   6. Click: Add" -ForegroundColor White
    Write-Host ""
    Write-Host "Then configure DNS:" -ForegroundColor Cyan
    Write-Host "   Type: CNAME" -ForegroundColor White
    Write-Host "   Name: @ (root)" -ForegroundColor White
    Write-Host "   Value: cname.vercel-dns.com" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Script complete!" -ForegroundColor Green

