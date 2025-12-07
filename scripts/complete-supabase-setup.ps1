# Complete Supabase Setup - Automated
# Gets the service_role key and completes the configuration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Complete Supabase Setup" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$envLocalPath = ".env.local"
$supabaseUrl = "https://dxgjaznmtsgvxnfnzhbn.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2phem5tdHNndnhuZm56aGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NjQyNDUsImV4cCI6MjA4MDA0MDI0NX0.DuRMueOJ-sVPNZIjTxaCnti1Qisp2F99NBSlf_m_jPk"

# Check current status
$hasServiceKey = $false
if (Test-Path $envLocalPath) {
    $content = Get-Content $envLocalPath -Raw
    if ($content -match 'SUPABASE_SERVICE_ROLE_KEY=eyJ[^`n]+') {
        $hasServiceKey = $true
        Write-Host "[OK] Service role key already configured!" -ForegroundColor Green
        Write-Host ""
        $continue = Read-Host "Do you want to update it? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
    }
}

if (-not $hasServiceKey) {
    Write-Host "[INFO] Service role key needed for server-side database operations`n" -ForegroundColor Yellow
}

Write-Host "Step 1: Opening Supabase Dashboard..." -ForegroundColor Cyan
Write-Host "  I'll open your browser to the API settings page where you can get the service_role key.`n" -ForegroundColor Gray

$apiUrl = "https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn/settings/api"
Start-Process $apiUrl
Write-Host "[OK] Browser opened to: $apiUrl" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Get Your Service Role Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "On the Supabase page:" -ForegroundColor White
Write-Host "  1. Scroll to 'Project API keys' section" -ForegroundColor Gray
Write-Host "  2. Find the 'service_role' key (NOT 'anon')" -ForegroundColor Gray
Write-Host "  3. Click 'Reveal' to show it" -ForegroundColor Gray
Write-Host "  4. Copy the entire key (starts with 'eyJ...')" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  WARNING: This key is SECRET and has full database access!" -ForegroundColor Red
Write-Host "   Never commit it to Git or share it publicly.`n" -ForegroundColor Red

Write-Host "Step 3: Enter Your Service Role Key" -ForegroundColor Yellow
Write-Host ""
$serviceKey = Read-Host "Paste the service_role key here (or press Enter to skip)"

if (-not $serviceKey -or $serviceKey.Trim() -eq "") {
    Write-Host ""
    Write-Host "[SKIP] No service role key provided." -ForegroundColor Yellow
    Write-Host "You can add it later by running this script again or manually editing .env.local`n" -ForegroundColor Gray
    exit 0
}

# Validate key format
if (-not $serviceKey.StartsWith('eyJ')) {
    Write-Host ""
    Write-Host "[WARNING] Key should start with 'eyJ' - are you sure this is correct?" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Step 4: Updating .env.local..." -ForegroundColor Cyan

# Read or create .env.local
if (Test-Path $envLocalPath) {
    $content = Get-Content $envLocalPath -Raw
} else {
    $content = ""
}

# Update or add Supabase URL
if ($content -match 'NEXT_PUBLIC_SUPABASE_URL=') {
    $content = $content -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
} else {
    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
        $content += "`n"
    }
    $content += "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl`n"
}

# Update or add Anon Key
if ($content -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=') {
    $content = $content -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
} else {
    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
        $content += "`n"
    }
    $content += "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey`n"
}

# Update or add Service Role Key
if ($content -match 'SUPABASE_SERVICE_ROLE_KEY=') {
    $content = $content -replace 'SUPABASE_SERVICE_ROLE_KEY=.*', "SUPABASE_SERVICE_ROLE_KEY=$serviceKey"
} else {
    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
        $content += "`n"
    }
    $content += "SUPABASE_SERVICE_ROLE_KEY=$serviceKey`n"
}

# Write to file
$content | Out-File -FilePath $envLocalPath -Encoding UTF8 -NoNewline

Write-Host "[OK] .env.local updated successfully!`n" -ForegroundColor Green

Write-Host "Step 5: Verification" -ForegroundColor Cyan
Write-Host ""

# Verify the keys are in the file
$verifyContent = Get-Content $envLocalPath -Raw
$allGood = $true

if ($verifyContent -match "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl") {
    Write-Host "[✓] Supabase URL configured" -ForegroundColor Green
} else {
    Write-Host "[✗] Supabase URL missing" -ForegroundColor Red
    $allGood = $false
}

if ($verifyContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey") {
    Write-Host "[✓] Anon key configured" -ForegroundColor Green
} else {
    Write-Host "[✗] Anon key missing" -ForegroundColor Red
    $allGood = $false
}

if ($verifyContent -match "SUPABASE_SERVICE_ROLE_KEY=$serviceKey") {
    Write-Host "[✓] Service role key configured" -ForegroundColor Green
} else {
    Write-Host "[✗] Service role key missing" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Setup Complete! ✓" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart your dev server: npm run dev" -ForegroundColor White
    Write-Host "  2. Check API keys status: npm run api-keys:check" -ForegroundColor White
    Write-Host "  3. Test Supabase connection: npm run test:supabase`n" -ForegroundColor White
} else {
    Write-Host "[WARNING] Some keys may not have been saved correctly." -ForegroundColor Yellow
    Write-Host "Please check .env.local manually.`n" -ForegroundColor Yellow
}

