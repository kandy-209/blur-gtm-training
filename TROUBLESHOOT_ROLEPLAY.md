# 🔧 Troubleshooting: Roleplay Page Not Loading

## Quick Checks

### 1. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors (red text)
- **Network tab**: Check if API requests are failing
- **Elements tab**: See if HTML is rendering

### 2. Check the Correct URL
Make sure you're using the **latest** deployment URL:
- Latest: https://cursor-gtm-training-n3rwhz68s-andrewkosel93-1443s-projects.vercel.app
- Old: https://cursor-gtm-training-koh0qk6mi-andrewkosel93-1443s-projects.vercel.app

### 3. Common Issues

#### Issue: Blank Page
**Possible causes:**
- JavaScript error preventing render
- API route failing
- Environment variable missing

**Fix:**
1. Open browser console (F12)
2. Check for errors
3. Check Network tab for failed requests

#### Issue: 404 Error
**Possible causes:**
- Scenario ID doesn't exist
- Route not found

**Fix:**
- Verify scenario ID: `SKEPTIC_VPE_001` exists
- Try: `/scenarios` page first to see available scenarios

#### Issue: Page Loads But Nothing Happens
**Possible causes:**
- API routes not responding
- OpenAI API key issue
- Database connection issue

**Fix:**
1. Check browser console for errors
2. Check Network tab - look for `/api/roleplay` requests
3. Verify environment variables in Vercel

## Debug Steps

### Step 1: Check Browser Console
```javascript
// Open DevTools (F12) → Console tab
// Look for any red error messages
```

### Step 2: Check Network Requests
```javascript
// Open DevTools (F12) → Network tab
// Refresh page
// Look for:
// - /api/roleplay (should return 200)
// - Any 500/400 errors
```

### Step 3: Check Vercel Logs
```bash
npx vercel logs cursor-gtm-training-n3rwhz68s-andrewkosel93-1443s-projects.vercel.app
```

### Step 4: Test API Directly
Try calling the API directly:
```bash
curl https://cursor-gtm-training-n3rwhz68s-andrewkosel93-1443s-projects.vercel.app/api/roleplay \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"scenarioInput":{"turn_number":1,"scenario_id":"SKEPTIC_VPE_001","objection_category":"Competitive_Copilot","objection_statement":"test"},"persona":{"name":"Test","currentSolution":"Test","primaryGoal":"Test","skepticism":"Test","tone":"Test"},"conversationHistory":[]}'
```

## Quick Fixes

### Fix 1: Hard Refresh
- **Chrome/Edge**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Firefox**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### Fix 2: Clear Cache
- Open DevTools → Application → Clear Storage → Clear site data

### Fix 3: Try Different Browser
- Test in incognito/private mode
- Try different browser

### Fix 4: Check Latest Deployment
```bash
npx vercel ls
# Use the URL from the most recent deployment
```

## Still Not Working?

1. **Share browser console errors** (screenshot or copy text)
2. **Share network tab errors** (failed requests)
3. **Check Vercel function logs** for API errors

