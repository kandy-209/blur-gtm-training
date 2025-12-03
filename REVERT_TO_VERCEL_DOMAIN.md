# 🔄 Revert to Vercel App Domain

## How to Remove Custom Domain and Use Vercel App Domain

---

## 📝 Steps to Revert

### Step 1: Remove Custom Domain in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project: **cursor-gtm-training**
3. Go to **Settings** → **Domains**
4. Find `cursorsalestrainer.com` in the list
5. Click the **three dots** (⋯) next to it
6. Click **Remove** or **Delete**
7. Confirm removal

### Step 2: Your Vercel App Domain

After removing the custom domain, your site will be accessible at:

**Original Vercel domain:**
```
https://cursor-gtm-training-git-main-andrewkosel93-1443s-projects.vercel.app
```

Or if you have a production domain:
```
https://cursor-gtm-training.vercel.app
```

---

## ✅ What Happens

- ✅ Custom domain removed from Vercel
- ✅ Site accessible on Vercel app domain
- ✅ No DNS configuration needed
- ✅ SSL works automatically on Vercel domain

---

## 🔍 Find Your Vercel Domain

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click on the latest deployment
5. The domain is shown at the top

Or check:
- **Settings** → **Domains** → Look for `.vercel.app` domains

---

## 📋 Optional: Keep Cloudflare DNS (No Action Needed)

If you want to keep Cloudflare DNS configured but not use it:
- **No action needed** - Just don't point DNS to Vercel
- Cloudflare DNS records can stay (they won't affect anything)
- Your site will work on Vercel domain regardless

---

## 🎯 Quick Summary

1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Remove** `cursorsalestrainer.com`
3. **Done!** Site works on Vercel app domain

Your site will continue working on the Vercel domain immediately! 🚀

