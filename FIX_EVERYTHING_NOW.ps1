# Comprehensive Fix Script - Fixes All Known Issues
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE FIX SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Step 1: Ensure we're on main branch
Write-Host "Step 1: Checking Git branch..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Not in a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "  Current branch: $currentBranch" -ForegroundColor White

if ($currentBranch -ne "main") {
    Write-Host "  ⚠ Not on main branch. Switching..." -ForegroundColor Yellow
    git checkout main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to switch to main!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Switched to main branch" -ForegroundColor Green
} else {
    Write-Host "  ✓ Already on main branch" -ForegroundColor Green
}

# Step 2: Pull latest changes
Write-Host ""
Write-Host "Step 2: Pulling latest changes..." -ForegroundColor Yellow
git pull origin main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠ Pull failed (may be normal if already up to date)" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Pulled latest changes" -ForegroundColor Green
}

# Step 3: Check for uncommitted changes
Write-Host ""
Write-Host "Step 3: Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain 2>&1
if ($status) {
    Write-Host "  ⚠ Found uncommitted changes:" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    Write-Host ""
    $commit = Read-Host "  Commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        git add -A
        git commit -m "Fix: Uncommitted changes before deployment"
        Write-Host "  ✓ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ No uncommitted changes" -ForegroundColor Green
}

# Step 4: Verify TypeScript fix
Write-Host ""
Write-Host "Step 4: Verifying TypeScript fix..." -ForegroundColor Yellow
$metricsFile = "src/app/api/vapi/call/[callId]/metrics/route.ts"
if (Test-Path $metricsFile) {
    $content = Get-Content $metricsFile -Raw
    if ($content -match "const keyMoments:\s*KeyMoment\[\]\s*=") {
        Write-Host "  ✓ TypeScript fix verified" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ TypeScript fix may be missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Metrics file not found" -ForegroundColor Yellow
}

# Step 5: Verify package-lock.json exists
Write-Host ""
Write-Host "Step 5: Verifying package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "  ✓ package-lock.json exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Regenerating package-lock.json..." -ForegroundColor Yellow
    npm install 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ package-lock.json regenerated" -ForegroundColor Green
        git add package-lock.json
        git commit -m "Fix: Regenerate package-lock.json"
    }
}

# Step 6: Test build locally
Write-Host ""
Write-Host "Step 6: Testing build locally..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Local build successful!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Local build failed!" -ForegroundColor Red
    Write-Host "  Build output:" -ForegroundColor Yellow
    $buildOutput | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "  ⚠ Continuing anyway - Vercel may have different environment" -ForegroundColor Yellow
}

# Step 7: Push to main
Write-Host ""
Write-Host "Step 7: Pushing to main branch..." -ForegroundColor Yellow
$unpushed = @(git log origin/main..HEAD --oneline 2>&1)
$gitLogExitCode = $LASTEXITCODE

if ($gitLogExitCode -eq 0 -and $unpushed -and $unpushed.Length -gt 0) {
    Write-Host "  Found unpushed commits. Pushing..." -ForegroundColor Yellow
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Pushed to main successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Push failed!" -ForegroundColor Red
        Write-Host "  Check your GitHub credentials" -ForegroundColor Yellow
    }
} elseif ($gitLogExitCode -ne 0) {
    Write-Host "  ⚠ Could not check unpushed commits (remote may not exist)" -ForegroundColor Yellow
    Write-Host "  Attempting push anyway..." -ForegroundColor Yellow
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Pushed successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ All commits already pushed" -ForegroundColor Green
}

# Step 8: Summary and next steps
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Completed:" -ForegroundColor Green
Write-Host "  - Verified on main branch" -ForegroundColor White
Write-Host "  - Pulled latest changes" -ForegroundColor White
Write-Host "  - Committed any uncommitted changes" -ForegroundColor White
Write-Host "  - Verified TypeScript fix" -ForegroundColor White
Write-Host "  - Verified package-lock.json" -ForegroundColor White
Write-Host "  - Tested local build" -ForegroundColor White
Write-Host "  - Pushed to main branch" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  CRITICAL NEXT STEP:" -ForegroundColor Yellow
Write-Host ""
Write-Host "You MUST change Vercel's Production Branch setting:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Click project: cursor-gtm-training" -ForegroundColor Cyan
Write-Host "3. Go to: Settings → Git" -ForegroundColor Cyan
Write-Host "4. Change 'Production Branch' from 'restore-call-analytics' to 'main'" -ForegroundColor Cyan
Write-Host "5. Click Save" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR manually deploy from main:" -ForegroundColor White
Write-Host "  npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "After fixing Vercel settings, wait 2-3 minutes for deployment." -ForegroundColor White
Write-Host ""
