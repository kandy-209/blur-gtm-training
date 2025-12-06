# 📊 API Status Check Results

## How to Check Your APIs

I've created a PowerShell script to check all your APIs. Run it with:

```powershell
.\check-all-apis.ps1
```

Or check manually via these URLs:

---

## 🔍 Check Endpoints

### 1. **API Keys Status**
**URL**: https://howtosellcursor.me/api/admin/api-keys/status

**What it shows:**
- ✅ Which API keys are configured
- ❌ Which keys are missing
- ⚠️ Which keys are invalid
- Summary of all keys

**Expected Response:**
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
    "missing": 3
  }
}
```

---

### 2. **Health Check**
**URL**: https://howtosellcursor.me/api/health

**What it shows:**
- Database connectivity
- Redis connectivity
- External API availability

**Expected Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "external_apis": "ok"
  }
}
```

---

### 3. **Supabase Verification**
**URL**: https://howtosellcursor.me/api/verify-supabase

**What it shows:**
- Supabase URL configured
- Anon key configured
- Service role key configured
- Database connection status
- Tables available

**Expected Response:**
```json
{
  "status": "success",
  "checks": {
    "url": true,
    "anonKey": true,
    "serviceRoleKey": true,
    "connection": true,
    "tables": true
  }
}
```

---

## 📋 Required APIs Checklist

### ✅ Core Database (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public/anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key

**Check**: Visit `/api/verify-supabase`

---

### ✅ AI Provider (At Least One Required)
- [ ] `ANTHROPIC_API_KEY` - Recommended (free tier)
- [ ] `OPENAI_API_KEY` - Alternative

**Check**: Visit `/api/admin/api-keys/status`

---

## 🎯 Optional APIs

### Voice Features
- [ ] `ELEVENLABS_API_KEY` - Text-to-speech
- [ ] `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - Conversational AI
- [ ] `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` - Voice ID
- [ ] `VAPI_API_KEY` - Phone calls

### Analytics & Data
- [ ] `ALPHA_VANTAGE_API_KEY` - Financial data
- [ ] `CLEARBIT_API_KEY` - Company enrichment
- [ ] `NEWS_API_KEY` - News sentiment

### Storage
- [ ] `S3_ENDPOINT` - S3 endpoint
- [ ] `S3_ACCESS_KEY_ID` - S3 access key
- [ ] `S3_SECRET_ACCESS_KEY` - S3 secret key
- [ ] `S3_BUCKET` - S3 bucket name

---

## 🔧 How to Fix Issues

### If APIs Are Missing:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click your project: `cursor-gtm-training`

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - Enter:
     - **Name**: `API_KEY_NAME` (e.g., `ANTHROPIC_API_KEY`)
     - **Value**: `your-api-key-here`
     - **Environment**: Select `Production`, `Preview`, `Development`
   - Click **Save**

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**

---

## 🚨 Common Issues

### Issue: "API key not configured"
**Fix**: Add the key to Vercel environment variables

### Issue: "Invalid API key format"
**Fix**: Check the key format:
- Anthropic: Starts with `sk-ant-`
- OpenAI: Starts with `sk-`
- Supabase: Starts with `eyJ`

### Issue: "Feature not showing"
**Fix**: Some features hide themselves if API keys are missing. Check `/api/admin/api-keys/status` to see what's configured.

---

## 📞 Next Steps

1. **Run the checker script**: `.\check-all-apis.ps1`
2. **Review the results**: See which APIs are missing
3. **Add missing keys**: Add to Vercel Dashboard
4. **Redeploy**: Redeploy your app
5. **Verify**: Run the checker again

---

**Run the checker now**: `.\check-all-apis.ps1`
