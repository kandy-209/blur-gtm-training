# 🔧 Vapi Phone Call Setup - Complete Fix

## Issue Identified

Vapi phone call training is not working because:
1. **VAPI_API_KEY not set in Vercel** - Environment variable missing
2. **Code expects VAPI_API_KEY** - But you have Vapi public/private keys
3. **Not deployed to production** - Changes may not be on main branch

---

## ✅ What Needs to Be Fixed

### 1. Vapi API Key Configuration

**Vapi uses a single API key** (not separate public/private). The code expects:
- `VAPI_API_KEY` - Your Vapi API key from https://vapi.ai/dashboard

**You mentioned having:**
- Vapi public key: `8f066952-c26d-462c-9496-778403910b4e`
- Vapi private key: `f835d510-3674-4c3f-820e-47dd1644a118`

**For Vapi API calls, you need the API key from your Vapi dashboard**, not the public/private keys.

---

## 🔧 Step-by-Step Fix

### Step 1: Get Your Vapi API Key

1. Go to: https://vapi.ai/dashboard
2. Sign in to your account
3. Go to **Settings** → **API Keys**
4. Copy your **API Key** (starts with something like `sk-` or similar)
5. ⚠️ This is different from public/private keys - it's the API key for making calls

### Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click project: **cursor-gtm-training**
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name**: `VAPI_API_KEY`
   - **Value**: Your Vapi API key from Step 1
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**

### Step 3: Verify Code is on Main Branch

The phone call training code is already in the codebase:
- ✅ `/api/vapi/sales-call` route exists
- ✅ `/sales-training` page exists
- ✅ `PhoneCallTraining` component exists

**Make sure it's deployed:**
1. Check you're on `main` branch
2. Push any changes: `git push origin main`
3. Vercel will auto-deploy

### Step 4: Redeploy After Adding Key

After adding `VAPI_API_KEY`:
1. Go to **Deployments** tab in Vercel
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ What Should Work After Fix

1. **Phone Training Page**: `/sales-training`
   - Select scenario
   - Enter phone number
   - Click "Start Training Call"
   - Receive call from Vapi

2. **Call Features**:
   - Real phone calls via Vapi
   - Live metrics during call
   - Post-call analysis
   - Voice coaching metrics

---

## 🔍 Verify It's Working

### Test Locally:
1. Add `VAPI_API_KEY` to `.env.local`
2. Restart dev server
3. Go to http://localhost:3000/sales-training
4. Try starting a call

### Test on Production:
1. After adding to Vercel and redeploying
2. Go to https://howtosellcursor.me/sales-training
3. Try starting a call

---

## 📋 Required Environment Variables

**For Vapi Phone Calls:**
- `VAPI_API_KEY` - Your Vapi API key (REQUIRED)

**For Voice (ElevenLabs):**
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` - Voice ID (optional, has default)
- `ELEVENLABS_API_KEY` - For advanced features (optional)

**For Analysis:**
- `MODAL_FUNCTION_URL` - Modal function URL (optional)

---

## 🎯 Quick Fix Commands

### Add to Local `.env.local`:
```bash
VAPI_API_KEY=your-vapi-api-key-here
```

### Add to Vercel:
```bash
npx vercel env add VAPI_API_KEY production
# Paste your key when prompted
npx vercel env add VAPI_API_KEY preview
npx vercel env add VAPI_API_KEY development
```

### Redeploy:
```bash
npx vercel --prod
```

---

**The main issue is VAPI_API_KEY not being set in Vercel!** 

**Add it to Vercel environment variables and redeploy, then phone calls will work.**
