# Update Supabase keys in .env.local
# This script updates the Supabase credentials

$envLocalPath = ".env.local"

# Supabase credentials from user
$supabaseUrl = "https://dxgjaznmtsgvxnfnzhbn.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2phem5tdHNndnhuZm56aGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NjQyNDUsImV4cCI6MjA4MDA0MDI0NX0.DuRMueOJ-sVPNZIjTxaCnti1Qisp2F99NBSlf_m_jPk"

Write-Host "Updating Supabase keys in .env.local..." -ForegroundColor Cyan

if (-not (Test-Path $envLocalPath)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    & "$PSScriptRoot\create-env-local.ps1"
}

# Read current content
$content = Get-Content $envLocalPath -Raw

# Update Supabase URL
if ($content -match 'NEXT_PUBLIC_SUPABASE_URL=') {
    $content = $content -replace 'NEXT_PUBLIC_SUPABASE_URL=.*', "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl"
} else {
    $content = "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl`n" + $content
}

# Update Anon Key
if ($content -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=') {
    $content = $content -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=.*', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
} else {
    $content = $content -replace '(NEXT_PUBLIC_SUPABASE_URL=.*)', "`$1`nNEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey"
}

# Note: Service role key still needs to be added manually
Write-Host ""
Write-Host "[OK] Updated Supabase URL and Anon Key!" -ForegroundColor Green
Write-Host ""
Write-Host "Still need:" -ForegroundColor Yellow
Write-Host "  SUPABASE_SERVICE_ROLE_KEY - Get from Vercel Dashboard → Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "Or get it from Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn/settings/api" -ForegroundColor Cyan
Write-Host "  Look for 'service_role' key (click Reveal)`n" -ForegroundColor White

# Save updated content
$content | Out-File -FilePath $envLocalPath -Encoding UTF8 -NoNewline

Write-Host "File updated: $envLocalPath" -ForegroundColor Green

