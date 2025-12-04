# Quick Supabase Setup Helper
# Opens Supabase dashboard and guides you through getting keys

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Supabase Setup" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This will help you get your Supabase keys quickly.`n" -ForegroundColor White

# Check if Supabase keys are already set
$envLocalPath = ".env.local"
$hasSupabaseUrl = $false
$hasAnonKey = $false
$hasServiceKey = $false

if (Test-Path $envLocalPath) {
    $content = Get-Content $envLocalPath -Raw
    if ($content -match 'NEXT_PUBLIC_SUPABASE_URL=https://.*\.supabase\.co') {
        $hasSupabaseUrl = $true
    }
    if ($content -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ') {
        $hasAnonKey = $true
    }
    if ($content -match 'SUPABASE_SERVICE_ROLE_KEY=eyJ') {
        $hasServiceKey = $true
    }
}

if ($hasSupabaseUrl -and $hasAnonKey -and $hasServiceKey) {
    Write-Host "[OK] Supabase keys appear to be configured!" -ForegroundColor Green
    Write-Host ""
    $continue = Read-Host "Do you want to update them? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Step 1: Open Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  I'll open your browser to the API settings page..." -ForegroundColor Gray
Write-Host ""
$open = Read-Host "Open browser now? (Y/n)"
if ($open -eq "" -or $open -eq "Y" -or $open -eq "y") {
    Start-Process "https://supabase.com/dashboard/project/_/settings/api"
    Write-Host "[OK] Browser opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Get Your Keys" -ForegroundColor Yellow
Write-Host ""
Write-Host "On the Supabase page, you'll see:" -ForegroundColor White
Write-Host "  1. Project URL (under 'Project URL')" -ForegroundColor Gray
Write-Host "     Format: https://xxxxx.supabase.co" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  2. anon/public key (under 'Project API keys')" -ForegroundColor Gray
Write-Host "     This is the 'anon' or 'public' key" -ForegroundColor DarkGray
Write-Host "     Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  3. service_role key (same section, click 'Reveal')" -ForegroundColor Gray
Write-Host "     WARNING: Keep this secret! Never commit to Git." -ForegroundColor Red
Write-Host "     Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -ForegroundColor DarkGray
Write-Host ""

Write-Host "Step 3: Enter Your Keys" -ForegroundColor Yellow
Write-Host ""

# Get Supabase URL
$supabaseUrl = Read-Host "Enter Supabase URL (https://xxxxx.supabase.co)"
if ($supabaseUrl -and $supabaseUrl -match 'https://.*\.supabase\.co') {
    Write-Host "[OK] URL looks valid" -ForegroundColor Green
} elseif ($supabaseUrl) {
    Write-Host "[WARNING] URL format might be incorrect" -ForegroundColor Yellow
}

Write-Host ""
$anonKey = Read-Host "Enter anon/public key (starts with eyJ...)"
if ($anonKey -and $anonKey.StartsWith('eyJ')) {
    Write-Host "[OK] Key format looks valid" -ForegroundColor Green
} elseif ($anonKey) {
    Write-Host "[WARNING] Key should start with 'eyJ'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "WARNING: service_role key is SECRET - never share it!" -ForegroundColor Red
$serviceKey = Read-Host "Enter service_role key (starts with eyJ...)"
if ($serviceKey -and $serviceKey.StartsWith('eyJ')) {
    Write-Host "[OK] Key format looks valid" -ForegroundColor Green
} elseif ($serviceKey) {
    Write-Host "[WARNING] Key should start with 'eyJ'" -ForegroundColor Yellow
}

# Update .env.local
if ($supabaseUrl -and $anonKey -and $serviceKey) {
    Write-Host ""
    Write-Host "Creating/updating .env.local..." -ForegroundColor Yellow
    
    # If .env.local doesn't exist, copy from template
    if (-not (Test-Path $envLocalPath)) {
        if (Test-Path ".env.local.template") {
            Copy-Item ".env.local.template" $envLocalPath
            Write-Host "[OK] Created .env.local from template" -ForegroundColor Green
        } else {
            # Create basic file
            @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=D05K80BVIL89XP20

# S3 Storage
S3_ENDPOINT=https://files.massive.com
S3_ACCESS_KEY_ID=9608b1ba-919e-43df-aaa5-31c69921572c
S3_SECRET_ACCESS_KEY=axEzCy2XHAk2UKVRtPdMS1EQyapWjI0b
S3_BUCKET=flatfiles
S3_REGION=us-east-1

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File -FilePath $envLocalPath -Encoding UTF8
            Write-Host "[OK] Created .env.local" -ForegroundColor Green
        }
    }
    
    if (Test-Path $envLocalPath) {
        $content = Get-Content $envLocalPath -Raw
        
        # Replace or add each key
        if ($content -match 'NEXT_PUBLIC_SUPABASE_URL=') {
            $content = $content -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
        } else {
            $content = "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl`n" + $content
        }
        
        if ($content -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=') {
            $content = $content -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
        } else {
            $content = $content -replace '(NEXT_PUBLIC_SUPABASE_URL=.*)', "`$1`nNEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
        }
        
        if ($content -match 'SUPABASE_SERVICE_ROLE_KEY=') {
            $content = $content -replace 'SUPABASE_SERVICE_ROLE_KEY=.*', "SUPABASE_SERVICE_ROLE_KEY=$serviceKey"
        } else {
            $content = $content -replace '(NEXT_PUBLIC_SUPABASE_ANON_KEY=.*)', "`$1`nSUPABASE_SERVICE_ROLE_KEY=$serviceKey"
        }
        
        $content | Out-File -FilePath $envLocalPath -Encoding UTF8 -NoNewline
    } else {
        # Create new file
        $content = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
"@
        $content | Out-File -FilePath $envLocalPath -Encoding UTF8
    }
    
    Write-Host "[OK] .env.local updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart your dev server: npm run dev" -ForegroundColor White
    Write-Host "  2. Check status: npm run api-keys:check" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] All three keys are required!" -ForegroundColor Red
    Write-Host "Please run this script again and enter all keys." -ForegroundColor Yellow
    exit 1
}

