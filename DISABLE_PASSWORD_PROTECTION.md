# 🔓 Disable Password Protection

## The Problem

Your deployment has **password protection enabled**, which is why you see a blank/authentication page instead of your site.

## Solution: Disable Password Protection

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click on your project: **cursor-gtm-training**

2. **Disable Protection**
   - Go to **Settings** → **Deployment Protection**
   - Find **Password Protection** section
   - Click **Disable** or toggle it off
   - Save changes

3. **Redeploy** (if needed)
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**

### Option 2: Vercel CLI

```bash
# Check current protection settings
npx vercel project ls

# Disable password protection
# (This might require project settings access)
```

### Option 3: Check Project Settings

The password protection might be set at the project level:

1. Go to: https://vercel.com/dashboard
2. Click **cursor-gtm-training** project
3. **Settings** → **Deployment Protection**
4. Look for:
   - Password Protection
   - Vercel Authentication
   - Preview Protection
5. **Disable** any enabled protections

## After Disabling

1. **Wait 1-2 minutes** for changes to propagate
2. **Visit your site** again
3. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Alternative: Use the Password

If you want to keep protection but access the site:

1. Go to **Settings** → **Deployment Protection**
2. Copy the **password** or **bypass token**
3. Use it when prompted

## Quick Test

After disabling protection, try:
https://cursor-gtm-training-1oe34698x-andrewkosel93-1443s-projects.vercel.app/scenarios

You should see the scenarios page without authentication!

