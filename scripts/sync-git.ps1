# Git Sync Script for Windows
# Run this script to sync with remote repository
# Perfect for agent sessions!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Sync - Agent Workflow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Pull latest changes FIRST (important for agent sessions!)
Write-Host "[STEP 1] Pulling latest from main..." -ForegroundColor Yellow
git pull origin main --rebase
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pulled latest changes" -ForegroundColor Green
} else {
    Write-Host "[WARN] Pull had issues - may need manual resolution" -ForegroundColor Yellow
    Write-Host "Continue anyway? (Y/N)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Step 2: Check status
Write-Host "[STEP 2] Checking git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 3: Stage all changes
Write-Host "[STEP 3] Staging changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Changes staged" -ForegroundColor Green
} else {
    Write-Host "[INFO] No changes to stage" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "[STEP 4] Committing changes..." -ForegroundColor Yellow
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "chore: sync changes from agent session"
    }
    git commit -m $commitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Changes committed" -ForegroundColor Green
    }
    Write-Host ""
}

# Step 5: Push changes
Write-Host "[STEP 5] Pushing changes to main..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Successfully pushed to remote" -ForegroundColor Green
} else {
    Write-Host "[WARN] Push failed - may need manual intervention" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Final status
Write-Host "[FINAL] Final status:" -ForegroundColor Yellow
git status --short
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Sync complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


