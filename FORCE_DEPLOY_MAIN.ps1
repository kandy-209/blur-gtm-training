# Force Deploy from Main Branch
# This script ensures we're on main and forces a Vercel deployment

Write-Host "🚀 Force Deploying from Main Branch" -ForegroundColor Cyan
Write-Host ""

# Check current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main") {
    Write-Host "⚠️  Not on main branch. Switching to main..." -ForegroundColor Yellow
    git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to checkout main branch" -ForegroundColor Red
        exit 1
    }
}

# Pull latest
Write-Host "📥 Pulling latest from origin/main..." -ForegroundColor Cyan
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: git pull failed" -ForegroundColor Yellow
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Uncommitted changes detected. Staging all..." -ForegroundColor Yellow
    git add -A
    git commit -m "Force deploy: ensure Phone Training and Analytics are live"
    git push origin main
}

# Verify NavUser has Phone Training
$navUserContent = Get-Content "src/components/NavUser.tsx" -Raw
if ($navUserContent -match "Phone Training") {
    Write-Host "✅ Phone Training link found in NavUser.tsx" -ForegroundColor Green
} else {
    Write-Host "❌ Phone Training link NOT found in NavUser.tsx" -ForegroundColor Red
    exit 1
}

# Verify sales-training page exists
if (Test-Path "src/app/sales-training/page.tsx") {
    Write-Host "✅ sales-training page exists" -ForegroundColor Green
} else {
    Write-Host "❌ sales-training page missing" -ForegroundColor Red
    exit 1
}

# Force deploy via Vercel CLI
Write-Host ""
Write-Host "🚀 Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host "This will force deploy from main branch" -ForegroundColor Yellow
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to production
Write-Host "Running: npx vercel --prod --yes" -ForegroundColor Cyan
npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
    Write-Host "Check Vercel dashboard for deployment status" -ForegroundColor Cyan
    Write-Host "URL: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check Vercel CLI output above for errors" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for deployment to complete" -ForegroundColor White
Write-Host "2. Check https://howtosellcursor.me/" -ForegroundColor White
Write-Host "3. Verify 'Phone Training' appears in navigation" -ForegroundColor White
Write-Host "4. Verify /sales-training page loads" -ForegroundColor White
Write-Host "5. Verify /analytics page loads" -ForegroundColor White

