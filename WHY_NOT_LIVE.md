# 🔴 Why VAPI/ElevenLabs Features Aren't Showing Live

## The Problem

Your features are **coded and deployed**, but they're **hidden** because **environment variables are missing** in Vercel.

## What's Missing

### 1. **ElevenLabs Voice Features** (Floating Widget + Voice Mode)

**Required Variables:**
- `ELEVENLABS_API_KEY` - For text-to-speech
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - For conversational AI widget
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` - Optional (has default)

**Where they should appear:**
- ✅ Floating voice button (bottom-right) on ALL pages
- ✅ "Voice On" toggle in roleplay scenarios
- ✅ Auto-play audio for AI responses

**Current Status:** ❌ **NOT VISIBLE** - Missing env vars

---

### 2. **VAPI Phone Call Training**

**Required Variables:**
- `VAPI_API_KEY` - For phone call API

**Where it should appear:**
- ✅ `/sales-training` page
- ✅ Phone call interface with scenario selection

**Current Status:** ❌ **NOT VISIBLE** - Missing env vars

---

## Quick Fix (5 Minutes)

### Step 1: Get Your API Keys

#### ElevenLabs:
1. Go to: https://elevenlabs.io/app/settings/api-keys
2. Copy your API key
3. Go to: https://elevenlabs.io/app/convai
4. Create an agent → Copy Agent ID

#### VAPI:
1. Go to: https://vapi.ai/dashboard
2. Get your API key

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click your project**: `cursor-gtm-training`
3. **Settings** → **Environment Variables**
4. **Add these:**

```
ELEVENLABS_API_KEY=your_elevenlabs_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
VAPI_API_KEY=your_vapi_key_here
```

5. **Select environments**: ✅ Production ✅ Preview ✅ Development
6. **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**

**OR** push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

---

## Verify It Works

After redeploying, check:

1. **ElevenLabs Widget**: 
   - Look for floating button (bottom-right corner)
   - Should appear on ALL pages

2. **Voice Mode**:
   - Go to any roleplay scenario: `/roleplay/[scenarioId]`
   - Click "Voice On" button (top-right)
   - AI responses should play audio

3. **Phone Calls**:
   - Go to: `/sales-training`
   - Should see phone call interface

---

## Check Current Status

Run this in your browser console on the live site:

```javascript
// Check what's loaded
console.log('ElevenLabs Agent:', process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '❌ NOT SET');
console.log('ElevenLabs API:', process.env.ELEVENLABS_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('VAPI API:', process.env.VAPI_API_KEY ? '✅ SET' : '❌ NOT SET');
```

---

## Why Components Hide Themselves

The code checks for env vars and **hides features** if they're missing:

- `GlobalVoiceAssistant` - Only shows if `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` exists
- `PhoneCallTraining` - Shows error if `VAPI_API_KEY` missing
- `RoleplayEngine` voice mode - Only works if `ELEVENLABS_API_KEY` exists

This is **by design** to prevent errors, but it means features won't show until env vars are set!

---

## Summary

✅ **Code is deployed**  
✅ **Components exist**  
❌ **Environment variables missing**  
❌ **Features hidden until env vars added**

**Fix:** Add env vars → Redeploy → Features appear! 🚀

