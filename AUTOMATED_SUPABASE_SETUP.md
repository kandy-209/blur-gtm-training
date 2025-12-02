# 🤖 Automated Supabase Setup Guide

I've prepared everything for you! Here's what's ready:

## ✅ What I've Done For You

1. ✅ Created complete database migration SQL
2. ✅ Created setup scripts and guides
3. ✅ Created environment variable templates
4. ✅ Added verification scripts

## 🚀 What You Need To Do (5 minutes)

### Option 1: Interactive Setup (Easiest)

```bash
npm run setup:supabase
```

This will:
- Ask for your Supabase credentials
- Create `.env.local` file automatically
- Guide you through the rest

### Option 2: Manual Setup

**Step 1: Create Supabase Project**
1. Go to: https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Name: `cursor-gtm-training`
5. Set password → Create

**Step 2: Get Credentials**
1. Settings → API
2. Copy:
   - Project URL
   - anon public key

**Step 3: Run Setup Script**
```bash
npm run setup:supabase
```
Enter your credentials when prompted.

**Step 4: Run Database Migration**
1. Supabase Dashboard → SQL Editor
2. New Query
3. Copy ALL from: `scripts/create-supabase-tables.sql`
4. Paste → Run ✅

**Step 5: Enable Auth**
1. Authentication → Providers
2. Enable Email → Save

**Step 6: Verify**
```bash
npm run verify:supabase
```

## 📋 Quick Commands

```bash
# Interactive setup
npm run setup:supabase

# Verify configuration
npm run verify:supabase

# Check what's configured
cat .env.local | grep SUPABASE
```

## 🎯 All Files Ready

- ✅ `scripts/create-supabase-tables.sql` - Database migration
- ✅ `scripts/setup-supabase.sh` - Interactive setup
- ✅ `scripts/verify-supabase-setup.js` - Verification
- ✅ `SETUP_SUPABASE_NOW.md` - Quick guide
- ✅ `QUICK_SUPABASE_SETUP.md` - Detailed guide

## ⚡ Fastest Path

1. **Create Supabase project** (2 min): https://supabase.com
2. **Run setup script** (1 min): `npm run setup:supabase`
3. **Run migration** (1 min): Copy SQL → Supabase SQL Editor → Run
4. **Enable auth** (30 sec): Authentication → Providers → Email ON
5. **Test** (30 sec): `npm run dev` → Visit `/auth`

**Total time: ~5 minutes!**

## 🆘 Need Help?

Run verification to see what's missing:
```bash
npm run verify:supabase
```

This will tell you exactly what still needs to be done!

