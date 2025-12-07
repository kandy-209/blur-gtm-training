# Check Deployment Status and Fix Issues
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git repo exists
Write-Host "1. Checking Git Repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "   ✓ Git repository found" -ForegroundColor Green
    
    # Check current branch
    $branch = git rev-parse --abbrev-ref HEAD 2>&1
    if ($LASTEXITCODE -ne 0 -or $branch -match "(?i)(error|fatal)") {
        Write-Host "   ⚠ Could not determine current branch" -ForegroundColor Yellow
        Write-Host "      Error: $branch" -ForegroundColor Gray
    } else {
        Write-Host "   Current branch: $branch" -ForegroundColor White
    }
    
    # Check remote
    $remote = git remote get-url origin 2>&1
    if ($LASTEXITCODE -ne 0 -or $remote -match "(?i)(error|fatal)") {
        Write-Host "   ⚠ No remote configured!" -ForegroundColor Red
    } else {
        Write-Host "   Remote: $remote" -ForegroundColor White
    }
    
    # Check uncommitted changes
    $status = git status --porcelain 2>&1
    if ($status) {
        Write-Host "   ⚠ Uncommitted changes found:" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ✓ No uncommitted changes" -ForegroundColor Green
    }
    
    # Check unpushed commits
    $unpushed = @(git log origin/$branch..HEAD --oneline 2>&1)
    $gitLogExitCode = $LASTEXITCODE
    
    if ($gitLogExitCode -eq 0 -and $unpushed -and $unpushed.Length -gt 0) {
        Write-Host "   ⚠ Unpushed commits found:" -ForegroundColor Yellow
        $unpushed | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    } elseif ($gitLogExitCode -ne 0 -or $unpushed -match "(?i)(error|fatal)") {
        Write-Host "   ⚠ Could not check unpushed commits (remote branch may not exist)" -ForegroundColor Yellow
        Write-Host "      Error: $unpushed" -ForegroundColor Gray
    } else {
        Write-Host "   ✓ All commits pushed" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ No Git repository found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking Vercel CLI..." -ForegroundColor Yellow
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercel) {
    Write-Host "   ✓ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Vercel CLI not found (install with: npm install -g vercel)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Deployment Recommendations:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   If you have uncommitted changes:" -ForegroundColor White
Write-Host "   1. git add ." -ForegroundColor Cyan
Write-Host "   2. git commit -m 'Deploy latest changes'" -ForegroundColor Cyan
Write-Host "   3. git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "   If Vercel is connected to GitHub:" -ForegroundColor White
Write-Host "   - Pushing to main/master will auto-deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "   To manually deploy:" -ForegroundColor White
Write-Host "   npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Check Vercel Dashboard:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host ""
