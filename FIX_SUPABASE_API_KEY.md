# 🔧 Fix Supabase API Key Error

## Problem

You're seeing this error:
```
Leaderboard ratings error: {
  message: 'Invalid API key',
  hint: 'Double check your Supabase `anon` or `service_role` API key.'
}
```

## Root Cause

The leaderboard and ratings API routes were using the **anon key** from `@/lib/auth`, which may be invalid or doesn't have the right permissions for server-side operations.

## Solution Applied

✅ **Updated API routes** to use `SUPABASE_SERVICE_ROLE_KEY` (preferred) or fall back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

✅ **Added better error logging** to help diagnose API key issues

✅ **Files updated:**
- `src/app/api/leaderboard/route.ts`
- `src/app/api/ratings/route.ts`

## What You Need to Do

### Option 1: Add Service Role Key (Recommended)

1. **Get Service Role Key from Supabase:**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Settings → API
   - Find **`service_role`** key (NOT anon)
   - Click **Reveal** and copy it

2. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `SUPABASE_SERVICE_ROLE_KEY` = `[your-service-role-key]`
   - Make sure it's set for **Production**, **Preview**, and **Development**

3. **Redeploy:**
   - Vercel will auto-redeploy, or trigger a new deployment

### Option 2: Verify Anon Key

If you want to use the anon key:

1. **Check Vercel Environment Variables:**
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is set correctly

2. **Verify Keys Match:**
   - Go to Supabase Dashboard → Settings → API
   - Compare the keys in Vercel with the keys in Supabase
   - Make sure they match exactly

## Why Service Role Key?

- ✅ **Bypasses Row Level Security** - Can read/write all data
- ✅ **Server-side operations** - Perfect for API routes
- ✅ **More reliable** - No RLS policy issues

## Testing

After adding the service role key and redeploying:

1. Visit `/leaderboard` page
2. Check browser console - should see no errors
3. Check server logs - should see no "Invalid API key" errors

## Current Status

✅ Code updated to use service_role key
⏳ **You need to add `SUPABASE_SERVICE_ROLE_KEY` to Vercel**

---

**The code is ready - just add the environment variable!** 🚀

