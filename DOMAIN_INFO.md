# 🌐 Domain Information

## Your Production URL

**Main Production Domain:**
```
https://cursor-gtm-training.vercel.app
```

This is your **clean, shareable URL** - no username in it!

## Understanding Vercel URLs

### Main Production Domain (Use This!)
- **URL**: `https://cursor-gtm-training.vercel.app`
- **Purpose**: Your main production site
- **Always points to**: Latest production deployment
- **Share this URL** with users

### Individual Deployment URLs (Don't Share)
- **Format**: `https://cursor-gtm-training-[hash]-andrewkosel93-1443s-projects.vercel.app`
- **Purpose**: Specific deployment instances
- **Contains**: Your username (`andrewkosel93`) and deployment hash
- **Use**: Only for testing specific deployments

## Why the Difference?

- **Main domain** (`cursor-gtm-training.vercel.app`): Always points to your latest production deployment
- **Deployment URLs**: Specific instances for debugging/testing

## Custom Domain Setup (Optional)

If you want a completely custom domain (e.g., `gtm-training.com`):

### Via Vercel Dashboard:
1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `gtm-training.com`)
4. Follow DNS configuration instructions
5. Add DNS records at your domain registrar

### Via CLI:
```bash
npx vercel domains add yourdomain.com
```

### DNS Configuration:
- **CNAME**: `yourdomain.com` → `cname.vercel-dns.com`
- Or **A records**: Point to Vercel IPs (see dashboard)

## Current Status

✅ **Main domain active**: `https://cursor-gtm-training.vercel.app`
✅ **All deployments working**
✅ **Environment variables configured**

## Quick Links

- **Production Site**: https://cursor-gtm-training.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/dashboard/[your-project]/settings

