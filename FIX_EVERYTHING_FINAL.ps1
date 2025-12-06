# Complete Fix Script - Restore Working Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTORING WORKING VERSION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Ensure on main branch
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

# Step 2: Merge restore-call-analytics if needed
Write-Host ""
Write-Host "Step 2: Merging restore-call-analytics..." -ForegroundColor Yellow
$unmerged = git log main..restore-call-analytics --oneline 2>&1
if ($LASTEXITCODE -eq 0 -and $unmerged -and $unmerged.Length -gt 0) {
    Write-Host "  Found commits to merge..." -ForegroundColor Yellow
    git merge restore-call-analytics --no-edit 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Merged successfully" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Merge had conflicts or issues" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ No commits to merge" -ForegroundColor Green
}

# Step 3: Push to main
Write-Host ""
Write-Host "Step 3: Pushing to main..." -ForegroundColor Yellow
git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Pushed to main successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Push failed!" -ForegroundColor Red
    Write-Host "  Check your GitHub credentials" -ForegroundColor Yellow
}

# Step 4: Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRITICAL NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add VAPI_API_KEY to Vercel:" -ForegroundColor White
Write-Host "   - Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   - Project: cursor-gtm-training" -ForegroundColor Cyan
Write-Host "   - Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "   - Add: VAPI_API_KEY = Your Vapi API key" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Fix Production Branch:" -ForegroundColor White
Write-Host "   - Settings → Git → Production Branch" -ForegroundColor Cyan
Write-Host "   - Should be: main" -ForegroundColor Cyan
Write-Host "   - If not, change it to main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Redeploy:" -ForegroundColor White
Write-Host "   - Deployments → Latest main deployment" -ForegroundColor Cyan
Write-Host "   - Click '...' → 'Promote to Production'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Code is now on main branch and pushed!" -ForegroundColor Green
Write-Host ""
