# Git Sync Script for Windows
# Run this script to sync with remote repository

Write-Host "[SYNC] Syncing with remote repository..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check status
Write-Host "[STEP 1] Checking git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 2: Stage all changes
Write-Host "[STEP 2] Staging changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Changes staged" -ForegroundColor Green
} else {
    Write-Host "[INFO] No changes to stage" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "[STEP 3] Committing changes..." -ForegroundColor Yellow
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "chore: Update from Windows"
    }
    git commit -m $commitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Changes committed" -ForegroundColor Green
    }
    Write-Host ""
}

# Step 4: Pull latest changes
Write-Host "[STEP 4] Pulling latest changes..." -ForegroundColor Yellow
git pull origin main --rebase
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pulled latest changes" -ForegroundColor Green
} else {
    Write-Host "[WARN] Pull had issues - may need manual resolution" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Push changes
Write-Host "[STEP 5] Pushing changes..." -ForegroundColor Yellow
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

Write-Host "[COMPLETE] Sync complete!" -ForegroundColor Green


