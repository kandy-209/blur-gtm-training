# 🔄 Sync Vercel Environment Variables to Local

## ✅ Good News!

Since Supabase is already connected to Vercel, your keys are configured there. You just need to copy them to your local `.env.local` file for development.

---

## 🚀 Quick Sync

### Option 1: Automated Script
```bash
npm run api-keys:sync-vercel
```

This will:
1. Guide you to get keys from Vercel Dashboard
2. Let you paste them in
3. Save to `.env.local` automatically

### Option 2: Manual Copy

1. **Get Keys from Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select project: **cursor-gtm-training**
   - Go to: **Settings** → **Environment Variables**
   - Find these 3 variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. **Copy to `.env.local`:**
   - Open `.env.local` in your editor
   - Replace the placeholder values with your Vercel values:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

---

## ✅ After Syncing

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Verify connection:**
   ```bash
   npm run api-keys:check
   ```

3. **Test the app:**
   - Visit: http://localhost:3000
   - Should connect to Supabase successfully

---

## 📋 What's Already Configured in Vercel

Since Supabase is connected to Vercel, you should have:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

These work in production automatically. You just need them locally for development!

---

**Quick command: `npm run api-keys:sync-vercel`** 🚀

