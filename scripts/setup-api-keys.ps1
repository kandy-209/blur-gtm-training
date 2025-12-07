# Interactive API Keys Setup Script
# Guides user through setting up all API keys

param(
    [switch]$CheckOnly,
    [switch]$GenerateEnvFile
)

Write-Host "API Keys Setup & Management" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

if ($CheckOnly) {
    Write-Host "Checking API Keys Status..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check environment variables
    $requiredKeys = @(
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    $optionalKeys = @(
        "ANTHROPIC_API_KEY",
        "OPENAI_API_KEY",
        "ELEVENLABS_API_KEY",
        "NEXT_PUBLIC_ELEVENLABS_VOICE_ID",
        "NEXT_PUBLIC_ELEVENLABS_AGENT_ID",
        "VAPI_API_KEY",
        "MODAL_FUNCTION_URL",
        "ALPHA_VANTAGE_API_KEY",
        "CLEARBIT_API_KEY",
        "NEWS_API_KEY",
        "SENTRY_DSN",
        "REDIS_URL"
    )
    
    Write-Host "Required Keys:" -ForegroundColor Yellow
    foreach ($key in $requiredKeys) {
        $value = [Environment]::GetEnvironmentVariable($key, "Process")
        if ($value) {
            Write-Host "  [OK] $key" -ForegroundColor Green
        } else {
            Write-Host "  [MISSING] $key" -ForegroundColor Red
        }
    }
    
    Write-Host "`nOptional Keys:" -ForegroundColor Yellow
    foreach ($key in $optionalKeys) {
        $value = [Environment]::GetEnvironmentVariable($key, "Process")
        if ($value) {
            Write-Host "  [OK] $key" -ForegroundColor Green
        } else {
            Write-Host "  [NOT SET] $key" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    exit 0
}

if ($GenerateEnvFile) {
    Write-Host "Generating .env.example file..." -ForegroundColor Yellow
    
    $envExample = @"
# ============================================
# Core Database (Required)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# AI Providers (Optional)
# ============================================
# Anthropic Claude - https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-key-here

# ============================================
# Voice & Phone (Optional)
# ============================================
# ElevenLabs - https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your-key-here
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your-voice-id-here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id-here

# Vapi - https://vapi.ai/dashboard
VAPI_API_KEY=your-key-here

# Modal - https://modal.com/
MODAL_FUNCTION_URL=https://your-username--app-name-function.modal.run

# ============================================
# Analytics & Data (Optional)
# ============================================
# Alpha Vantage - https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your-key-here

# Clearbit - https://clearbit.com/
CLEARBIT_API_KEY=your-key-here

# News API - https://newsapi.org/register
NEWS_API_KEY=your-key-here

# ============================================
# Storage (Optional)
# ============================================
S3_ENDPOINT=https://your-endpoint.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1

# ============================================
# Monitoring (Optional)
# ============================================
# Sentry - https://sentry.io/
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/project-id

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
"@
    
    $envExample | Out-File -FilePath ".env.example" -Encoding UTF8
    Write-Host "[OK] Created .env.example file" -ForegroundColor Green
    Write-Host "   Copy to .env.local and fill in your values" -ForegroundColor Yellow
    exit 0
}

Write-Host "API Keys Setup Guide" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script will help you set up all API keys for the application." -ForegroundColor White
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  -CheckOnly       : Check current API keys status" -ForegroundColor White
Write-Host "  -GenerateEnvFile : Generate .env.example file" -ForegroundColor White
Write-Host ""
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  .\setup-api-keys.ps1 -CheckOnly" -ForegroundColor White
Write-Host "  .\setup-api-keys.ps1 -GenerateEnvFile" -ForegroundColor White
Write-Host ""

# Interactive setup
Write-Host "Would you like to:" -ForegroundColor Yellow
Write-Host "  1. Check current API keys status" -ForegroundColor White
Write-Host "  2. Generate .env.example file" -ForegroundColor White
Write-Host "  3. Exit" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        & $PSCommandPath -CheckOnly
    }
    "2" {
        & $PSCommandPath -GenerateEnvFile
    }
    "3" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
        exit 1
    }
}

