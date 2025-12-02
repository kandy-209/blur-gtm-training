# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `cursor-gtm-training` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys" → "anon public")

## Step 3: Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `database-migration.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Wait for success message ✅

## Step 4: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider:
   - Toggle "Enable Email provider" to ON
   - Configure email templates (optional)
   - Click "Save"

## Step 5: Set Environment Variables

Create `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To get Service Role Key:**
- Go to Settings → API
- Copy "service_role" key (keep this secret!)

## Step 6: Verify Setup

Run this command to test:

```bash
npm run build
```

If build succeeds, Supabase is configured correctly! ✅

## Step 7: Test Authentication

1. Start dev server: `npm run dev`
2. Go to `/auth` page
3. Try signing up with a test account
4. Check Supabase Dashboard → Authentication → Users
5. You should see your new user! ✅

## Troubleshooting

### "Supabase is not configured" error
- Check `.env.local` file exists
- Verify environment variable names match exactly
- Restart dev server after adding env vars

### Database migration errors
- Make sure you're using SQL Editor (not Table Editor)
- Check for syntax errors in SQL
- Some tables might already exist (that's OK)

### Authentication not working
- Verify Email provider is enabled
- Check email confirmation settings
- Try disabling email confirmation for testing

## Quick Setup Script

If you have your Supabase credentials ready, run:

```bash
# Add your Supabase URL and keys
echo "NEXT_PUBLIC_SUPABASE_URL=your-url-here" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here" >> .env.local
```

Then restart your dev server!

