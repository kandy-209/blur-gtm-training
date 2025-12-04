# 🔐 API Keys Quick Start

## ✅ What's Been Created

A complete centralized API key management system:

1. **Configuration** (`src/lib/api-keys/config.ts`)
   - All API keys defined with validation rules
   - Categories: core, ai, database, voice, analytics, storage, optional

2. **Validator** (`src/lib/api-keys/validator.ts`)
   - Validates API key formats
   - Checks required vs optional
   - Provides helpful error messages

3. **Status API** (`/api/admin/api-keys/status`)
   - Check all API keys status
   - Returns validation results
   - No sensitive values exposed

4. **Setup Scripts** (`scripts/setup-api-keys.ps1`)
   - Check current keys
   - Generate .env.example
   - Interactive setup

5. **Documentation** (`API_KEYS_MANAGEMENT.md`)
   - Complete guide
   - All providers listed
   - Security best practices

---

## 🚀 Quick Commands

```bash
# Check API keys status
npm run api-keys:check

# Generate .env.example file
npm run api-keys:generate

# Interactive setup
npm run api-keys:setup
```

---

## 📋 Required Keys (3)

1. **NEXT_PUBLIC_SUPABASE_URL**
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
3. **SUPABASE_SERVICE_ROLE_KEY**

Get them: https://supabase.com/dashboard/project/_/settings/api

---

## 🔧 Optional Keys (17+)

### AI Providers
- ANTHROPIC_API_KEY (Claude)
- OPENAI_API_KEY (GPT)

### Voice & Phone
- ELEVENLABS_API_KEY
- NEXT_PUBLIC_ELEVENLABS_VOICE_ID
- NEXT_PUBLIC_ELEVENLABS_AGENT_ID
- VAPI_API_KEY
- MODAL_FUNCTION_URL

### Analytics
- ALPHA_VANTAGE_API_KEY
- CLEARBIT_API_KEY
- NEWS_API_KEY

### Storage
- S3_ENDPOINT
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_BUCKET

### Monitoring
- SENTRY_DSN
- REDIS_URL

---

## ✅ Setup Steps

1. **Generate .env.example**
   ```bash
   npm run api-keys:generate
   ```

2. **Copy to .env.local**
   ```bash
   cp .env.example .env.local
   ```

3. **Fill in your keys**
   Edit `.env.local` with your actual API keys

4. **Check status**
   ```bash
   npm run api-keys:check
   ```

5. **For Vercel**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all keys from `.env.local`
   - Redeploy

---

## 🔍 Check Status

### Via Script
```bash
npm run api-keys:check
```

### Via API
```bash
curl http://localhost:3000/api/admin/api-keys/status
```

Returns JSON with:
- Status of each key (set/not set, valid/invalid)
- Summary (total, valid, invalid, missing)
- Validation errors (if any)

---

## 📚 Full Documentation

See `API_KEYS_MANAGEMENT.md` for:
- Complete list of all API keys
- Where to get each key
- Validation rules
- Security best practices
- Troubleshooting

---

**All API keys are now centrally managed!** 🎉

