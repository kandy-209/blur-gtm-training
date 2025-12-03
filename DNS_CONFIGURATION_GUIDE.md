# 🌐 DNS Configuration Guide

## Quick Setup for `cursor-gtm-enablement-trainer.com`

### Step 1: Get DNS Records from Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click your project: **cursor-gtm-training**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `cursor-gtm-enablement-trainer.com`
   - Click **Add**

2. **Vercel will show DNS instructions**
   - You'll see the exact DNS records to add
   - Usually one of these:
     - **A Record**: `@` → `76.76.21.21`
     - **CNAME Record**: `@` → `cname.vercel-dns.com`

---

## Step 2: Configure DNS at Your Domain Registrar

**Where did you buy the domain?** Follow the instructions for your registrar below:

---

### 🟢 GoDaddy

1. **Log into GoDaddy**
   - Go to: https://godaddy.com
   - Sign in to your account

2. **Navigate to DNS Management**
   - Click **My Products**
   - Find your domain: `cursor-gtm-enablement-trainer.com`
   - Click **DNS** (or **Manage DNS**)

3. **Add DNS Record**
   - Scroll to **Records** section
   - Click **Add** button
   - **Type**: Select `A`
   - **Name**: Enter `@` (or leave blank)
   - **Value**: Enter `76.76.21.21`
   - **TTL**: `600` (or default)
   - Click **Save**

4. **Wait for propagation** (15 min - 48 hours)

---

### 🔵 Namecheap

1. **Log into Namecheap**
   - Go to: https://namecheap.com
   - Sign in to your account

2. **Navigate to DNS**
   - Click **Domain List**
   - Find: `cursor-gtm-enablement-trainer.com`
   - Click **Manage** button
   - Go to **Advanced DNS** tab

3. **Add DNS Record**
   - Scroll to **Host Records** section
   - Click **Add New Record**
   - **Type**: Select `A Record`
   - **Host**: Enter `@`
   - **Value**: Enter `76.76.21.21`
   - **TTL**: `Automatic` (or `600`)
   - Click **Save** (checkmark icon)

4. **Wait for propagation** (15 min - 48 hours)

---

### 🟡 Google Domains

1. **Log into Google Domains**
   - Go to: https://domains.google
   - Sign in to your account

2. **Navigate to DNS**
   - Click on your domain: `cursor-gtm-enablement-trainer.com`
   - Click **DNS** in the left sidebar

3. **Add DNS Record**
   - Scroll to **Custom resource records**
   - Click **Manage custom records**
   - Click **Create new record**
   - **Name**: Leave blank or enter `@`
   - **Type**: Select `A`
   - **Data**: Enter `76.76.21.21`
   - **TTL**: `3600`
   - Click **Save**

4. **Wait for propagation** (15 min - 48 hours)

---

### 🟣 Cloudflare

1. **Log into Cloudflare**
   - Go to: https://cloudflare.com
   - Sign in to your account

2. **Select Your Domain**
   - Click on: `cursor-gtm-enablement-trainer.com`

3. **Navigate to DNS**
   - Click **DNS** in the left sidebar
   - Click **Records**

4. **Add DNS Record**
   - Click **Add record**
   - **Type**: Select `A`
   - **Name**: Enter `@` (or leave blank)
   - **IPv4 address**: Enter `76.76.21.21`
   - **Proxy status**: Toggle **OFF** (gray cloud, not orange)
   - **TTL**: `Auto` (or `600`)
   - Click **Save**

5. **Wait for propagation** (Usually faster with Cloudflare, 5-15 minutes)

---

### 🔴 Name.com

1. **Log into Name.com**
   - Go to: https://name.com
   - Sign in to your account

2. **Navigate to DNS**
   - Click **My Domains**
   - Find: `cursor-gtm-enablement-trainer.com`
   - Click **Manage**
   - Click **DNS Records** tab

3. **Add DNS Record**
   - Click **Add Record**
   - **Type**: Select `A`
   - **Hostname**: Enter `@` (or leave blank)
   - **Answer**: Enter `76.76.21.21`
   - **TTL**: `3600`
   - Click **Save**

4. **Wait for propagation** (15 min - 48 hours)

---

### 🟠 Domain.com

1. **Log into Domain.com**
   - Go to: https://domain.com
   - Sign in to your account

2. **Navigate to DNS**
   - Click **My Domains**
   - Find: `cursor-gtm-enablement-trainer.com`
   - Click **Manage**
   - Click **DNS & Nameservers**

3. **Add DNS Record**
   - Click **Add Record**
   - **Type**: Select `A`
   - **Host**: Enter `@`
   - **Points to**: Enter `76.76.21.21`
   - **TTL**: `3600`
   - Click **Save**

4. **Wait for propagation** (15 min - 48 hours)

---

### ⚫ Hover

1. **Log into Hover**
   - Go to: https://hover.com
   - Sign in to your account

2. **Navigate to DNS**
   - Click **Domains**
   - Find: `cursor-gtm-enablement-trainer.com`
   - Click **Manage**
   - Click **DNS** tab

3. **Add DNS Record**
   - Click **Add**
   - **Type**: Select `A`
   - **Hostname**: Enter `@`
   - **Value**: Enter `76.76.21.21`
   - **TTL**: `3600`
   - Click **Save**

4. **Wait for propagation** (15 min - 48 hours)

---

## Alternative: Using CNAME Record

If your registrar doesn't support A records for root domain, use CNAME:

1. **Add CNAME Record**
   - **Type**: `CNAME`
   - **Name**: `@` (or root)
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: `3600` (or default)

**Note**: Some registrars don't allow CNAME on root domain. In that case, use the A record method above.

---

## Step 3: Verify DNS Configuration

### Check DNS Propagation

1. **Use DNS Checker** (Recommended)
   - Visit: https://dnschecker.org
   - Enter domain: `cursor-gtm-enablement-trainer.com`
   - Select record type: `A`
   - Click **Search**
   - Look for `76.76.21.21` in results

2. **Use Command Line**
   ```bash
   # Check DNS resolution
   dig cursor-gtm-enablement-trainer.com
   
   # Or use nslookup
   nslookup cursor-gtm-enablement-trainer.com
   ```

3. **Run Status Checker**
   ```bash
   ./check-domain-status.sh
   ```

---

## Step 4: Check Status in Vercel

1. **Go to Vercel Dashboard**
   - Settings → Domains
   - Find: `cursor-gtm-enablement-trainer.com`
   - Status will show:
     - ⏳ **Pending**: DNS not configured or not propagated yet
     - ✅ **Valid**: Domain is configured correctly and live!

---

## Common Issues & Solutions

### Issue: "Invalid DNS configuration"
**Solution**: 
- Double-check the IP address: `76.76.21.21`
- Make sure record type is `A` (not `AAAA` or `CNAME`)
- Verify the hostname is `@` or blank (not `www`)

### Issue: DNS not propagating after 48 hours
**Solution**:
- Check DNS records are saved correctly
- Try using a different DNS checker: https://dnschecker.org
- Contact your registrar support
- Consider using Cloudflare DNS (faster propagation)

### Issue: Can't add A record for root domain
**Solution**:
- Some registrars require you to leave hostname blank instead of `@`
- Try using CNAME: `@` → `cname.vercel-dns.com`
- Contact registrar support for assistance

### Issue: Domain shows "Invalid" in Vercel
**Solution**:
- Wait longer for DNS propagation (can take up to 48 hours)
- Verify DNS records match exactly what Vercel shows
- Check DNS propagation with dnschecker.org
- Make sure you're not using a proxy (Cloudflare orange cloud should be OFF)

---

## Quick Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] Logged into domain registrar
- [ ] Found DNS management section
- [ ] Added A record: `@` → `76.76.21.21`
- [ ] Saved DNS record
- [ ] Waited 15+ minutes
- [ ] Checked DNS propagation (dnschecker.org)
- [ ] Verified status in Vercel Dashboard
- [ ] Domain shows "Valid" ✅

---

## Need Help?

**Can't find your registrar?**
- Check your email for domain purchase confirmation
- Look for DNS management in your account dashboard
- Contact your registrar's support

**Still having issues?**
- Vercel Support: https://vercel.com/support
- DNS Checker: https://dnschecker.org
- Run: `./check-domain-status.sh` to check current status

---

## Expected Timeline

- **DNS Record Added**: Immediate
- **DNS Propagation**: 15 minutes to 48 hours
- **Vercel SSL Certificate**: 5-10 minutes after DNS propagates
- **Domain Fully Live**: Usually within 1-2 hours

**Most common**: 15-30 minutes for everything to work!

