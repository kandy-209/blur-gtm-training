# ⚡ Quick Supabase Setup (5 minutes)

## 🎯 Step-by-Step Guide

### 1. Create Supabase Account & Project (2 min)

1. Go to **[supabase.com](https://supabase.com)** and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `cursor-gtm-training`
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for project to initialize

### 2. Get Your Credentials (1 min)

Once project is ready:

1. Click **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

### 3. Run Database Migration (1 min)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `scripts/create-supabase-tables.sql` in your project
4. Copy **ALL** the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for ✅ "Success" message

### 4. Enable Authentication (30 sec)

1. Click **Authentication** (left sidebar)
2. Click **Providers**
3. Find **Email** provider
4. Toggle **"Enable Email provider"** to ON
5. Click **"Save"**

### 5. Set Environment Variables (30 sec)

**Option A: Use Setup Script**
```bash
cd "/Users/lemonbear/Desktop/Blurred Lines"
bash scripts/setup-supabase.sh
```

**Option B: Manual Setup**
Create `.env.local` file in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Test It! (30 sec)

```bash
npm run dev
```

Then visit: `http://localhost:3000/auth`

Try signing up - you should see your user in Supabase Dashboard → Authentication → Users!

## ✅ Done!

Your Supabase is now configured! 🎉

## 🔍 Verify Everything Works

1. **Database Tables**: Go to Table Editor → Should see 4 tables
2. **Authentication**: Try signing up at `/auth`
3. **RLS Policies**: Check Settings → Authentication → Policies

## 🆘 Troubleshooting

**"Supabase is not configured" error:**
- Check `.env.local` file exists
- Restart dev server: `npm run dev`
- Verify variable names match exactly

**Database migration errors:**
- Make sure you're in SQL Editor (not Table Editor)
- Some tables might already exist (that's OK, they'll be skipped)

**Can't sign up:**
- Check Email provider is enabled
- Try disabling "Confirm email" in Auth settings for testing

## 📚 Need Help?

- Supabase Docs: https://supabase.com/docs
- Check `SUPABASE_SETUP.md` for detailed guide

