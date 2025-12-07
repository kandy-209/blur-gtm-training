# Deploy to Vercel Production
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING TO VERCEL PRODUCTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ensure on main branch
Write-Host "Step 1: Ensuring on main branch..." -ForegroundColor Yellow
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($branch -ne "main") {
    Write-Host "  Switching to main..." -ForegroundColor Yellow
    git checkout main 2>&1 | Out-Null
}
Write-Host "  ✓ On main branch" -ForegroundColor Green

# Pull latest
Write-Host ""
Write-Host "Step 2: Pulling latest changes..." -ForegroundColor Yellow
git pull origin main 2>&1 | Out-Null
Write-Host "  ✓ Up to date" -ForegroundColor Green

# Deploy
Write-Host ""
Write-Host "Step 3: Deploying to production..." -ForegroundColor Yellow
Write-Host "  Running: npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Note: If you're not logged in, you'll be prompted to authenticate." -ForegroundColor Gray
Write-Host "  Follow the prompts in your browser." -ForegroundColor Gray
Write-Host ""

# Run vercel deploy
npx vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check your site: https://howtosellcursor.me/" -ForegroundColor Green
Write-Host ""

