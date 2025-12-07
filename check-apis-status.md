# 🔍 API Status Check Guide

## Quick Check URLs

### 1. Check All API Keys Status
Visit: **https://howtosellcursor.me/api/admin/api-keys/status**

This endpoint shows:
- ✅ Which API keys are configured
- ✅ Which are missing
- ✅ Validation status
- ✅ Required vs optional keys

### 2. Check Health Status
Visit: **https://howtosellcursor.me/api/health**

This shows:
- Database connectivity
- Redis connectivity  
- External API availability

### 3. Check Supabase Connection
Visit: **https://howtosellcursor.me/api/verify-supabase**

This shows:
- Supabase URL configured
- Anon key configured
- Service role key configured
- Database connection status
- Tables available

---

## Required APIs (Core)

### ✅ Database (Required)
- **Supabase URL**: `NEXT_PUBLIC_SUPABASE_URL`
- **Supabase Anon Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Supabase Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`

**Status**: Check via `/api/verify-supabase`

---

## Optional APIs (Features)

### 🤖 AI Providers (At least one recommended)
- **Anthropic Claude**: `ANTHROPIC_API_KEY` (Recommended - free tier)
- **OpenAI GPT**: `OPENAI_API_KEY` (Alternative)

**Status**: Check via `/api/admin/api-keys/status`

### 🎤 Voice Features
- **ElevenLabs**: `ELEVENLABS_API_KEY`
- **ElevenLabs Agent**: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- **ElevenLabs Voice**: `NEXT_PUBLIC_ELEVENLABS_VOICE_ID`
- **Vapi Phone Calls**: `VAPI_API_KEY`

**Status**: Check via `/api/admin/api-keys/status`

### 📊 Analytics & Data
- **Alpha Vantage**: `ALPHA_VANTAGE_API_KEY` (Financial data)
- **Clearbit**: `CLEARBIT_API_KEY` (Company enrichment)
- **News API**: `NEWS_API_KEY` (News sentiment)

**Status**: Check via `/api/admin/api-keys/status`

### 💾 Storage
- **S3 Endpoint**: `S3_ENDPOINT`
- **S3 Access Key**: `S3_ACCESS_KEY_ID`
- **S3 Secret Key**: `S3_SECRET_ACCESS_KEY`
- **S3 Bucket**: `S3_BUCKET`

**Status**: Check via `/api/admin/api-keys/status`

---

## How to Check Status

### Option 1: Via Browser
1. Visit: https://howtosellcursor.me/api/admin/api-keys/status
2. View JSON response showing all API key statuses

### Option 2: Via Terminal
```powershell
curl https://howtosellcursor.me/api/admin/api-keys/status
```

### Option 3: Check Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Check which variables are set

---

## What Each Status Means

### ✅ **Configured**
- API key is set in Vercel environment variables
- Format is valid
- Ready to use

### ❌ **Missing**
- API key not set in Vercel
- Feature will be disabled/hidden
- Add to Vercel Dashboard → Environment Variables

### ⚠️ **Invalid**
- API key is set but format is wrong
- Check the key format requirements
- Re-add with correct format

---

## Quick Fixes

### If API Keys Are Missing

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click your project**: `cursor-gtm-training`
3. **Settings** → **Environment Variables**
4. **Add missing keys**:
   - Name: `API_KEY_NAME` (e.g., `ANTHROPIC_API_KEY`)
   - Value: `your-api-key-here`
   - Environment: Select `Production`, `Preview`, `Development`
5. **Save**
6. **Redeploy**: Go to Deployments → Click **...** → **Redeploy**

---

## Testing APIs

### Test Supabase
```bash
curl https://howtosellcursor.me/api/verify-supabase
```

### Test Health
```bash
curl https://howtosellcursor.me/api/health
```

### Test API Keys Status
```bash
curl https://howtosellcursor.me/api/admin/api-keys/status
```

---

## Common Issues

### ❌ "API key not configured"
- **Fix**: Add the key to Vercel environment variables
- **Where**: Vercel Dashboard → Settings → Environment Variables

### ❌ "Invalid API key format"
- **Fix**: Check the key format (starts with correct prefix, correct length)
- **Example**: Anthropic keys start with `sk-ant-`

### ❌ "Feature not showing"
- **Fix**: Some features hide themselves if API keys are missing
- **Check**: Visit `/api/admin/api-keys/status` to see what's configured

---

**Check your API status now**: https://howtosellcursor.me/api/admin/api-keys/status
