# Safe Git Push Script
# Handles git operations without getting stuck

param(
    [string]$Message = "Update: Cache system improvements and bug fixes"
)

Write-Host "🔄 Safe Git Push Process" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check git status (non-blocking)
Write-Host "1️⃣ Checking git status..." -ForegroundColor Yellow
try {
    $status = git status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Git not initialized or error checking status" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Gray
    } else {
        if ($status) {
            Write-Host "   ✅ Changes detected" -ForegroundColor Green
            Write-Host "   Files to commit:" -ForegroundColor Gray
            $status | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        } else {
            Write-Host "   ℹ️  No changes to commit" -ForegroundColor Cyan
            exit 0
        }
    }
} catch {
    Write-Host "   ⚠️  Error checking status: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Stage files (simple, direct method)
Write-Host "2️⃣ Staging files..." -ForegroundColor Yellow
try {
    # Direct git add - no jobs, no timeouts, just simple execution
    $output = & git add . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Files staged successfully" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Warning: $output" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error staging files: $_" -ForegroundColor Yellow
    Write-Host "   Try running manually: git add ." -ForegroundColor Gray
}

Write-Host ""

# Step 3: Commit (with message)
Write-Host "3️⃣ Committing changes..." -ForegroundColor Yellow
try {
    $commitMessage = $Message
    git commit -m $commitMessage 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Committed successfully" -ForegroundColor Green
        Write-Host "   Message: $commitMessage" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Nothing to commit or commit failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error committing: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Push to main
Write-Host "4️⃣ Pushing to main branch..." -ForegroundColor Yellow
try {
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Pushed successfully to main" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Push failed or already up to date" -ForegroundColor Yellow
        Write-Host "   Check: git status" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Error pushing: $_" -ForegroundColor Yellow
    Write-Host "   You may need to push manually: git push origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Git operations complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If there were any issues, you can run manually:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor Gray
Write-Host "  git commit -m 'Your message'" -ForegroundColor Gray
Write-Host "  git push origin main" -ForegroundColor Gray

