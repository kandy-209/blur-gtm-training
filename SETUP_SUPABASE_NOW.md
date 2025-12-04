# 🚀 Supabase Setup - Do This Now!

## ⚡ Quick Setup (Copy & Paste)

### Step 1: Create Supabase Project
1. Go to: **https://supabase.com**
2. Sign up/Login
3. Click **"New Project"**
4. Name: `cursor-gtm-training`
5. Set database password (save it!)
6. Click **"Create"** → Wait 2 minutes

### Step 2: Get Your Keys
1. In Supabase dashboard → **Settings** → **API**
2. Copy these TWO values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string)

### Step 3: Run Database Migration
1. In Supabase → **SQL Editor** → **New Query**
2. Open file: `scripts/create-supabase-tables.sql`
3. Copy ALL the SQL code
4. Paste into SQL Editor
5. Click **"Run"** ✅

### Step 4: Enable Auth
1. Supabase → **Authentication** → **Providers**
2. Enable **Email** provider (toggle ON)
3. Click **"Save"**

### Step 5: Set Environment Variables

**Run this command** (replace with YOUR values):

```bash
cd "/Users/lemonbear/Desktop/Blurred Lines"

cat >> .env.local << 'EOF'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
EOF
```

**OR manually edit `.env.local`** and add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Test It!
```bash
npm run dev
```

Visit: **http://localhost:3000/auth**

Try signing up - it should work! ✅

## ✅ Done!

Your Supabase is now configured!

## 📋 Checklist

- [ ] Created Supabase project
- [ ] Copied Project URL and Anon Key
- [ ] Ran database migration SQL
- [ ] Enabled Email authentication
- [ ] Added env vars to `.env.local`
- [ ] Restarted dev server
- [ ] Tested signup at `/auth`

## 🆘 Need Help?

See `QUICK_SUPABASE_SETUP.md` for detailed instructions!

