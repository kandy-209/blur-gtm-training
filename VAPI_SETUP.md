# Vapi API Key Setup Guide

## Required for Phone Training Feature

To use the Phone Training feature, you need to add the **VAPI_API_KEY** environment variable.

## Step 1: Get Your Vapi API Key

1. Sign up or log in at [https://vapi.ai](https://vapi.ai)
2. Go to your Dashboard → Settings → API Keys
3. Copy your API key (it should look like: `sk_...` or similar)

## Step 2: Add to Local Development (.env.local)

Add this line to your `.env.local` file:

```bash
VAPI_API_KEY=your_vapi_api_key_here
```

**Location:** `/Users/lemonbear/Desktop/Blurred Lines/.env.local`

After adding, restart your dev server:
```bash
# Stop the current server (Ctrl+C) and restart
npm run dev
```

## Step 3: Add to Vercel (Production)

### Option A: Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: **cursor-gtm-training**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name:** `VAPI_API_KEY`
   - **Value:** Your Vapi API key
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy** your latest deployment

### Option B: Vercel CLI

```bash
npx vercel env add VAPI_API_KEY production
# Paste your key when prompted
```

Then redeploy:
```bash
npx vercel --prod
```

## Optional: ElevenLabs Voice ID

For better voice quality, you can also add:

```bash
# In .env.local
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

**Note:** The code has a default voice ID, so this is optional.

## Verify Setup

### Local Testing
1. Check the test endpoint: `http://localhost:3000/api/vapi/test`
2. Look for `"apiKeyCheck": {"status": "PASS"}`

### Production Testing
1. Visit: `https://howtosellcursor.me/api/vapi/test`
2. Check the response for API key status

## Current Status

Based on the test results:
- ❌ **VAPI_API_KEY** - Not configured (needs to be added)
- ✅ **Phone number validation** - Working correctly
- ✅ **API structure** - All set up correctly

## Troubleshooting

### "Vapi API key not configured"
- Make sure you added `VAPI_API_KEY` to `.env.local`
- Restart the dev server after adding
- For production, add it to Vercel and redeploy

### "401 Unauthorized" from Vapi
- Check that your API key is correct
- Make sure there are no extra spaces in the key
- Verify your Vapi account is active

### "400 Bad Request" from Vapi
- Usually means phone number format issue (we've fixed this)
- Or invalid request structure (we've fixed this too)
- Check Vercel logs for detailed error messages

## Cost Information

Vapi typically charges per minute of phone calls. Check their pricing at [https://vapi.ai/pricing](https://vapi.ai/pricing)
