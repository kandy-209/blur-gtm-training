# 🚀 Step-by-Step: Add Domain to Vercel

## Current Status Check
Run this first to see current status:
```bash
./check-domain-status.sh
```

## Step 1: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on: **cursor-gtm-training** (or your project name)

3. **Navigate to Domains**
   - Click **Settings** tab (top navigation)
   - Click **Domains** in the left sidebar

4. **Add Domain**
   - Click the **Add Domain** button (top right)
   - Enter: `cursor-gtm-enablement-trainer.com`
   - Click **Add**

5. **Vercel Will Show DNS Instructions**
   - You'll see a screen with DNS records to add
   - **Copy these values** - you'll need them for Step 2

## Step 2: Configure DNS at Your Domain Registrar

**Where did you buy the domain?** (GoDaddy, Namecheap, Google Domains, etc.)

### For Most Registrars:

1. **Log into your domain registrar**
2. **Find DNS Management**
   - Usually under "DNS Settings", "Domain Management", or "Advanced DNS"
3. **Add DNS Record**

   **Option A: A Record (Recommended)**
   - **Type**: `A`
   - **Name/Host**: `@` (or leave blank, or enter root domain)
   - **Value/IP**: `76.76.21.21`
   - **TTL**: `3600` (or default)
   - Click **Save** or **Add Record**

   **Option B: CNAME Record**
   - **Type**: `CNAME`
   - **Name/Host**: `@` (or leave blank)
   - **Value/Target**: `cname.vercel-dns.com`
   - **TTL**: `3600` (or default)
   - Click **Save** or **Add Record**

### Common Registrars:

**GoDaddy:**
- My Products → Domains → Manage DNS
- Add A record: `@` → `76.76.21.21`

**Namecheap:**
- Domain List → Manage → Advanced DNS
- Add A record: `@` → `76.76.21.21`

**Google Domains:**
- DNS → Custom records
- Add A record: `@` → `76.76.21.21`

**Cloudflare:**
- DNS → Records → Add record
- Type: A, Name: @, Content: 76.76.21.21

## Step 3: Verify in Vercel

1. **Go back to Vercel Dashboard**
   - Settings → Domains
   - You should see your domain listed

2. **Check Status**
   - Status will show:
     - ⏳ **Pending**: DNS not configured yet
     - ⏳ **Pending**: DNS configured, waiting for propagation
     - ✅ **Valid**: Domain is live!

3. **Wait for Propagation**
   - DNS changes take **15 minutes to 48 hours**
   - Usually works within **1-2 hours**

## Step 4: Check Domain Status

Run the checker script:
```bash
./check-domain-status.sh
```

Or manually check:
```bash
curl -I https://cursor-gtm-enablement-trainer.com
```

## Step 5: SSL Certificate (Automatic)

- Vercel automatically provisions SSL certificates
- HTTPS will work automatically once DNS propagates
- Usually takes **5-10 minutes** after DNS is live

## Troubleshooting

### Domain Status Shows "Invalid" in Vercel
- **Check DNS records**: Make sure you added the correct record
- **Verify values**: Double-check IP address or CNAME target
- **Wait longer**: DNS can take up to 48 hours

### Domain Not Resolving
- **Check DNS propagation**: Use https://dnschecker.org
- **Verify record type**: Make sure it's A or CNAME (not both)
- **Check TTL**: Lower TTL (300-600) helps propagation

### Still Not Working After 48 Hours
- **Contact Vercel Support**: https://vercel.com/support
- **Check registrar**: Some registrars have DNS propagation delays
- **Try different DNS**: Consider using Cloudflare DNS (faster propagation)

## Quick Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] DNS record added at registrar
- [ ] DNS record saved/activated
- [ ] Waited 15+ minutes
- [ ] Checked status with `./check-domain-status.sh`
- [ ] Domain shows "Valid" in Vercel
- [ ] Can access https://cursor-gtm-enablement-trainer.com

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support

