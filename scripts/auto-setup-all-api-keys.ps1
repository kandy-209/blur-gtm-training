# Automated API Keys Setup Script
# Guides user through setting up ALL API keys interactively

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Automated API Keys Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
$envLocalPath = ".env.local"
$envExamplePath = ".env.example"

if (-not (Test-Path $envExamplePath)) {
    Write-Host "Generating .env.example first..." -ForegroundColor Yellow
    & "$PSScriptRoot\setup-api-keys.ps1" -GenerateEnvFile
}

Write-Host "This script will help you set up ALL API keys." -ForegroundColor White
Write-Host "Press Enter to skip any optional keys you don't have yet." -ForegroundColor Yellow
Write-Host ""

# Read existing .env.local if it exists
$envVars = @{}
if (Test-Path $envLocalPath) {
    Write-Host "Found existing .env.local file. Loading current values..." -ForegroundColor Green
    Get-Content $envLocalPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value -and $value -ne '') {
                $envVars[$key] = $value
            }
        }
    }
}

# Required Keys
Write-Host "=== REQUIRED KEYS ===" -ForegroundColor Red
Write-Host ""

$requiredKeys = @(
    @{
        Key = "NEXT_PUBLIC_SUPABASE_URL"
        Name = "Supabase URL"
        Description = "Your Supabase project URL (e.g., https://xxxxx.supabase.co)"
        GetUrl = "https://supabase.com/dashboard/project/_/settings/api"
        Example = "https://your-project.supabase.co"
    },
    @{
        Key = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        Name = "Supabase Anon Key"
        Description = "Supabase anonymous/public key (starts with eyJ...)"
        GetUrl = "https://supabase.com/dashboard/project/_/settings/api"
        Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    @{
        Key = "SUPABASE_SERVICE_ROLE_KEY"
        Name = "Supabase Service Role Key"
        Description = "Supabase service role key (KEEP SECRET! Starts with eyJ...)"
        GetUrl = "https://supabase.com/dashboard/project/_/settings/api"
        Example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
)

foreach ($keyInfo in $requiredKeys) {
    $currentValue = if ($envVars.ContainsKey($keyInfo.Key)) { $envVars[$keyInfo.Key] } else { "" }
    
    Write-Host "[REQUIRED] $($keyInfo.Name)" -ForegroundColor Red
    Write-Host "  Description: $($keyInfo.Description)" -ForegroundColor Gray
    Write-Host "  Get it: $($keyInfo.GetUrl)" -ForegroundColor Gray
    
    if ($currentValue) {
        $masked = if ($currentValue.Length -gt 20) { 
            $currentValue.Substring(0, 10) + "..." + $currentValue.Substring($currentValue.Length - 10)
        } else {
            "***"
        }
        Write-Host "  Current: $masked" -ForegroundColor Green
        $useCurrent = Read-Host "  Use current value? (Y/n)"
        if ($useCurrent -eq "" -or $useCurrent -eq "Y" -or $useCurrent -eq "y") {
            continue
        }
    }
    
    Write-Host "  Example: $($keyInfo.Example)" -ForegroundColor DarkGray
    $value = Read-Host "  Enter value"
    
    if ($value -and $value.Trim() -ne "") {
        $envVars[$keyInfo.Key] = $value.Trim()
        Write-Host "  [OK] Saved" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] This key is REQUIRED!" -ForegroundColor Red
    }
    Write-Host ""
}

# Optional Keys - AI Providers
Write-Host "=== AI PROVIDERS (Optional) ===" -ForegroundColor Yellow
Write-Host ""

$optionalKeys = @(
    @{
        Key = "ANTHROPIC_API_KEY"
        Name = "Anthropic API Key (Claude)"
        Description = "Claude AI API key (starts with sk-ant-)"
        GetUrl = "https://console.anthropic.com/"
        Example = "sk-ant-api03-..."
    },
    @{
        Key = "OPENAI_API_KEY"
        Name = "OpenAI API Key"
        Description = "OpenAI GPT API key (starts with sk-)"
        GetUrl = "https://platform.openai.com/api-keys"
        Example = "sk-proj-..."
    }
)

foreach ($keyInfo in $optionalKeys) {
    $currentValue = if ($envVars.ContainsKey($keyInfo.Key)) { $envVars[$keyInfo.Key] } else { "" }
    
    Write-Host "[OPTIONAL] $($keyInfo.Name)" -ForegroundColor Yellow
    Write-Host "  Description: $($keyInfo.Description)" -ForegroundColor Gray
    Write-Host "  Get it: $($keyInfo.GetUrl)" -ForegroundColor Gray
    
    if ($currentValue) {
        $masked = if ($currentValue.Length -gt 20) { 
            $currentValue.Substring(0, 10) + "..." + $currentValue.Substring($currentValue.Length - 10)
        } else {
            "***"
        }
        Write-Host "  Current: $masked" -ForegroundColor Green
        $useCurrent = Read-Host "  Use current value? (Y/n)"
        if ($useCurrent -eq "" -or $useCurrent -eq "Y" -or $useCurrent -eq "y") {
            Write-Host ""
            continue
        }
    }
    
    $value = Read-Host "  Enter value (or press Enter to skip)"
    
    if ($value -and $value.Trim() -ne "") {
        $envVars[$keyInfo.Key] = $value.Trim()
        Write-Host "  [OK] Saved" -ForegroundColor Green
    }
    Write-Host ""
}

# Optional Keys - Voice & Phone
Write-Host "=== VOICE & PHONE (Optional) ===" -ForegroundColor Yellow
Write-Host ""

$voiceKeys = @(
    @{
        Key = "ELEVENLABS_API_KEY"
        Name = "ElevenLabs API Key"
        Description = "ElevenLabs voice synthesis API key"
        GetUrl = "https://elevenlabs.io/app/settings/api-keys"
        Example = "your-elevenlabs-key"
    },
    @{
        Key = "NEXT_PUBLIC_ELEVENLABS_VOICE_ID"
        Name = "ElevenLabs Voice ID"
        Description = "Default ElevenLabs voice ID"
        GetUrl = "https://elevenlabs.io/app/voice-library"
        Example = "21m00Tcm4TlvDq8ikWAM"
    },
    @{
        Key = "NEXT_PUBLIC_ELEVENLABS_AGENT_ID"
        Name = "ElevenLabs Agent ID"
        Description = "ElevenLabs conversational AI agent ID"
        GetUrl = "https://elevenlabs.io/app/convai"
        Example = "agent_xxxxx"
    },
    @{
        Key = "VAPI_API_KEY"
        Name = "Vapi API Key"
        Description = "Vapi phone call API key"
        GetUrl = "https://vapi.ai/dashboard"
        Example = "your-vapi-key"
    },
    @{
        Key = "MODAL_FUNCTION_URL"
        Name = "Modal Function URL"
        Description = "Modal serverless function endpoint URL"
        GetUrl = "https://modal.com/"
        Example = "https://username--app-name-function.modal.run"
    }
)

foreach ($keyInfo in $voiceKeys) {
    $currentValue = if ($envVars.ContainsKey($keyInfo.Key)) { $envVars[$keyInfo.Key] } else { "" }
    
    Write-Host "[OPTIONAL] $($keyInfo.Name)" -ForegroundColor Yellow
    
    if ($currentValue) {
        $masked = if ($currentValue.Length -gt 30) { 
            $currentValue.Substring(0, 15) + "..."
        } else {
            "***"
        }
        Write-Host "  Current: $masked" -ForegroundColor Green
        $useCurrent = Read-Host "  Use current value? (Y/n)"
        if ($useCurrent -eq "" -or $useCurrent -eq "Y" -or $useCurrent -eq "y") {
            Write-Host ""
            continue
        }
    }
    
    $value = Read-Host "  Enter value (or press Enter to skip)"
    
    if ($value -and $value.Trim() -ne "") {
        $envVars[$keyInfo.Key] = $value.Trim()
        Write-Host "  [OK] Saved" -ForegroundColor Green
    }
    Write-Host ""
}

# Optional Keys - Analytics
Write-Host "=== ANALYTICS & DATA (Optional) ===" -ForegroundColor Yellow
Write-Host ""

$analyticsKeys = @(
    @{
        Key = "ALPHA_VANTAGE_API_KEY"
        Name = "Alpha Vantage API Key"
        Description = "Financial data API key"
        GetUrl = "https://www.alphavantage.co/support/#api-key"
        Example = "your-alpha-vantage-key-here"
    },
    @{
        Key = "CLEARBIT_API_KEY"
        Name = "Clearbit API Key"
        Description = "Company enrichment API key"
        GetUrl = "https://clearbit.com/"
        Example = "your-clearbit-key"
    },
    @{
        Key = "NEWS_API_KEY"
        Name = "News API Key"
        Description = "News sentiment analysis API key"
        GetUrl = "https://newsapi.org/register"
        Example = "your-news-api-key"
    }
)

foreach ($keyInfo in $analyticsKeys) {
    $currentValue = if ($envVars.ContainsKey($keyInfo.Key)) { $envVars[$keyInfo.Key] } else { "" }
    
    Write-Host "[OPTIONAL] $($keyInfo.Name)" -ForegroundColor Yellow
    
    if ($currentValue) {
        Write-Host "  Current: ***" -ForegroundColor Green
        $useCurrent = Read-Host "  Use current value? (Y/n)"
        if ($useCurrent -eq "" -or $useCurrent -eq "Y" -or $useCurrent -eq "y") {
            Write-Host ""
            continue
        }
    }
    
    $value = Read-Host "  Enter value (or press Enter to skip)"
    
    if ($value -and $value.Trim() -ne "") {
        $envVars[$keyInfo.Key] = $value.Trim()
        Write-Host "  [OK] Saved" -ForegroundColor Green
    }
    Write-Host ""
}

# Write .env.local file
Write-Host "=== SAVING CONFIGURATION ===" -ForegroundColor Cyan
Write-Host ""

$content = @"
# ============================================
# Core Database (Required)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=$($envVars['NEXT_PUBLIC_SUPABASE_URL'])
NEXT_PUBLIC_SUPABASE_ANON_KEY=$($envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'])
SUPABASE_SERVICE_ROLE_KEY=$($envVars['SUPABASE_SERVICE_ROLE_KEY'])

# ============================================
# AI Providers (Optional)
# ============================================
"@

if ($envVars.ContainsKey('ANTHROPIC_API_KEY')) {
    $content += "`nANTHROPIC_API_KEY=$($envVars['ANTHROPIC_API_KEY'])"
}
if ($envVars.ContainsKey('OPENAI_API_KEY')) {
    $content += "`nOPENAI_API_KEY=$($envVars['OPENAI_API_KEY'])"
}

$content += @"

# ============================================
# Voice & Phone (Optional)
# ============================================
"@

if ($envVars.ContainsKey('ELEVENLABS_API_KEY')) {
    $content += "`nELEVENLABS_API_KEY=$($envVars['ELEVENLABS_API_KEY'])"
}
if ($envVars.ContainsKey('NEXT_PUBLIC_ELEVENLABS_VOICE_ID')) {
    $content += "`nNEXT_PUBLIC_ELEVENLABS_VOICE_ID=$($envVars['NEXT_PUBLIC_ELEVENLABS_VOICE_ID'])"
}
if ($envVars.ContainsKey('NEXT_PUBLIC_ELEVENLABS_AGENT_ID')) {
    $content += "`nNEXT_PUBLIC_ELEVENLABS_AGENT_ID=$($envVars['NEXT_PUBLIC_ELEVENLABS_AGENT_ID'])"
}
if ($envVars.ContainsKey('VAPI_API_KEY')) {
    $content += "`nVAPI_API_KEY=$($envVars['VAPI_API_KEY'])"
}
if ($envVars.ContainsKey('MODAL_FUNCTION_URL')) {
    $content += "`nMODAL_FUNCTION_URL=$($envVars['MODAL_FUNCTION_URL'])"
}

$content += @"

# ============================================
# Analytics & Data (Optional)
# ============================================
"@

if ($envVars.ContainsKey('ALPHA_VANTAGE_API_KEY')) {
    $content += "`nALPHA_VANTAGE_API_KEY=$($envVars['ALPHA_VANTAGE_API_KEY'])"
}
if ($envVars.ContainsKey('CLEARBIT_API_KEY')) {
    $content += "`nCLEARBIT_API_KEY=$($envVars['CLEARBIT_API_KEY'])"
}
if ($envVars.ContainsKey('NEWS_API_KEY')) {
    $content += "`nNEWS_API_KEY=$($envVars['NEWS_API_KEY'])"
}

$content += @"

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
"@

$content | Out-File -FilePath $envLocalPath -Encoding UTF8 -NoNewline

Write-Host "[OK] Saved to .env.local" -ForegroundColor Green
Write-Host ""

# Validate required keys
Write-Host "=== VALIDATION ===" -ForegroundColor Cyan
Write-Host ""

$missingRequired = @()
if (-not $envVars.ContainsKey('NEXT_PUBLIC_SUPABASE_URL') -or $envVars['NEXT_PUBLIC_SUPABASE_URL'] -eq '') {
    $missingRequired += "NEXT_PUBLIC_SUPABASE_URL"
}
if (-not $envVars.ContainsKey('NEXT_PUBLIC_SUPABASE_ANON_KEY') -or $envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] -eq '') {
    $missingRequired += "NEXT_PUBLIC_SUPABASE_ANON_KEY"
}
if (-not $envVars.ContainsKey('SUPABASE_SERVICE_ROLE_KEY') -or $envVars['SUPABASE_SERVICE_ROLE_KEY'] -eq '') {
    $missingRequired += "SUPABASE_SERVICE_ROLE_KEY"
}

if ($missingRequired.Count -eq 0) {
    Write-Host "[OK] All required keys are set!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Missing required keys:" -ForegroundColor Red
    foreach ($key in $missingRequired) {
        Write-Host "  - $key" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please add these keys to .env.local before running the app." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Review .env.local file" -ForegroundColor White
Write-Host "2. Add any missing required keys" -ForegroundColor White
Write-Host "3. For Vercel: Add all keys to Vercel Dashboard -> Settings -> Environment Variables" -ForegroundColor White
Write-Host "4. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Check status anytime with: npm run api-keys:check" -ForegroundColor Yellow
Write-Host ""

