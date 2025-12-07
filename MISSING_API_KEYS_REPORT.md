# 🔍 Missing API Keys Report

## How to Check Your Current Status

Run this command to see what's configured:
```powershell
.\test-all-apis-comprehensive.ps1
```

Or visit these URLs in your browser:
- https://howtosellcursor.me/api/admin/api-keys/status
- https://howtosellcursor.me/api/verify-supabase
- https://howtosellcursor.me/api/health

---

## 📋 API Keys You Need to Get

Based on your application's requirements, here's what you need:

---

## ✅ CRITICAL - Must Have (App Won't Work Without These)

### 1. Supabase Database (3 Keys - ALL REQUIRED)

**Get them from**: https://supabase.com/dashboard/project/_/settings/api

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Format: `https://your-project-id.supabase.co`
   - Where: Supabase Dashboard → Settings → API → Project URL

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Format: Long JWT token starting with `eyJ`
   - Where: Supabase Dashboard → Settings → API → anon/public key

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Format: Long JWT token starting with `eyJ`
   - Where: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **Keep this secret!** Never expose it publicly.

**If you don't have Supabase yet:**
1. Go to: https://supabase.com
2. Sign up (free tier available)
3. Create a new project
4. Get your keys from Settings → API

---

### 2. AI Provider (At Least ONE Required)

#### Option A: Anthropic Claude (Recommended - Free Tier Available)

**Get it from**: https://console.anthropic.com/

- **`ANTHROPIC_API_KEY`**
  - Format: Starts with `sk-ant-`
  - Steps:
    1. Sign up at https://console.anthropic.com/
    2. Go to API Keys section
    3. Create new API key
    4. Copy the key (starts with `sk-ant-`)
  - **Free Tier**: Available (generous free tier)
  - **Best for**: Financial analysis, roleplay scenarios

#### Option B: OpenAI GPT (Alternative)

**Get it from**: https://platform.openai.com/api-keys

- **`OPENAI_API_KEY`**
  - Format: Starts with `sk-`
  - Steps:
    1. Sign up at https://platform.openai.com/
    2. Go to API Keys section
    3. Create new secret key
    4. Copy the key (starts with `sk-`)
  - **Cost**: Pay-as-you-go

**Recommendation**: Use Anthropic Claude (free tier available)

---

## 🎯 HIGH PRIORITY - Strongly Recommended

### 3. ElevenLabs (Voice Features)

**Get it from**: https://elevenlabs.io/app/settings/api-keys

- **`ELEVENLABS_API_KEY`**
  - Steps:
    1. Sign up at https://elevenlabs.io/
    2. Go to Profile → API Keys
    3. Copy your API key
  - **Purpose**: Text-to-speech, voice synthesis
  - **Cost**: Pay-as-you-go (has free tier)

- **`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`** (Optional)
  - Get it: https://elevenlabs.io/app/convai
  - Steps:
    1. Go to Conversational AI section
    2. Create an agent
    3. Copy the Agent ID
  - **Purpose**: Conversational AI widget

- **`NEXT_PUBLIC_ELEVENLABS_VOICE_ID`** (Optional)
  - Get it: https://elevenlabs.io/app/voice-library
  - Steps:
    1. Browse voice library
    2. Select a voice
    3. Copy the Voice ID
  - **Purpose**: Custom voice selection

**Without these**: Voice features hidden (but app still works)

---

### 4. Vapi (Phone Call Training)

**Get it from**: https://vapi.ai/dashboard

- **`VAPI_API_KEY`**
  - Steps:
    1. Sign up at https://vapi.ai/
    2. Go to Dashboard → API Keys
    3. Create new API key
    4. Copy the key
  - **Purpose**: Phone call training features
  - **Cost**: Pay-as-you-go

**Without this**: Phone call features won't work

---

## 📊 MEDIUM PRIORITY - Nice to Have

### 5. Alpha Vantage (Financial Data)

**Get it from**: https://www.alphavantage.co/support/#api-key

- **`ALPHA_VANTAGE_API_KEY`**
  - Steps:
    1. Go to https://www.alphavantage.co/support/#api-key
    2. Fill out the form (name, email)
    3. Get your free API key instantly
  - **Free Tier**: 5 requests/minute, 500/day
  - **Purpose**: Company financial data, stock quotes

**Without this**: Financial data features limited

---

### 6. Clearbit (Company Enrichment)

**Get it from**: https://clearbit.com/

- **`CLEARBIT_API_KEY`**
  - Steps:
    1. Sign up at https://clearbit.com/
    2. Go to API Keys section
    3. Copy your API key
  - **Free Tier**: 50 API calls/month
  - **Purpose**: Company data enrichment

**Without this**: Company enrichment features limited

---

### 7. News API (News Sentiment)

**Get it from**: https://newsapi.org/register

- **`NEWS_API_KEY`**
  - Steps:
    1. Sign up at https://newsapi.org/register
    2. Verify your email
    3. Get your API key from dashboard
  - **Free Tier**: 100 requests/day
  - **Purpose**: News articles and sentiment analysis

**Without this**: News features won't work

---

### 8. Hunter.io (Email Verification)

**Get it from**: https://hunter.io

- **`HUNTER_API_KEY`**
  - Steps:
    1. Sign up at https://hunter.io
    2. Go to Settings → API
    3. Copy your API key
  - **Free Tier**: 25 searches/month, 50 verifications/month
  - **Purpose**: Email verification and finding

**Without this**: Email verification features won't work

---

## 🚀 Quick Setup Guide

### Step 1: Get Your API Keys
Follow the "Get it" links above for each service.

### Step 2: Add to Vercel
1. Go to: https://vercel.com/dashboard
2. Click your project: `cursor-gtm-training`
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**
5. For each key:
   - **Name**: `API_KEY_NAME` (e.g., `ANTHROPIC_API_KEY`)
   - **Value**: `your-api-key-here`
   - **Environment**: Select `Production`, `Preview`, `Development`
6. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**

---

## 📊 Priority Checklist

### Minimum to Get Started (App Works):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ANTHROPIC_API_KEY` OR `OPENAI_API_KEY`

### Recommended (Better Features):
- [ ] `ELEVENLABS_API_KEY`
- [ ] `ALPHA_VANTAGE_API_KEY`
- [ ] `VAPI_API_KEY`

### Optional (Advanced Features):
- [ ] `CLEARBIT_API_KEY`
- [ ] `NEWS_API_KEY`
- [ ] `HUNTER_API_KEY`

---

## 💰 Cost Summary

### Free Tiers Available:
- ✅ Anthropic Claude (free tier - recommended)
- ✅ Alpha Vantage (free tier)
- ✅ Clearbit (50 calls/month free)
- ✅ News API (100 requests/day free)
- ✅ Hunter.io (25 searches/month free)
- ✅ Supabase (free tier available)

### Paid (If Needed):
- ElevenLabs: Pay-as-you-go
- Vapi: Pay-as-you-go
- OpenAI: Pay-as-you-go

**You can get started with mostly free tiers!**

---

## 🧪 Test After Adding Keys

Run this to verify everything is configured:
```powershell
.\test-all-apis-comprehensive.ps1
```

Or check manually:
- https://howtosellcursor.me/api/admin/api-keys/status

---

## 📞 Need Help?

1. **Check current status**: Run `.\test-all-apis-comprehensive.ps1`
2. **See what's missing**: Check the output above
3. **Add missing keys**: Follow the "Get it" links
4. **Add to Vercel**: Settings → Environment Variables
5. **Redeploy**: Deployments → Redeploy

---

**Start with the minimum required keys, then add optional ones as needed!**
