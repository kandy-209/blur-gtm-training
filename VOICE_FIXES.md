# Voice Feature Fixes

## Issues Fixed

1. ✅ **Double-loading ElevenLabs widget** - Removed duplicate script from layout.tsx
2. ✅ **Microphone permissions** - Updated Permissions-Policy to allow microphone
3. ✅ **CSP headers** - Added ElevenLabs domains to Content-Security-Policy
4. ✅ **Widget registration** - Added check to prevent re-registering custom element

## Environment Variables Needed

Make sure these are set in Vercel:

- `ELEVENLABS_API_KEY` - Required for TTS API
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - For Conversational AI widget (optional, has default)
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` - For TTS voice (optional, has default)

## Testing Voice Features

1. **Text-to-Speech (TTS)**: Should work when AI responds
2. **Voice Recording**: Click microphone button to record
3. **ElevenLabs Widget**: Click the floating voice button (bottom right)

## If Voice Still Doesn't Work

1. Check browser console for errors
2. Verify `ELEVENLABS_API_KEY` is set in Vercel
3. Check microphone permissions in browser settings
4. Try in incognito mode to rule out extensions

