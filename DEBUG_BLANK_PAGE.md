# 🐛 Debugging Blank Page Issue

## The Lavender Error is NOT Your Problem

The `beta.trylavender.com` error is from a **browser extension** (Lavender email tool), not your application. This won't cause a blank page.

## Real Debugging Steps

### Step 1: Disable Browser Extensions

The blank page might be caused by a browser extension interfering:

1. **Open Chrome in Incognito Mode** (extensions disabled by default)
   - Or disable extensions: Chrome → Settings → Extensions → Turn off all

2. **Test your site in incognito:**
   https://cursor-gtm-training-1oe34698x-andrewkosel93-1443s-projects.vercel.app/scenarios

### Step 2: Check Browser Console

1. **Open DevTools** (F12)
2. **Console Tab** - Look for:
   - Red error messages
   - React errors
   - JavaScript errors
3. **Share any errors you see**

### Step 3: Check Network Tab

1. **DevTools → Network Tab**
2. **Refresh the page**
3. **Look for:**
   - Failed requests (red)
   - `/api/roleplay` - what status?
   - `/api/analytics/top-responses` - what status?
   - Any 500/400 errors?

### Step 4: Check Elements Tab

1. **DevTools → Elements Tab**
2. **Is there HTML content?**
   - If YES → JavaScript error preventing render
   - If NO → Server-side issue

### Step 5: Test Direct API

Try calling the API directly:

```bash
curl -X POST https://cursor-gtm-training-1oe34698x-andrewkosel93-1443s-projects.vercel.app/api/roleplay \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioInput": {
      "turn_number": 1,
      "scenario_id": "SKEPTIC_VPE_001",
      "objection_category": "Competitive_Copilot",
      "objection_statement": "test"
    },
    "persona": {
      "name": "Test",
      "currentSolution": "Test",
      "primaryGoal": "Test",
      "skepticism": "Test",
      "tone": "Test"
    },
    "conversationHistory": []
  }'
```

## Common Causes

1. **Browser Extension Interference**
   - Solution: Test in incognito

2. **JavaScript Error**
   - Solution: Check console, share errors

3. **API Route Failing**
   - Solution: Check Network tab, check Vercel logs

4. **Missing Environment Variables**
   - Solution: Verify in Vercel dashboard

5. **CORS Issue**
   - Solution: Check middleware.ts

## What to Share

If still blank, please share:

1. **Console errors** (screenshot or copy text)
2. **Network tab** - failed requests
3. **What you see** - completely blank? Loading spinner? Partial content?

## Quick Test

Try this URL directly:
https://cursor-gtm-training-1oe34698x-andrewkosel93-1443s-projects.vercel.app/

Does the home page load? If yes, then try:
https://cursor-gtm-training-1oe34698x-andrewkosel93-1443s-projects.vercel.app/scenarios

Then click "Start Scenario" - does it work?

