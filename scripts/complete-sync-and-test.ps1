# Complete Git Sync and Test Runner
# This script completes the rebase, pushes to git, and runs tests

Write-Host "🚀 Starting complete sync and test process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Complete Git Rebase
Write-Host "📦 Step 1: Completing git rebase..." -ForegroundColor Yellow
git add src/app/layout.tsx package.json
if ($LASTEXITCODE -eq 0) {
    git rebase --continue
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Rebase completed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Rebase may have issues, continuing..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Files already staged, continuing..." -ForegroundColor Yellow
    git rebase --continue
}

Write-Host ""

# Step 2: Push to Remote
Write-Host "📤 Step 2: Pushing to remote..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to remote" -ForegroundColor Green
} else {
    Write-Host "⚠️  Push failed - may need manual intervention" -ForegroundColor Yellow
    Write-Host "   Try: git push origin main --force (if safe)" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Check if npm is available
Write-Host "🔍 Step 3: Checking for npm..." -ForegroundColor Yellow
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    Write-Host "✅ npm found: $($npmCheck.Source)" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Run Tests
    Write-Host "🧪 Step 4: Running tests..." -ForegroundColor Yellow
    npm test
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ All tests passed!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Some tests failed. Review output above." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ npm not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 To run tests manually:" -ForegroundColor Yellow
    Write-Host "   1. Install Node.js from https://nodejs.org/" -ForegroundColor White
    Write-Host "   2. Or use Node.js Command Prompt" -ForegroundColor White
    Write-Host "   3. Then run: npm test" -ForegroundColor White
}

Write-Host ""
Write-Host "✨ Process complete!" -ForegroundColor Green


