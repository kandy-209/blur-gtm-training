# 🎯 CursorSalesTrainer.com Setup Guide

## Domain: cursorsalestrainer.com

### Cloudflare Configuration
- **Zone ID**: `9f4d9c373158101c337560c078c73081`
- **Account ID**: `79f0e13e07f30225fb62e1b3dc0d0c53`
- **Nameservers**: 
  - `emma.ns.cloudflare.com`
  - `henry.ns.cloudflare.com`

---

## Quick Setup Steps

### Step 1: Add DNS Record in Cloudflare

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Click on: `cursorsalestrainer.com`

2. **Go to DNS Section**
   - Click **DNS** in left sidebar

3. **Add A Record**
   - Click **Add record**
   - **Type**: `A`
   - **Name**: `@` (or leave blank)
   - **IPv4 address**: `76.76.21.21`
   - **Proxy status**: **OFF** (gray cloud, not orange) ⚠️
   - **TTL**: `Auto`
   - Click **Save**

4. **Verify Record**
   - Should see: `A @ 76.76.21.21 DNS only`

---

### Step 2: Disable DNSSEC

1. **In Cloudflare DNS Section**
   - Scroll to **DNSSEC** section
   - If enabled, click **Disable DNSSEC**
   - Confirm
   - Status should show: **Disabled**

---

### Step 3: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click project: **cursor-gtm-training**

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `cursorsalestrainer.com`
   - Click **Add**

3. **Wait for Verification**
   - Status will show: ⏳ **Pending**
   - Will change to ✅ **Valid** once DNS propagates (15-30 min)

---

### Step 4: Verify Setup

**Run verification script:**
```bash
./check-domain-status.sh
```

**Or run complete setup check:**
```bash
./complete-setup.sh
```

---

## Expected Timeline

- **DNS Propagation**: 15-30 minutes
- **Vercel Verification**: 5-10 minutes after DNS propagates
- **SSL Certificate**: Auto-provisioned (5-10 minutes)
- **Total**: Usually 20-40 minutes

---

## Quick Commands

```bash
# Check domain status
./check-domain-status.sh

# Complete setup check
./complete-setup.sh

# Check DNS resolution
dig cursorsalestrainer.com

# Test HTTPS
curl -I https://cursorsalestrainer.com
```

---

## Checklist

- [ ] DNS A record added: `@` → `76.76.21.21`
- [ ] Proxy is OFF (gray cloud)
- [ ] DNSSEC is Disabled
- [ ] Domain added in Vercel
- [ ] DNS propagated (check with dnschecker.org)
- [ ] Domain shows "Valid" in Vercel
- [ ] Can access https://cursorsalestrainer.com

---

## Success!

Once complete, your site will be live at:
**https://cursorsalestrainer.com**

🎉

