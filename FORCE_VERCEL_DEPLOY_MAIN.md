# 🚀 Force Vercel to Deploy from Main Branch

## If Changing Production Branch Didn't Work

Sometimes Vercel needs a manual push or redeploy to recognize the branch change.

---

## Option 1: Trigger New Deployment via Push

I've pushed a new commit to `main` branch. This should trigger Vercel to deploy automatically.

**Check Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Click project: `cursor-gtm-training`
3. Go to: **Deployments** tab
4. Look for latest deployment from `main` branch
5. If it's building, wait 2-3 minutes

---

## Option 2: Manual Redeploy from Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click project: `cursor-gtm-training`
3. Go to: **Deployments** tab
4. Find the **latest deployment from `main` branch**
5. Click **"..."** menu on that deployment
6. Click **"Redeploy"**
7. Wait 2-3 minutes

---

## Option 3: Verify Production Branch Setting

Double-check the setting was saved:

1. Go to: https://vercel.com/dashboard
2. Click project: `cursor-gtm-training`
3. Go to: **Settings** → **Git** tab
4. Check: **Production Branch** dropdown
5. Should show: `main` (not `restore-call-analytics`)
6. If it's still `restore-call-analytics`, change it again and save

---

## Option 4: Use Vercel CLI to Deploy

If dashboard isn't working, deploy directly:

```powershell
cd "c:\Users\Laxmo\Modal Test\cursor-gtm-training"
npx vercel --prod
```

This will deploy the current branch directly to production.

---

## Verify It's Working

After deployment completes:

1. Check deployment URL shows `main` branch
2. Visit: https://howtosellcursor.me
3. Test: `/sales-training` page
4. Verify phone call features work

---

**Try Option 2 (Manual Redeploy) first - that usually works!**
