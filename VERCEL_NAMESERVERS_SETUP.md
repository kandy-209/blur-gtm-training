# 🚀 Vercel Nameservers Setup

## Vercel DNS Configuration

Vercel wants you to use **their nameservers** instead of Cloudflare's:

### Vercel Nameservers:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

### Vercel IP Address:
```
216.150.1.1
```

---

## Setup Options

### Option 1: Use Vercel Nameservers (Recommended)

**This is easier!** Vercel will manage DNS for you.

#### Step 1: Update Nameservers at Your Registrar

1. **Go to Your Domain Registrar**
   - Where you bought: `cursorsalestrainer.com`
   - Log into your account

2. **Find Nameserver Settings**
   - Look for: "Nameservers", "DNS Settings", or "Name Servers"
   - Usually in: Domain Management → DNS Settings

3. **Update Nameservers**
   - Replace existing nameservers with:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Save changes

4. **Wait for Propagation**
   - Takes 15 minutes to 48 hours
   - Usually 15-30 minutes

#### Step 2: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click: **cursor-gtm-training** project

2. **Add Domain**
   - Settings → Domains
   - Click **Add Domain**
   - Enter: `cursorsalestrainer.com`
   - Click **Add**

3. **Vercel Will Configure DNS**
   - Vercel automatically sets up DNS records
   - No manual DNS configuration needed!

#### Step 3: Verify

- Wait 15-30 minutes
- Check Vercel Dashboard → Domains → Should show ✅ **Valid**
- Visit: https://cursorsalestrainer.com

---

### Option 2: Keep Cloudflare Nameservers (Current Setup)

If you want to keep using Cloudflare:

#### Step 1: Add DNS Record in Cloudflare

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Click: `cursorsalestrainer.com`
   - Go to: **DNS** section

2. **Add A Record**
   - Type: `A`
   - Name: `@`
   - IPv4: `216.150.1.1` (Vercel's IP)
   - Proxy: OFF (gray cloud)
   - Save

#### Step 2: Add Domain in Vercel

1. **Vercel Dashboard** → Settings → Domains
2. Add: `cursorsalestrainer.com`
3. Vercel will verify DNS

---

## Which Option to Choose?

### ✅ Option 1: Vercel Nameservers (Easier)
- **Pros**: 
  - Vercel manages everything
  - No manual DNS configuration
  - Automatic SSL
  - Easier setup
- **Cons**: 
  - Lose Cloudflare proxy features
  - Can't use Cloudflare DNS features

### ⚙️ Option 2: Cloudflare Nameservers (More Control)
- **Pros**: 
  - Keep Cloudflare features
  - More DNS control
- **Cons**: 
  - Manual DNS configuration needed
  - More steps

---

## Recommendation

**Use Option 1 (Vercel Nameservers)** - It's simpler and Vercel handles everything automatically!

---

## Quick Setup (Option 1)

1. **Update Nameservers at Registrar**
   - Change to: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
   - Save

2. **Add Domain in Vercel**
   - Settings → Domains → Add `cursorsalestrainer.com`

3. **Wait 15-30 minutes**

4. **Done!** Domain will be live.

---

## Current Status

Based on Vercel's instructions:
- ✅ Use nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- ✅ IP address: `216.150.1.1` (if using A record instead)

---

**Choose Option 1 for easiest setup!** 🚀

