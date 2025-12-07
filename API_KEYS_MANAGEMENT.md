# 🔐 API Keys Management Guide

## Overview

This application uses a centralized API key management system to handle all API keys securely.

---

## 🚀 Quick Setup

### 1. Generate .env.example
```bash
powershell -ExecutionPolicy Bypass -File scripts/setup-api-keys.ps1 -GenerateEnvFile
```

### 2. Copy to .env.local
```bash
cp .env.example .env.local
```

### 3. Fill in your API keys
Edit `.env.local` with your actual API keys.

### 4. Check Status
```bash
powershell -ExecutionPolicy Bypass -File scripts/setup-api-keys.ps1 -CheckOnly
```

---

## 📋 Required API Keys

### Core Database (Required)
- **NEXT_PUBLIC_SUPABASE_URL** - Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Supabase anonymous key
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key

**Get them:** https://supabase.com/dashboard/project/_/settings/api

---

## 🔧 Optional API Keys

### AI Providers
- **ANTHROPIC_API_KEY** - Claude AI (recommended)
  - Get: https://console.anthropic.com/
  - Format: `sk-ant-...`
  
- **OPENAI_API_KEY** - OpenAI GPT
  - Get: https://platform.openai.com/api-keys
  - Format: `sk-...`

### Voice & Phone
- **ELEVENLABS_API_KEY** - ElevenLabs voice synthesis
  - Get: https://elevenlabs.io/app/settings/api-keys
  
- **NEXT_PUBLIC_ELEVENLABS_VOICE_ID** - Default voice ID
  - Get: https://elevenlabs.io/app/voice-library
  
- **NEXT_PUBLIC_ELEVENLABS_AGENT_ID** - Conversational AI agent
  - Get: https://elevenlabs.io/app/convai
  
- **VAPI_API_KEY** - Phone call API
  - Get: https://vapi.ai/dashboard

### Serverless
- **MODAL_FUNCTION_URL** - Modal function endpoint
  - Get: After deploying Modal function
  - Format: `https://username--app-name-function.modal.run`

### Analytics & Data
- **ALPHA_VANTAGE_API_KEY** - Financial data
  - Get: https://www.alphavantage.co/support/#api-key
  - Free tier: 5 req/min, 500/day
  
- **CLEARBIT_API_KEY** - Company enrichment
  - Get: https://clearbit.com/
  - Free tier: 50 calls/month
  
- **NEWS_API_KEY** - News sentiment
  - Get: https://newsapi.org/register
  - Free tier available

### Storage
- **S3_ENDPOINT** - S3-compatible storage endpoint
- **S3_ACCESS_KEY_ID** - S3 access key
- **S3_SECRET_ACCESS_KEY** - S3 secret key
- **S3_BUCKET** - S3 bucket name
- **S3_REGION** - S3 region

### Monitoring
- **SENTRY_DSN** - Error tracking
  - Get: https://sentry.io/settings/projects/
  - Format: `https://key@org.ingest.sentry.io/project-id`
  
- **REDIS_URL** - Redis connection URL
  - Format: `redis://localhost:6379`

---

## 🔍 Check API Keys Status

### Via Script
```bash
powershell -ExecutionPolicy Bypass -File scripts/setup-api-keys.ps1 -CheckOnly
```

### Via API Endpoint
```bash
curl http://localhost:3000/api/admin/api-keys/status
```

Returns:
```json
{
  "success": true,
  "status": {
    "NEXT_PUBLIC_SUPABASE_URL": {
      "name": "Supabase URL",
      "category": "database",
      "required": true,
      "set": true,
      "valid": true
    },
    ...
  },
  "summary": {
    "total": 20,
    "valid": 15,
    "invalid": 2,
    "missing": 3,
    "warnings": 1
  },
  "allValid": false
}
```

---

## ✅ Validation Rules

The system automatically validates API keys:

- **Format validation** - Checks if key matches expected format
- **Length validation** - Ensures minimum length
- **Pattern matching** - Validates against regex patterns
- **URL validation** - Validates URLs are properly formatted
- **Prefix checking** - Verifies keys start with expected prefixes

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use different keys for dev/prod** - Set in Vercel environment variables
3. **Rotate keys regularly** - Especially if exposed
4. **Use service role keys carefully** - Only on server-side
5. **Monitor API usage** - Check dashboards for unusual activity

---

## 📝 Vercel Setup

### Add Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your actual value
   - **Environment**: Production, Preview, Development (check all)
3. Click **Save**
4. Redeploy after adding variables

### Bulk Import (via CLI)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local
```

---

## 🛠️ Troubleshooting

### Key Not Working
1. Check format matches expected pattern
2. Verify key is active in provider dashboard
3. Check for typos or extra spaces
4. Ensure key has required permissions

### Validation Errors
- Check the error message for specific issue
- Verify key format matches documentation
- Ensure minimum length requirements met

### Missing Keys
- Check `.env.local` file exists
- Verify variable names match exactly (case-sensitive)
- Restart dev server after adding keys

---

## 📚 API Key Categories

- **core** - Essential for app to function
- **ai** - AI/ML providers
- **database** - Database connections
- **voice** - Voice/phone features
- **analytics** - Data and analytics
- **storage** - File storage
- **optional** - Nice-to-have features

---

## 🔄 Updating Keys

1. Update `.env.local` with new key
2. Restart dev server: `npm run dev`
3. For production: Update in Vercel Dashboard
4. Redeploy after updating

---

## 📞 Support

For API key issues:
1. Check provider dashboard for key status
2. Verify key hasn't expired
3. Check usage limits/quota
4. Review error messages in logs

---

**All API keys are managed securely through environment variables!** 🔐

