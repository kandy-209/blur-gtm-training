# 🚨 URGENT: Fix Vercel Production Branch

## The Problem

**Vercel is deploying from the WRONG branch:**
- ❌ Currently: `restore-call-analytics` (commit 931b12f)
- ✅ Should be: `main` branch
- ❌ Deploying to: Preview URL (not production)
- ✅ Should deploy to: `howtosellcursor.me`

---

## 🔧 THE FIX (Do This Now)

### Step 1: Change Production Branch in Vercel

1. **Go to:** https://vercel.com/dashboard
2. **Click:** Project `cursor-gtm-training`
3. **Go to:** **Settings** → **Git** tab
4. **Find:** **Production Branch** dropdown
5. **Change it:** From `restore-call-analytics` → To `main`
6. **Click:** **Save**

**This is the CRITICAL fix!**

### Step 2: Verify Domain

1. Still in Vercel Settings
2. Go to: **Domains** tab
3. Check: `howtosellcursor.me` should be listed
4. If missing, add it:
   - Click **"Add Domain"**
   - Enter: `howtosellcursor.me`
   - Click **Add**

### Step 3: Promote Main Deployment

1. Go to **Deployments** tab
2. Find the **latest deployment from `main` branch**
3. Click **"..."** menu on that deployment
4. Click **"Promote to Production"**
5. Wait 2-3 minutes

---

## ✅ After Fixing

- ✅ Vercel will auto-deploy from `main` branch
- ✅ Production domain: `howtosellcursor.me`
- ✅ All your latest code will be live
- ✅ Phone training will work

---

## 🎯 Quick Checklist

- [ ] Changed Production Branch to `main` in Vercel Settings → Git
- [ ] Verified `howtosellcursor.me` is in Domains
- [ ] Promoted latest `main` deployment to Production
- [ ] Tested: https://howtosellcursor.me/sales-training

---

**The code is already on `main` branch and pushed to GitHub.**

**You just need to change Vercel's Production Branch setting from `restore-call-analytics` to `main`.**

