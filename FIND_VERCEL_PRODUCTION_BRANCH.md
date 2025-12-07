# 🔍 How to Find Vercel Production Branch Setting

## Where to Look

The Production Branch setting location varies by Vercel UI version. Try these locations:

---

## Location 1: Settings → Git (Most Common)

1. Go to: https://vercel.com/dashboard
2. Click project: **cursor-gtm-training**
3. Click: **Settings** (top menu)
4. Click: **Git** tab (left sidebar)
5. Look for: **Production Branch** dropdown
   - It might be near the top
   - Or scroll down to find it

---

## Location 2: Project Settings → Git

1. Go to: https://vercel.com/dashboard
2. Click project: **cursor-gtm-training**
3. Look for: **Settings** button (top right or in project menu)
4. Click: **Git** section
5. Find: **Production Branch** dropdown

---

## Location 3: Deployments Tab → Settings

1. Go to: https://vercel.com/dashboard
2. Click project: **cursor-gtm-training**
3. Go to: **Deployments** tab
4. Look for: **Settings** icon or gear icon
5. Click it and look for Git/Production Branch settings

---

## If You Still Can't Find It

**Don't worry!** You can force deployment from `main` without changing the setting:

### Option A: Promote Main Deployment (Easiest)

1. Go to: **Deployments** tab
2. Find any deployment that shows **"main"** in the branch column
3. Click **"..."** menu (three dots) on that deployment
4. Click **"Promote to Production"**
5. This forces Vercel to use that deployment for production

### Option B: Use Vercel CLI (Most Reliable)

Deploy directly from command line - this bypasses all settings:

```powershell
cd "c:\Users\Laxmo\Modal Test\cursor-gtm-training"
git checkout main
npx vercel --prod
```

This will deploy `main` branch directly to production, regardless of settings.

---

**Try Option A first - it's the easiest!**

