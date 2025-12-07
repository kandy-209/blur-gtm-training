# 🔧 Troubleshooting Test Page Issues

## Common Issues & Fixes

### Issue: Page Won't Load / Blank Page

**Possible Causes:**
1. Module import errors
2. Missing dependencies
3. TypeScript compilation errors
4. Browser compatibility

**Solutions:**

1. **Check Browser Console (F12)**
   - Look for red error messages
   - Share the exact error text

2. **Check Terminal/Dev Server**
   - Look for compilation errors
   - Check if Next.js dev server is running

3. **Clear Cache & Rebuild**
   ```bash
   # Stop dev server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

4. **Check Imports**
   - Verify all files exist in `src/lib/voice-coaching/`
   - Check `src/components/ui/` components exist

---

### Issue: "Failed to load voice coaching modules"

**Fix:**
1. Check that all files exist:
   ```bash
   ls src/lib/voice-coaching/
   ```
   Should show: audio-analyzer.ts, coaching-engine.ts, etc.

2. Check for TypeScript errors:
   ```bash
   npm run typecheck
   ```

3. Restart dev server:
   ```bash
   npm run dev
   ```

---

### Issue: Microphone Permission Denied

**Fix:**
1. Click lock icon in browser address bar
2. Set Microphone to "Allow"
3. Refresh page
4. Try again

See `MICROPHONE_PERMISSIONS_GUIDE.md` for detailed steps.

---

### Issue: API Endpoints Failing

**Check:**
1. Is Supabase configured?
   - Check `.env.local` for:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. Are database tables created?
   - Run migration: `scripts/create-elevenlabs-advanced-features-tables.sql`

3. Check Network tab (F12):
   - Look for `/api/voice-coaching/*` requests
   - Check response status codes

---

### Issue: TypeScript Errors

**Fix:**
```bash
npm run typecheck
```

Fix any errors shown, then restart dev server.

---

### Issue: Module Not Found

**Check:**
1. File exists: `src/lib/voice-coaching/index.ts`
2. Exports are correct
3. Import path is correct: `@/lib/voice-coaching`

**Fix:**
- Verify all files in `src/lib/voice-coaching/` exist
- Check `tsconfig.json` paths are correct

---

## Quick Diagnostic Steps

1. **Open Browser Console (F12)**
   - Check for errors
   - Note exact error messages

2. **Check Terminal**
   - Look for compilation errors
   - Check if dev server is running

3. **Verify Files Exist**
   ```bash
   # Check core files
   Test-Path src/lib/voice-coaching/audio-analyzer.ts
   Test-Path src/app/test/voice-coaching/page.tsx
   Test-Path src/app/api/voice-coaching/metrics/route.ts
   ```

4. **Test API Directly**
   ```bash
   curl http://localhost:3000/api/voice-coaching/metrics?conversationId=test
   ```

---

## Still Having Issues?

**Share:**
1. Browser console errors (F12 → Console)
2. Terminal/Dev server errors
3. Network tab errors (F12 → Network)
4. What happens when you click "Start Analysis"

**Common Error Messages:**
- "Cannot find module" → Check file paths
- "TypeError" → Check browser compatibility
- "Permission denied" → Check microphone permissions
- "500 Internal Server Error" → Check API routes and database

---

## Error Boundary

The page now has an error boundary that will catch React errors and show a helpful message. If you see the error boundary, check the browser console for the actual error details.

