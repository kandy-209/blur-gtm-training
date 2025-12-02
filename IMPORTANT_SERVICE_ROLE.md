# ⚠️ IMPORTANT: You Need the Service Role Key

## Current Status

✅ **NEXT_PUBLIC_SUPABASE_URL** - Added to Vercel
✅ **SUPABASE_KEY** - Added to Vercel (this is the **anon** key)
⏳ **SUPABASE_SERVICE_ROLE_KEY** - **STILL NEEDED** for database writes

## The Problem

The key you provided (`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) is the **anon/public key**. 

**This key:**
- ✅ Works for client-side reads (with RLS)
- ❌ **Cannot write to database** from server-side API routes
- ❌ **Cannot bypass Row Level Security**

## What You Need

The **service_role key** which:
- ✅ Can write to database from server-side
- ✅ Bypasses Row Level Security
- ✅ Has full database access

## How to Get It

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn

2. **Settings → API**
   - Click **Settings** (gear icon)
   - Click **API**

3. **Find Service Role Key**
   - Scroll to **Project API keys**
   - Find **`service_role`** (NOT `anon`)
   - Click **Reveal**
   - Copy the key

4. **Add to Vercel**
   ```bash
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Paste the service_role key when prompted
   ```

5. **Redeploy**
   ```bash
   npx vercel --prod
   ```

## Why Both Keys?

- **SUPABASE_KEY** (anon): For client-side operations, respects security
- **SUPABASE_SERVICE_ROLE_KEY**: For server-side API routes, needs elevated permissions

## Test After Adding

Once you add the service_role key and redeploy:
1. Visit your site
2. Try a role-play session
3. Check Supabase → Tables → user_responses
4. You should see data being saved!

