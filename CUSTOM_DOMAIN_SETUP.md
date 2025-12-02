# 🌐 Custom Domain Setup Guide

## Setting up `cursor-gtm-enablement-trainer.com` on Vercel

### Step 1: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **cursor-gtm-training**

2. **Navigate to Domains**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**

3. **Enter Your Domain**
   - Enter: `cursor-gtm-enablement-trainer.com`
   - Click **Add**

4. **Vercel will show DNS configuration**
   - You'll see DNS records that need to be added at your domain registrar

### Step 2: Configure DNS Records

At your domain registrar (where you purchased `cursor-gtm-enablement-trainer.com`):

#### Option A: Root Domain (cursor-gtm-enablement-trainer.com)
- **Type**: `A` record
- **Name**: `@` (or leave blank)
- **Value**: `76.76.21.21` (Vercel's IP address)

OR

- **Type**: `CNAME` record  
- **Name**: `@` (or leave blank)
- **Value**: `cname.vercel-dns.com`

#### Option B: WWW Subdomain (www.cursor-gtm-enablement-trainer.com)
- **Type**: `CNAME` record
- **Name**: `www`
- **Value**: `cname.vercel-dns.com`

**Note**: Vercel will automatically configure both root and www if you add the root domain.

### Step 3: Update Environment Variables (Optional but Recommended)

1. **Go to Vercel Project Settings**
   - **Settings** → **Environment Variables**

2. **Update ALLOWED_ORIGINS** (if you have it set)
   - **Name**: `ALLOWED_ORIGINS`
   - **Value**: `https://cursor-gtm-enablement-trainer.com,https://www.cursor-gtm-enablement-trainer.com`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

   **Note**: If `ALLOWED_ORIGINS` is not set, the app defaults to allowing all origins (`*`), which will work fine.

### Step 4: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours** to propagate
- Vercel will show the domain status:
  - ⏳ **Pending**: DNS not yet configured
  - ✅ **Valid**: Domain is configured correctly
  - ❌ **Invalid**: DNS configuration issue

### Step 5: Verify Domain is Active

1. **Check Vercel Dashboard**
   - Go to **Settings** → **Domains**
   - Verify status shows **Valid** ✅

2. **Test the Domain**
   - Visit: `https://cursor-gtm-enablement-trainer.com`
   - Should load your application

3. **Test HTTPS**
   - Vercel automatically provisions SSL certificates
   - HTTPS should work automatically within a few minutes

### Troubleshooting

#### Domain Status Shows "Invalid"
- **Check DNS records**: Make sure you added the correct records at your registrar
- **Wait for propagation**: DNS can take up to 48 hours
- **Verify record values**: Double-check the IP or CNAME value matches Vercel's instructions

#### Domain Not Loading
- **Check DNS propagation**: Use `dig cursor-gtm-enablement-trainer.com` or online DNS checker
- **Clear browser cache**: Try incognito mode
- **Check Vercel logs**: Go to **Deployments** → Click latest deployment → **View Function Logs**

#### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- If HTTPS doesn't work immediately, wait 5-10 minutes
- Check **Settings** → **Domains** → SSL status

### Using Vercel CLI (Alternative)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Add domain
vercel domains add cursor-gtm-enablement-trainer.com

# Follow the prompts and DNS instructions
```

### After Domain is Active

Once your domain is working:

1. ✅ **Update any hardcoded URLs** (if any in your code)
2. ✅ **Update documentation** with new domain
3. ✅ **Test all features** on the new domain
4. ✅ **Update bookmarks/share links** with new domain

### Current Configuration

- **Old Domain**: `cursor-gtm-training.vercel.app` (still works)
- **New Domain**: `cursor-gtm-enablement-trainer.com` (once configured)
- **Both domains** will work simultaneously

---

## Quick Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] DNS records configured at registrar
- [ ] DNS propagation complete (check status in Vercel)
- [ ] Domain shows "Valid" in Vercel
- [ ] HTTPS working (automatic via Vercel)
- [ ] Site loads at new domain
- [ ] ALLOWED_ORIGINS updated (optional)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support

