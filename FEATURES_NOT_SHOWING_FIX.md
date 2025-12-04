# 🔍 Why Features Aren't Showing (Even With API Keys Set)

Since you already set up API keys, let's debug why features aren't visible:

## ✅ What Should Be Visible

### 1. **ElevenLabs Floating Button** (Should ALWAYS show)
- **Location**: Bottom-right corner of EVERY page
- **Looks like**: Black circular button with Cursor logo + "Ask AI" badge above it
- **Default agent ID**: `agent_9101kb9t1120fjb84wgcem44dey2` (works even without env vars)

### 2. **VAPI Phone Call Training**
- **Route**: `/sales-training`
- **What you see**: Phone call interface with scenario selection

### 3. **Voice Mode in Roleplay**
- **Route**: `/roleplay/[scenarioId]`
- **Button**: "Voice On" toggle (top-right)

---

## 🔍 Quick Diagnostic Steps

### Step 1: Check if Button Exists
1. Open your live site
2. **Scroll to bottom-right corner**
3. **Look for**: Black circular button with logo
4. If you see it → **Button is there!** Click it to open widget
5. If you DON'T see it → Continue to Step 2

### Step 2: Check Browser Console
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Look for **red errors**
4. Common errors:
   - `Failed to load ElevenLabs widget script` → Script blocked
   - `CSP violation` → Content Security Policy blocking
   - `elevenlabs-convai is not defined` → Script didn't load

### Step 3: Check Network Tab
1. Press **F12** → **Network** tab
2. Refresh page
3. Look for: `@elevenlabs/convai-widget-embed`
4. Status should be **200** (green)
5. If **blocked** or **failed** → CSP or network issue

### Step 4: Check Environment Variables (Client-Side)
1. Open browser console (F12)
2. Run this:
```javascript
console.log('Agent ID:', process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'NOT SET (using default)');
```
3. Should show agent ID or "NOT SET (using default)"

---

## 🐛 Common Issues & Fixes

### Issue 1: Button Not Visible
**Possible causes:**
- CSS z-index issue (button behind other elements)
- Browser zoom level
- Mobile viewport (button might be off-screen)

**Fix:**
- Try scrolling to bottom-right
- Check browser zoom (Ctrl+0 to reset)
- Try different browser

### Issue 2: Script Not Loading
**Possible causes:**
- CSP blocking unpkg.com
- Network/firewall blocking
- Ad blocker

**Fix:**
- Check browser console for CSP errors
- Disable ad blockers
- Check network tab for failed requests

### Issue 3: Widget Not Initializing
**Possible causes:**
- Agent ID invalid
- ElevenLabs API issue
- Custom element not registering

**Fix:**
- Check console for widget errors
- Verify agent ID in Vercel env vars
- Try default agent ID: `agent_9101kb9t1120fjb84wgcem44dey2`

### Issue 4: VAPI Not Working
**Possible causes:**
- `VAPI_API_KEY` not set in Vercel
- API route returning errors

**Fix:**
- Check `/sales-training` page
- Open browser console → Look for API errors
- Verify `VAPI_API_KEY` in Vercel dashboard

---

## 🧪 Test Page

I created a debug page to check everything:

**Visit**: `/debug-features`

This will show:
- ✅ Script loading status
- ✅ Custom element registration
- ✅ Floating button visibility
- ✅ Environment variables
- ✅ API route accessibility
- ✅ Console errors

---

## 📋 Checklist

- [ ] Checked bottom-right corner for floating button
- [ ] Opened browser console (F12)
- [ ] Checked for red errors in console
- [ ] Checked Network tab for failed requests
- [ ] Visited `/debug-features` page
- [ ] Verified env vars in Vercel dashboard
- [ ] Tried different browser
- [ ] Disabled ad blockers
- [ ] Checked `/sales-training` page for VAPI

---

## 🚀 Quick Test

**Test the floating button:**
1. Go to your live site homepage
2. Scroll to bottom-right
3. Look for black circular button
4. Click it → Widget should open

**If button is there but widget doesn't open:**
- Check browser console for errors
- Check Network tab for failed script loads
- Verify CSP headers aren't blocking

**If button is NOT there:**
- Check if `GlobalVoiceAssistant` component is rendering
- Check browser console for React errors
- Verify the component is in `layout.tsx` (it is!)

---

## 💡 Most Likely Issue

Since you already set API keys, the most likely issues are:

1. **Button IS there but you're not seeing it** → Check bottom-right corner carefully
2. **Script blocked by CSP/Ad blocker** → Check browser console
3. **Widget loads but doesn't initialize** → Check console for agent ID errors
4. **Need to redeploy after adding env vars** → Push a new commit or redeploy

**Try this first:**
1. Go to your live site
2. Open browser console (F12)
3. Look at bottom-right corner
4. Tell me what you see (or don't see)!

