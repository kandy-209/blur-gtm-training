# 🔍 Why VAPI/ElevenLabs Features Aren't Showing Live

## Quick Diagnosis

The features are **implemented** but may not be visible because:

### 1. **Missing Environment Variables in Vercel**

These need to be set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

#### Required for ElevenLabs Voice Features:
- ✅ `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- ✅ `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - Your ElevenLabs agent ID (for conversational AI widget)
- ✅ `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` - Voice ID for TTS (optional, has default)

#### Required for VAPI Phone Calls:
- ✅ `VAPI_API_KEY` - Your VAPI API key
- ✅ `MODAL_FUNCTION_URL` - URL for call analysis (optional)

### 2. **Where to Find These Features**

#### ElevenLabs Features:
- **Voice Assistant Widget**: Floating button (bottom-right) on any page
- **Voice Mode in Roleplay**: Toggle "Voice On" button in roleplay scenarios
- **TTS Audio**: Auto-plays AI responses when voice mode is enabled

#### VAPI Phone Call Training:
- **Route**: `/sales-training`
- **Component**: `PhoneCallTraining` component
- **What it does**: Initiates real phone calls via VAPI

### 3. **Check if Features are Loaded**

Run this in browser console on your live site:
```javascript
// Check ElevenLabs
console.log('ElevenLabs Agent ID:', process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'NOT SET');
console.log('ElevenLabs API Key:', process.env.ELEVENLABS_API_KEY ? 'SET' : 'NOT SET');

// Check VAPI
console.log('VAPI API Key:', process.env.VAPI_API_KEY ? 'SET' : 'NOT SET');
```

### 4. **Components That Need Env Vars**

#### `GlobalVoiceAssistant` (floating widget)
- Needs: `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- Location: `src/components/GlobalVoiceAssistant.tsx`
- Where shown: Bottom-right corner on all pages

#### `PhoneCallTraining` (phone calls)
- Needs: `VAPI_API_KEY`
- Location: `src/app/sales-training/page.tsx`
- Where shown: `/sales-training` route

#### `RoleplayEngine` (voice mode)
- Needs: `ELEVENLABS_API_KEY` for TTS
- Location: `src/components/RoleplayEngine.tsx`
- Where shown: `/roleplay/[scenarioId]` routes

### 5. **Quick Fix Steps**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `cursor-gtm-training`
3. **Settings** → **Environment Variables**
4. **Add these variables**:
   ```
   ELEVENLABS_API_KEY=your_key_here
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
   VAPI_API_KEY=your_vapi_key_here
   ```
5. **Redeploy**: Go to **Deployments** → Click **...** → **Redeploy**

### 6. **Verify Features Work**

After redeploying:

1. **ElevenLabs Widget**: Look for floating voice button (bottom-right)
2. **Voice Mode**: Go to any roleplay scenario → Click "Voice On"
3. **Phone Calls**: Go to `/sales-training` → Should see phone call interface

### 7. **If Still Not Working**

Check browser console for errors:
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

Common issues:
- ❌ `ELEVENLABS_API_KEY is not defined` → Add to Vercel env vars
- ❌ `VAPI_API_KEY is not defined` → Add to Vercel env vars
- ❌ CORS errors → Check CSP headers in `layout.tsx`
- ❌ Widget not loading → Check ElevenLabs script in `layout.tsx`

---

## Get Your API Keys

### ElevenLabs:
1. Sign up: https://elevenlabs.io
2. Dashboard → Profile → API Key
3. Dashboard → Agents → Create Agent → Copy Agent ID

### VAPI:
1. Sign up: https://vapi.ai
2. Dashboard → API Keys → Create Key
3. Copy the key

---

**After adding env vars, redeploy and features should appear!** 🚀

