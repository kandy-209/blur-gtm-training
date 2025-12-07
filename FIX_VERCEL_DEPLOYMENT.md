# 🔧 Fix Vercel Deployment - Wrong Branch & Domain

## Issue Identified

**Vercel is deploying from the WRONG branch:**
- ❌ Currently deploying: `restore-call-analytics` (commit 931b12f)
- ✅ Should deploy: `main` branch
- ❌ Deploying to: Preview URL (cursor-gtm-training-git-res-9a9630...)
- ✅ Should deploy to: `howtosellcursor.me` (production)

---

## 🔧 THE FIX (3 Steps)

### Step 1: Fix Production Branch in Vercel

**CRITICAL:** Change Vercel to deploy from `main` branch:

1. Go to: https://vercel.com/dashboard
2. Click project: **cursor-gtm-training**
3. Go to: **Settings** → **Git**
4. Find: **Production Branch**
5. **Change it from `restore-call-analytics` to `main`**
6. Click **Save**

### Step 2: Verify Domain Configuration

1. Still in Vercel Settings
2. Go to: **Domains** tab
3. Verify `howtosellcursor.me` is listed
4. If not, add it:
   - Click **"Add Domain"**
   - Enter: `howtosellcursor.me`
   - Click **Add**

### Step 3: Promote Main Branch Deployment

1. Go to **Deployments** tab
2. Find the latest deployment from `main` branch
3. Click **"..."** menu on that deployment
4. Click **"Promote to Production"**
5. Wait 2-3 minutes

---

## ✅ What Should Happen

After fixing:
- ✅ Vercel deploys from `main` branch automatically
- ✅ Production domain: `howtosellcursor.me`
- ✅ All your latest code (phone calls, sales training) will be live

---

## 🎯 Quick Checklist

- [ ] Changed Production Branch to `main` in Vercel Settings → Git
- [ ] Verified `howtosellcursor.me` is in Domains
- [ ] Promoted latest `main` deployment to Production
- [ ] Waited 2-3 minutes for deployment
- [ ] Tested: https://howtosellcursor.me/sales-training

---

## ⚠️ Why This Happened

Vercel was configured to deploy from `restore-call-analytics` branch instead of `main`. This is why:
- Old code is showing
- Phone training features aren't visible
- Wrong deployment URL

**Fix the Production Branch setting and everything will work!**

