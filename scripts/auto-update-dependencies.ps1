# Auto-update dependencies script (use with caution)
# This script will automatically update patch and minor versions
# Major versions require manual review

param(
    [switch]$DryRun = $false,
    [switch]$PatchOnly = $false,
    [switch]$AutoFix = $false
)

Write-Host "🔄 Auto-updating dependencies..." -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Backup package files
Write-Host "📦 Backing up package files..." -ForegroundColor Yellow
Copy-Item "package.json" "package.json.backup"
Copy-Item "package-lock.json" "package-lock.json.backup" -ErrorAction SilentlyContinue
Write-Host "✅ Backup created" -ForegroundColor Green
Write-Host ""

# Update patch versions only (safer)
if ($PatchOnly) {
    Write-Host "🔧 Updating patch versions only..." -ForegroundColor Yellow
    if (-not $DryRun) {
        npm update
    } else {
        Write-Host "  [DRY RUN] Would run: npm update" -ForegroundColor Gray
    }
} else {
    # Check for updates using npm-check-updates
    Write-Host "🔍 Checking for available updates..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        # Install npm-check-updates if not available
        $ncuInstalled = npm list -g npm-check-updates 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "📥 Installing npm-check-updates..." -ForegroundColor Yellow
            npm install -g npm-check-updates
        }
        
        # Update package.json (minor and patch versions)
        Write-Host "🔄 Updating package.json..." -ForegroundColor Yellow
        ncu -u --target minor
        
        # Install updated packages
        Write-Host "📥 Installing updated packages..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "  [DRY RUN] Would run: ncu -u --target minor && npm install" -ForegroundColor Gray
    }
}

Write-Host ""

# Auto-fix vulnerabilities if requested
if ($AutoFix) {
    Write-Host "🔒 Auto-fixing security vulnerabilities..." -ForegroundColor Yellow
    if (-not $DryRun) {
        npm audit fix
    } else {
        Write-Host "  [DRY RUN] Would run: npm audit fix" -ForegroundColor Gray
    }
    Write-Host ""
}

# Run tests to verify everything still works
Write-Host "🧪 Running tests to verify updates..." -ForegroundColor Yellow
if (-not $DryRun) {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed! Restoring backup..." -ForegroundColor Red
        Copy-Item "package.json.backup" "package.json" -Force
        Copy-Item "package-lock.json.backup" "package-lock.json" -Force -ErrorAction SilentlyContinue
        npm install
        Write-Host "✅ Backup restored" -ForegroundColor Green
    }
} else {
    Write-Host "  [DRY RUN] Would run: npm run build" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Auto-update complete!" -ForegroundColor Green

if ($DryRun) {
    Write-Host ""
    Write-Host "💡 Run without -DryRun to apply changes" -ForegroundColor Cyan
}




