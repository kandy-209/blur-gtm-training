# 🔧 Restore Working Version - Complete Fix

## Issue

- Phone calls were working a day ago
- Now on wrong version
- Vapi not configured properly in Vercel
- Multiple issues preventing deployment

---

## ✅ Complete Fix Plan

### Step 1: Ensure All Code is on Main Branch

The code is already correct - we just need to ensure:
1. All Vapi code is on `main` branch ✅
2. `VAPI_API_KEY` is set in Vercel ❌ (THIS IS THE ISSUE)
3. Vercel is deploying from `main` ❌ (MIGHT BE WRONG)

---

## 🔧 Immediate Actions

### 1. Check Current Branch
```powershell
git branch --show-current
# Should be: main
```

### 2. Merge Any Working Code from restore-call-analytics
```powershell
git checkout main
git merge restore-call-analytics --no-edit
git push origin main
```

### 3. Add VAPI_API_KEY to Vercel (CRITICAL)

**Go to Vercel Dashboard:**
1. https://vercel.com/dashboard
2. Project: `cursor-gtm-training`
3. Settings → Environment Variables
4. Add: `VAPI_API_KEY` = Your Vapi API key
5. Save

**Get Vapi API Key:**
- Go to: https://vapi.ai/dashboard
- Settings → API Keys
- Copy your API key
- Add it to Vercel

### 4. Fix Vercel Production Branch

**CRITICAL:** Make sure Vercel deploys from `main`:
1. Vercel Dashboard → Settings → Git
2. Production Branch: Should be `main`
3. If it's `restore-call-analytics`, change to `main`
4. Save

### 5. Redeploy

After fixing:
1. Go to Deployments tab
2. Find latest `main` deployment
3. Click "..." → "Promote to Production"
4. OR trigger new deployment by pushing to main

---

## ✅ What Should Work

After these fixes:
- ✅ Phone Training page: `/sales-training`
- ✅ Vapi phone calls working
- ✅ All features deployed from `main`
- ✅ Environment variables configured

---

## 🎯 Summary

**The Real Issues:**
1. ❌ `VAPI_API_KEY` not in Vercel environment variables
2. ❌ Vercel might be deploying from wrong branch
3. ✅ Code is correct (already on main)

**The Fix:**
1. Add `VAPI_API_KEY` to Vercel
2. Ensure Production Branch is `main`
3. Redeploy

---

**This will restore the working version!**
