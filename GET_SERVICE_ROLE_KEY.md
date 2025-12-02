# 🔑 Get Supabase Service Role Key

## ⚠️ Important

The key you provided is the **anon/public key**. For server-side database operations, you need the **service_role key** which has elevated permissions.

## How to Get Service Role Key

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `dxgjaznmtsgvxnfnzhbn`

2. **Navigate to API Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **API** in the settings menu

3. **Find Service Role Key**
   - Scroll down to **Project API keys**
   - Look for **`service_role`** key (NOT the `anon` key)
   - Click **Reveal** to show it
   - ⚠️ **Keep this secret!** It has full database access

4. **Add to Vercel**
   ```bash
   # Add service_role key
   npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
   # Paste the service_role key when prompted
   ```

## Current Setup

✅ **NEXT_PUBLIC_SUPABASE_URL** - Added
✅ **SUPABASE_KEY** - Added (anon key - for client-side)
⏳ **SUPABASE_SERVICE_ROLE_KEY** - Need to add (for server-side)

## Why Two Keys?

- **anon key** (`SUPABASE_KEY`): Public key for client-side operations, respects Row Level Security
- **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`): Private key for server-side operations, bypasses RLS

For your API routes to write to the database, you need the service_role key.

## After Adding Service Role Key

1. Redeploy:
   ```bash
   npx vercel --prod
   ```

2. Test database functionality
3. Check Supabase dashboard → Tables → user_responses (should see data)

