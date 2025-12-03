# Quick Deploy Script for PowerShell
# Deploys premium design system to Vercel

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deploying Premium Design System" -ForegroundColor Cyan
Write-Host "  to Vercel Production" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if vercel CLI is available
$vercelAvailable = $false
try {
    $null = Get-Command vercel -ErrorAction Stop
    $vercelAvailable = $true
    Write-Host "[OK] Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Vercel CLI not found, will use npx" -ForegroundColor Yellow
}

Write-Host "`nDeploying to production...`n" -ForegroundColor Cyan

if ($vercelAvailable) {
    Write-Host "Using: vercel --prod`n" -ForegroundColor Yellow
    & vercel --prod
} else {
    Write-Host "Using: npx vercel --prod`n" -ForegroundColor Yellow
    & npx vercel --prod
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Your premium design system is now live!" -ForegroundColor Green
Write-Host "Visit your Vercel URL to see it.`n" -ForegroundColor Yellow

