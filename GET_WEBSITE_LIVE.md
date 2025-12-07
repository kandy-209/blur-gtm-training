# 🚀 Get Your Website Live - Complete Guide

## What We're Deploying

All the changes we've been working on:
- ✅ Phone Training page (`/sales-training`)
- ✅ Phone Training navigation link
- ✅ Bug fixes in PowerShell scripts
- ✅ All recent improvements

---

## Quick Deploy (Run This Now)

```powershell
.\DEPLOY_EVERYTHING_NOW.ps1
```

This script will:
1. ✅ Switch to `main` branch (if needed)
2. ✅ Stage all changes
3. ✅ Commit everything
4. ✅ Push to GitHub
5. ✅ Trigger Vercel auto-deploy

---

## Manual Deploy Steps

If the script doesn't work, do this manually:

### Step 1: Make sure you're on main branch
```powershell
git checkout main
```

### Step 2: Add all changes
```powershell
git add -A
```

### Step 3: Commit
```powershell
git commit -m "Deploy all latest changes: phone training, bug fixes, and improvements"
```

### Step 4: Push to GitHub
```powershell
git push origin main
```

### Step 5: Wait for Vercel
- Wait 2-3 minutes
- Check: https://vercel.com/dashboard
- Look for latest deployment

---

## Verify It's Live

After 2-3 minutes:

1. **Visit**: https://howtosellcursor.me/
2. **Hard refresh**: `Ctrl + F5` (clears cache)
3. **Check navigation**: Look for "Phone Training" link
4. **Direct access**: Visit https://howtosellcursor.me/sales-training

---

## If Still Not Working

### Check 1: Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Click your project
- Check "Deployments" tab
- Look for latest deployment status

### Check 2: Force Redeploy
1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click "..." on latest deployment
5. Click "Redeploy"

### Check 3: Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Or use incognito/private window

### Check 4: Check Branch
Make sure Vercel is deploying from `main`:
1. Vercel Dashboard → Settings → Git
2. Production Branch should be `main` or `master`

---

## What Should Be Live

After deployment, you should see:

### Navigation Menu:
- ✅ Scenarios
- ✅ **Phone Training** ← NEW!
- ✅ Features
- ✅ Analytics
- ✅ Live Role-Play
- ✅ Leaderboard

### Pages:
- ✅ `/sales-training` - Phone call training page
- ✅ `/live-call-dashboard` - Live call metrics

### Features:
- ✅ Phone training interface
- ✅ Call initiation
- ✅ Real-time metrics
- ✅ All bug fixes applied

---

## Troubleshooting

### Issue: "Phone Training" not in navigation
**Fix**: Hard refresh (`Ctrl + F5`) or clear cache

### Issue: Page shows 404
**Fix**: Check Vercel deployment logs for build errors

### Issue: Still showing old version
**Fix**: 
1. Check Vercel dashboard - is deployment complete?
2. Wait 5 minutes (sometimes takes longer)
3. Try incognito window
4. Force redeploy in Vercel

---

## Quick Commands

```powershell
# Check current branch
git branch --show-current

# Check if changes are pushed
git log origin/main..HEAD --oneline

# Force push (if needed)
git push origin main --force

# Deploy via Vercel CLI
npx vercel --prod
```

---

**Run `.\DEPLOY_EVERYTHING_NOW.ps1` now to deploy everything!** 🚀
