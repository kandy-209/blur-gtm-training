# 🔑 Required API Keys - Complete List

Based on comprehensive testing, here are the API keys you need to provide:

---

## ✅ CRITICAL - Must Have (Required)

### 1. **Supabase Database** (3 keys - ALL REQUIRED)
**Status**: ⚠️ **MUST CONFIGURE**

- **`NEXT_PUBLIC_SUPABASE_URL`**
  - Format: `https://your-project.supabase.co`
  - Get it: https://supabase.com/dashboard/project/_/settings/api
  - **Required**: Yes
  
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
  - Format: Starts with `eyJ` (JWT token)
  - Get it: https://supabase.com/dashboard/project/_/settings/api
  - **Required**: Yes
  
- **`SUPABASE_SERVICE_ROLE_KEY`**
  - Format: Starts with `eyJ` (JWT token)
  - Get it: https://supabase.com/dashboard/project/_/settings/api
  - **Required**: Yes (for API routes)
  - ⚠️ **Keep this secret!**

**Without these**: App won't work - no database storage

---

### 2. **AI Provider** (At Least ONE Required)
**Status**: ⚠️ **MUST CONFIGURE AT LEAST ONE**

#### Option A: Anthropic Claude (Recommended - Free Tier Available)
- **`ANTHROPIC_API_KEY`**
  - Format: Starts with `sk-ant-`
  - Get it: https://console.anthropic.com/
  - **Required**: Yes (if not using OpenAI)
  - **Free Tier**: Available
  - **Best for**: Financial analysis, roleplay

#### Option B: OpenAI GPT
- **`OPENAI_API_KEY`**
  - Format: Starts with `sk-`
  - Get it: https://platform.openai.com/api-keys
  - **Required**: Yes (if not using Anthropic)
  - **Cost**: Pay-as-you-go

**Without these**: AI features won't work

---

## 🎯 HIGH PRIORITY - Strongly Recommended

### 3. **ElevenLabs** (Voice Features)
**Status**: ⚠️ **RECOMMENDED**

- **`ELEVENLABS_API_KEY`**
  - Get it: https://elevenlabs.io/app/settings/api-keys
  - **Required**: No (but enables voice features)
  - **Purpose**: Text-to-speech, voice synthesis

- **`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`** (Optional)
  - Get it: https://elevenlabs.io/app/convai
  - **Required**: No
  - **Purpose**: Conversational AI widget

- **`NEXT_PUBLIC_ELEVENLABS_VOICE_ID`** (Optional)
  - Get it: https://elevenlabs.io/app/voice-library
  - **Required**: No (has default)
  - **Purpose**: Custom voice selection

**Without these**: Voice features hidden (but app still works)

---

### 4. **Vapi** (Phone Call Training)
**Status**: ⚠️ **OPTIONAL**

- **`VAPI_API_KEY`**
  - Get it: https://vapi.ai/dashboard
  - **Required**: No
  - **Purpose**: Phone call training features

**Without this**: Phone call features won't work

---

## 📊 MEDIUM PRIORITY - Nice to Have

### 5. **Alpha Vantage** (Financial Data)
**Status**: ⚠️ **OPTIONAL**

- **`ALPHA_VANTAGE_API_KEY`**
  - Get it: https://www.alphavantage.co/support/#api-key
  - **Required**: No
  - **Free Tier**: 5 requests/minute, 500/day
  - **Purpose**: Company financial data, stock quotes

**Without this**: Financial data features limited

---

### 6. **Clearbit** (Company Enrichment)
**Status**: ⚠️ **OPTIONAL**

- **`CLEARBIT_API_KEY`**
  - Get it: https://clearbit.com/
  - **Required**: No
  - **Free Tier**: 50 API calls/month
  - **Purpose**: Company data enrichment

**Without this**: Company enrichment features limited

---

### 7. **News API** (News Sentiment)
**Status**: ⚠️ **OPTIONAL**

- **`NEWS_API_KEY`**
  - Get it: https://newsapi.org/register
  - **Required**: No
  - **Free Tier**: 100 requests/day
  - **Purpose**: News articles and sentiment analysis

**Without this**: News features won't work

---

### 8. **Hunter.io** (Email Verification)
**Status**: ⚠️ **OPTIONAL**

- **`HUNTER_API_KEY`**
  - Get it: https://hunter.io
  - **Required**: No
  - **Free Tier**: 25 searches/month, 50 verifications/month
  - **Purpose**: Email verification and finding

**Without this**: Email verification features won't work

---

## 💾 STORAGE (Optional)

### 9. **S3 Storage**
**Status**: ⚠️ **OPTIONAL**

- **`S3_ENDPOINT`** - S3 endpoint URL
- **`S3_ACCESS_KEY_ID`** - Access key
- **`S3_SECRET_ACCESS_KEY`** - Secret key
- **`S3_BUCKET`** - Bucket name

**Without these**: File storage features limited

---

## 📋 Quick Setup Checklist

### Minimum Required (App Works):
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
- [ ] S3 Storage keys

---

## 🚀 How to Add API Keys

### Step 1: Get Your API Keys
Follow the "Get it" links above for each service and sign up/get your keys.

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

## 🧪 Test Your Configuration

Run this to check your API status:
```powershell
.\test-all-apis-comprehensive.ps1
```

Or visit:
- https://howtosellcursor.me/api/admin/api-keys/status
- https://howtosellcursor.me/api/health
- https://howtosellcursor.me/api/verify-supabase

---

## 💰 Cost Estimate

### Free Tier Available:
- ✅ Anthropic Claude (free tier)
- ✅ Alpha Vantage (free tier)
- ✅ Clearbit (50 calls/month free)
- ✅ News API (100 requests/day free)
- ✅ Hunter.io (25 searches/month free)

### Paid (If Needed):
- ElevenLabs: Pay-as-you-go
- Vapi: Pay-as-you-go
- OpenAI: Pay-as-you-go

**Most features can work with free tiers!**

---

## 📞 Priority Order

1. **First**: Add Supabase keys (required)
2. **Second**: Add Anthropic or OpenAI key (required)
3. **Third**: Add ElevenLabs key (recommended)
4. **Fourth**: Add optional keys as needed

---

**Run the test suite**: `.\test-all-apis-comprehensive.ps1` to see what you're missing!
