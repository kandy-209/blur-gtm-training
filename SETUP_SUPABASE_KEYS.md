# 🔑 Quick Supabase Setup Guide

## Current Status

You need to add **3 Supabase keys** to get the app working.

---

## 🚀 Quick Setup (Choose One Method)

### Method 1: Automated Script (Recommended)

**If PowerShell works:**
```bash
npm run api-keys:supabase
```

**If PowerShell doesn't work, use Command Prompt:**
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. Run:
   ```cmd
   cd /d "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   npm run api-keys:supabase
   ```

This will:
- Open Supabase dashboard in your browser
- Guide you to get the 3 keys
- Save them automatically to `.env.local`

---

### Method 2: Manual Setup (Fastest)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/_/settings/api
   - Or: https://supabase.com/dashboard → Your Project → Settings → API

2. **Copy these 3 values:**
   - **Project URL** (under "Project URL")
     - Format: `https://xxxxx.supabase.co`
     - Copy to: `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   
   - **anon/public key** (under "Project API keys")
     - This is the "anon" or "public" key
     - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
     - Copy to: `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   
   - **service_role key** (same section, click "Reveal")
     - ⚠️ **KEEP THIS SECRET!** Never commit to Git.
     - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
     - Copy to: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

3. **Edit `.env.local`:**
   - Open `.env.local` in your editor
   - Replace the placeholder values:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
     ```
   - With your actual values from Supabase

---

## ✅ After Setup

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Check status:**
   ```bash
   npm run api-keys:check
   ```

3. **Verify it works:**
   - Visit: http://localhost:3000
   - App should connect to Supabase now

---

## 🔧 Don't Have a Supabase Project?

1. **Create one:**
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created (~2 minutes)

2. **Get your keys:**
   - Go to: Settings → API
   - Copy the 3 keys as described above

---

## 📋 What Each Key Does

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (public, safe to expose)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public/anonymous key (safe to expose, has RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key (⚠️ SECRET - bypasses RLS, server-side only)

---

**Once Supabase keys are set, your app will be functional!** 🎉

