# Quick Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying to howtosellcursor.me" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "Checking Git status..." -ForegroundColor Yellow
$status = git status --porcelain 2>&1

if ($status) {
    Write-Host "Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Deploy latest changes to production"
    }
    git commit -m $commitMsg
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Commit failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
}

# Check if we need to push
Write-Host ""
Write-Host "Checking if push is needed..." -ForegroundColor Yellow

# Get current branch and validate git repository
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($LASTEXITCODE -ne 0 -or $branch -match "(?i)(error|fatal)") {
    Write-Host "⚠ Not in a git repository or git command failed" -ForegroundColor Yellow
    Write-Host "  Branch detection failed: $branch" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Deploying via Vercel CLI..." -ForegroundColor Yellow
    
    # Check if vercel is installed
    $vercel = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercel) {
        Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    Write-Host "Running: vercel --prod" -ForegroundColor Cyan
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Deployment complete!" -ForegroundColor Green
        Write-Host "Visit: https://howtosellcursor.me/" -ForegroundColor Cyan
    } else {
        Write-Host "Deployment failed. Check the error above." -ForegroundColor Red
    }
    exit $LASTEXITCODE
}

# Check for unpushed commits
$unpushed = @(git log origin/$branch..HEAD --oneline 2>&1)
$gitLogExitCode = $LASTEXITCODE

if ($gitLogExitCode -eq 0 -and $unpushed -and $unpushed.Length -gt 0) {
    Write-Host "Found unpushed commits. Pushing to GitHub..." -ForegroundColor Yellow
    git push origin $branch
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Push failed! Check your GitHub credentials." -ForegroundColor Red
        Write-Host ""
        Write-Host "You can also deploy manually via Vercel CLI:" -ForegroundColor Yellow
        Write-Host "  npx vercel --prod" -ForegroundColor Cyan
        exit 1
    }
    Write-Host "✓ Changes pushed to GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "If Vercel is connected to GitHub, deployment will start automatically!" -ForegroundColor Green
    Write-Host "Check: https://vercel.com/dashboard" -ForegroundColor Cyan
} elseif ($gitLogExitCode -ne 0 -or $unpushed -match "(?i)(error|fatal)") {
    Write-Host "⚠ Could not check for unpushed commits (remote branch may not exist)" -ForegroundColor Yellow
    Write-Host "  Error: $unpushed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Deploying via Vercel CLI..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if vercel is installed
    $vercel = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercel) {
        Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    Write-Host "Running: vercel --prod" -ForegroundColor Cyan
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Deployment complete!" -ForegroundColor Green
        Write-Host "Visit: https://howtosellcursor.me/" -ForegroundColor Cyan
    } else {
        Write-Host "Deployment failed. Check the error above." -ForegroundColor Red
    }
} else {
    Write-Host "✓ All commits are already pushed" -ForegroundColor Green
    Write-Host ""
    Write-Host "If Vercel is connected to GitHub, check for automatic deployment:" -ForegroundColor White
    Write-Host "Check: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To manually trigger deployment:" -ForegroundColor White
    Write-Host "  npx vercel --prod" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check Vercel Dashboard for deployment status" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. If deployment is in progress, wait 2-3 minutes" -ForegroundColor White
Write-Host ""
Write-Host "3. Visit: https://howtosellcursor.me/" -ForegroundColor White
Write-Host ""
Write-Host "4. Hard refresh: Ctrl+F5 (to clear cache)" -ForegroundColor White
Write-Host ""
