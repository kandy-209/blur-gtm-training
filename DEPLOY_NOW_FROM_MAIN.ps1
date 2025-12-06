# Force Deploy from Main Branch to Vercel
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FORCING DEPLOYMENT FROM MAIN BRANCH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ensure on main branch
Write-Host "Step 1: Checking branch..." -ForegroundColor Yellow
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($branch -ne "main") {
    Write-Host "  Switching to main branch..." -ForegroundColor Yellow
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to switch to main!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Switched to main" -ForegroundColor Green
} else {
    Write-Host "  ✓ Already on main branch" -ForegroundColor Green
}

# Pull latest
Write-Host ""
Write-Host "Step 2: Pulling latest from main..." -ForegroundColor Yellow
git pull origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Pulled latest changes" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Pull had issues (may be up to date)" -ForegroundColor Yellow
}

# Push to trigger deployment
Write-Host ""
Write-Host "Step 3: Pushing to main to trigger Vercel..." -ForegroundColor Yellow
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Pushed to main successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Vercel should now deploy from main branch!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Push failed!" -ForegroundColor Red
    Write-Host "  Check your GitHub credentials" -ForegroundColor Yellow
}

# Deploy via Vercel CLI as backup
Write-Host ""
Write-Host "Step 4: Deploying via Vercel CLI (backup method)..." -ForegroundColor Yellow
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) {
    Write-Host "  Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel 2>&1 | Out-Null
}

Write-Host "  Running: vercel --prod" -ForegroundColor Cyan
Write-Host "  (This will deploy directly to production)" -ForegroundColor Gray
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Deployment complete!" -ForegroundColor Green
    Write-Host "Visit: https://howtosellcursor.me/" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠ Vercel CLI deployment had issues" -ForegroundColor Yellow
    Write-Host "Check Vercel dashboard for status" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check Vercel Dashboard:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Verify Production Branch is 'main':" -ForegroundColor White
Write-Host "   Settings → Git → Production Branch" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Check latest deployment:" -ForegroundColor White
Write-Host "   Deployments tab → Should show 'main' branch" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. If still deploying from wrong branch:" -ForegroundColor White
Write-Host "   - Go to Deployments tab" -ForegroundColor Cyan
Write-Host "   - Find latest 'main' deployment" -ForegroundColor Cyan
Write-Host "   - Click '...' → 'Promote to Production'" -ForegroundColor Cyan
Write-Host ""

