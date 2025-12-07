# Force Deploy Everything to Production
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING ALL CHANGES TO PRODUCTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current branch
Write-Host "Step 1: Checking current branch..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
Write-Host "  Current branch: $currentBranch" -ForegroundColor White

if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "  ⚠ Not on main branch! Switching to main..." -ForegroundColor Yellow
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to switch to main branch!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Switched to main branch" -ForegroundColor Green
}

Write-Host ""

# Step 2: Add all changes
Write-Host "Step 2: Staging all changes..." -ForegroundColor Yellow
git add -A 2>&1 | Out-Null
$status = git status --short 2>&1
if ($status) {
    Write-Host "  Found changes to commit:" -ForegroundColor White
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  ✓ No changes to commit" -ForegroundColor Green
}

Write-Host ""

# Step 3: Commit changes
if ($status) {
    Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
    $commitMsg = "Deploy all latest changes: phone training, bug fixes, and improvements"
    git commit -m $commitMsg 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Commit failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host "Step 3: Skipping commit (no changes)" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Push to GitHub
Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Push failed!" -ForegroundColor Red
    Write-Host "  Trying to set upstream..." -ForegroundColor Yellow
    git push -u origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Push failed completely!" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Manual steps:" -ForegroundColor Yellow
        Write-Host "    1. git push origin main" -ForegroundColor Cyan
        Write-Host "    2. Check Vercel dashboard for auto-deploy" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "  ✓ Changes pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 5: Wait and verify
Write-Host "Step 5: Deployment Status" -ForegroundColor Yellow
Write-Host "  ✓ Code pushed to GitHub" -ForegroundColor Green
Write-Host "  ⏳ Vercel will auto-deploy in 2-3 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT INITIATED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Wait 2-3 minutes" -ForegroundColor White
Write-Host "  2. Check Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "  3. Visit: https://howtosellcursor.me/" -ForegroundColor Cyan
Write-Host "  4. Hard refresh: Ctrl + F5" -ForegroundColor White
Write-Host ""
Write-Host "What to check:" -ForegroundColor Yellow
Write-Host "  ✓ Phone Training link in navigation" -ForegroundColor White
Write-Host "  ✓ Sales training page at /sales-training" -ForegroundColor White
Write-Host "  ✓ All bug fixes applied" -ForegroundColor White
Write-Host ""
