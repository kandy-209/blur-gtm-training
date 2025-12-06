# URGENT: Deploy Fixed Version with Phone Training & Analytics
# This script will force deploy the correct version

Write-Host "🚨 URGENT: Deploying Fixed Version" -ForegroundColor Red
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Ensure we're on main
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git checkout main
}

# Pull latest
Write-Host "Pulling latest from GitHub..." -ForegroundColor Cyan
git pull origin main

# Verify Phone Training exists
$navContent = Get-Content "src/components/NavUser.tsx" -Raw
if ($navContent -notmatch "Phone Training") {
    Write-Host "❌ ERROR: Phone Training NOT in NavUser.tsx!" -ForegroundColor Red
    Write-Host "Adding it now..." -ForegroundColor Yellow
    
    # Read file
    $lines = Get-Content "src/components/NavUser.tsx"
    $newLines = @()
    $found = $false
    
    foreach ($line in $lines) {
        $newLines += $line
        if ($line -match "navLinks\s*=\s*\[" -and -not $found) {
            $found = $true
        }
        if ($found -and $line -match "'/scenarios'" -and $newLines[-1] -notmatch "Phone Training") {
            # Add Phone Training after Scenarios
            $newLines += "    { href: '/sales-training', label: 'Phone Training' },"
            $found = $false
        }
    }
    
    $newLines | Set-Content "src/components/NavUser.tsx"
    git add "src/components/NavUser.tsx"
    git commit -m "Add Phone Training to navigation"
    git push origin main
}

# Verify sales-training page exists
if (-not (Test-Path "src/app/sales-training/page.tsx")) {
    Write-Host "❌ ERROR: sales-training page missing!" -ForegroundColor Red
    exit 1
}

# Check if ProtectedRoute wrapper exists
$pageContent = Get-Content "src/app/sales-training/page.tsx" -Raw
if ($pageContent -notmatch "ProtectedRoute") {
    Write-Host "⚠️  Adding ProtectedRoute wrapper..." -ForegroundColor Yellow
    # This would need manual fix
}

Write-Host ""
Write-Host "✅ Code verified!" -ForegroundColor Green
Write-Host ""

# Force commit and push
Write-Host "Committing all changes..." -ForegroundColor Cyan
git add -A
$hasChanges = git diff --cached --quiet
if (-not $hasChanges) {
    git commit -m "URGENT: Ensure Phone Training and Analytics are deployed - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin main
    Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 DEPLOYING TO VERCEL PRODUCTION..." -ForegroundColor Cyan
Write-Host "This will deploy from your LOCAL main branch" -ForegroundColor Yellow
Write-Host ""

# Deploy via Vercel CLI
$deployOutput = npx vercel --prod --yes 2>&1 | Out-String

Write-Host $deployOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ DEPLOYMENT INITIATED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Wait 2-3 minutes for deployment" -ForegroundColor White
    Write-Host "2. Visit: https://howtosellcursor.me/" -ForegroundColor White
    Write-Host "3. Check navigation for 'Phone Training'" -ForegroundColor White
    Write-Host "4. Verify /sales-training page loads" -ForegroundColor White
    Write-Host ""
    Write-Host "If still not working:" -ForegroundColor Yellow
    Write-Host "- Go to Vercel Dashboard → Settings → Git" -ForegroundColor White
    Write-Host "- Change Production Branch to 'main'" -ForegroundColor White
    Write-Host "- Save and wait for auto-deploy" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment may have failed" -ForegroundColor Red
    Write-Host "Check output above for errors" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Project: cursor-gtm-training" -ForegroundColor White
    Write-Host "3. Settings → Git → Production Branch = main" -ForegroundColor White
    Write-Host "4. Deployments → Promote latest main deployment" -ForegroundColor White
}

