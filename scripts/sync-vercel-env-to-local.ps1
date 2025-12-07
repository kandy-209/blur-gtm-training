# Sync Vercel Environment Variables to Local .env.local
# Helps you copy Supabase keys from Vercel to local development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sync Vercel Env Vars to Local" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Since Supabase is connected to Vercel, you need to:" -ForegroundColor White
Write-Host "  1. Get your Supabase keys from Vercel Dashboard" -ForegroundColor Yellow
Write-Host "  2. Add them to .env.local for local development`n" -ForegroundColor Yellow

Write-Host "Step 1: Get Keys from Vercel" -ForegroundColor Cyan
Write-Host "  Go to: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  Select project: cursor-gtm-training" -ForegroundColor White
Write-Host "  Go to: Settings → Environment Variables" -ForegroundColor White
Write-Host "  Look for:" -ForegroundColor White
Write-Host "    - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "    - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "    - SUPABASE_SERVICE_ROLE_KEY`n" -ForegroundColor Gray

Write-Host "Step 2: Copy Keys to .env.local" -ForegroundColor Cyan
Write-Host "  I'll help you add them now...`n" -ForegroundColor White

# Check if .env.local exists
$envLocalPath = ".env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    & "$PSScriptRoot\create-env-local.ps1"
}

Write-Host "Enter your Supabase keys from Vercel:`n" -ForegroundColor Yellow

# Get Supabase URL
$supabaseUrl = Read-Host "NEXT_PUBLIC_SUPABASE_URL (from Vercel)"
if (-not $supabaseUrl -or $supabaseUrl -match 'your-project|placeholder') {
    Write-Host "[WARNING] Invalid URL. Please get it from Vercel Dashboard." -ForegroundColor Red
    exit 1
}

# Get Anon Key
$anonKey = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY (from Vercel)"
if (-not $anonKey -or $anonKey -match 'your-anon|placeholder') {
    Write-Host "[WARNING] Invalid anon key. Please get it from Vercel Dashboard." -ForegroundColor Red
    exit 1
}

# Get Service Role Key
Write-Host ""
Write-Host "⚠️  SUPABASE_SERVICE_ROLE_KEY is SECRET - keep it safe!" -ForegroundColor Red
$serviceKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY (from Vercel)"
if (-not $serviceKey -or $serviceKey -match 'your-service|placeholder') {
    Write-Host "[WARNING] Invalid service key. Please get it from Vercel Dashboard." -ForegroundColor Red
    exit 1
}

# Update .env.local
Write-Host ""
Write-Host "Updating .env.local..." -ForegroundColor Yellow

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

Write-Host "[OK] .env.local updated with Supabase keys from Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "  2. Check status: npm run api-keys:check" -ForegroundColor White
Write-Host ""

