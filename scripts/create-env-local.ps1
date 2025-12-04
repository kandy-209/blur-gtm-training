# Create .env.local file with pre-filled values

$envLocalPath = ".env.local"

if (Test-Path $envLocalPath) {
    Write-Host ".env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Creating .env.local with pre-filled values..." -ForegroundColor Cyan

$content = @"
# ============================================
# Core Database (REQUIRED - Get from Supabase)
# ============================================
# Get these from: https://supabase.com/dashboard/project/_/settings/api
# Or run: npm run api-keys:supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# AI Providers (Optional but Recommended)
# ============================================
# Anthropic Claude - https://console.anthropic.com/
ANTHROPIC_API_KEY=

# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=

# ============================================
# Voice & Phone (Optional)
# ============================================
# ElevenLabs - https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=

# Vapi - https://vapi.ai/dashboard
VAPI_API_KEY=

# Modal - https://modal.com/
MODAL_FUNCTION_URL=

# ============================================
# Analytics & Data (Optional)
# ============================================
# Alpha Vantage - https://www.alphavantage.co/support/#api-key
# Free tier: 5 requests/minute, 500/day
ALPHA_VANTAGE_API_KEY=D05K80BVIL89XP20

# Clearbit - https://clearbit.com/
CLEARBIT_API_KEY=

# News API - https://newsapi.org/register
NEWS_API_KEY=

# ============================================
# Storage (Optional - Already configured)
# ============================================
S3_ENDPOINT=https://files.massive.com
S3_ACCESS_KEY_ID=9608b1ba-919e-43df-aaa5-31c69921572c
S3_SECRET_ACCESS_KEY=axEzCy2XHAk2UKVRtPdMS1EQyapWjI0b
S3_BUCKET=flatfiles
S3_REGION=us-east-1

# ============================================
# Monitoring (Optional)
# ============================================
# Sentry - https://sentry.io/settings/projects/
SENTRY_DSN=

# Redis
REDIS_URL=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
"@

$content | Out-File -FilePath $envLocalPath -Encoding UTF8

Write-Host "[OK] Created .env.local!" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Set up Supabase keys" -ForegroundColor Yellow
Write-Host "  Run: npm run api-keys:supabase" -ForegroundColor Cyan
Write-Host ""

