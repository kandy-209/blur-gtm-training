# 🚀 Quick Vapi API Setup

## Problem
You're seeing: "Vapi API key not configured" or Vapi calls aren't working.

## Quick Fix

### Step 1: Get Your Vapi API Key
1. Go to: https://vapi.ai/dashboard
2. Sign in or create an account
3. Go to **Settings** → **API Keys**
4. Copy your API key (starts with something like `sk-...`)

### Step 2: Add to .env.local
Open your `.env.local` file and add:

```bash
# Vapi - https://vapi.ai/dashboard
VAPI_API_KEY=your-actual-api-key-here
```

Replace `your-actual-api-key-here` with your actual key from Vapi dashboard.

### Step 3: Restart Dev Server
After adding the key, restart your dev server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## For Production (Vercel)

If deploying to Vercel, add the environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name:** `VAPI_API_KEY`
   - **Value:** Your Vapi API key
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
3. Redeploy your project

## Verify It Works

1. Go to `/sales-training` page
2. Select a scenario
3. Enter your phone number
4. Click "Start Training Call"
5. You should receive a call!

## Troubleshooting

- **"API key not configured"**: Make sure `VAPI_API_KEY` is in `.env.local` and you restarted the server
- **"Invalid API key"**: Double-check you copied the entire key correctly
- **No call received**: Check your phone number format (use +1 for US numbers)

## Need Help?

- Vapi Docs: https://docs.vapi.ai
- Vapi Dashboard: https://vapi.ai/dashboard

