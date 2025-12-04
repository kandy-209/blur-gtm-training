# 🚀 Quick Setup Guide - Add DNS Records Manually

## ✅ What You Need to Do

Add **2 DNS records** in Cloudflare to connect your domain to Vercel.

---

## 📝 Step-by-Step Instructions

### Step 1: Open Cloudflare Dashboard

1. Go to: **https://dash.cloudflare.com**
2. Log in to your account
3. Click on **cursorsalestrainer.com** (your domain)

### Step 2: Go to DNS Section

1. In the left sidebar, click **DNS**
2. You'll see a list of existing DNS records (if any)
3. Click the **Add record** button

### Step 3: Add First Record (www CNAME) - REQUIRED

Fill in these fields:

- **Type**: Select `CNAME` from dropdown
- **Name**: Type `www`
- **Target**: Type `dd76a87b2c0ea9f7.vercel-dns-017.com`
- **Proxy status**: Click the cloud icon to turn it **OFF** (should be **gray**, not orange)
- **TTL**: Leave as `Auto`

Click **Save**

### Step 4: Add Second Record (Root A Record) - RECOMMENDED

Click **Add record** again, then fill in:

- **Type**: Select `A` from dropdown
- **Name**: Type `@` (or leave blank)
- **IPv4 address**: Type `216.150.1.1`
- **Proxy status**: Click the cloud icon to turn it **OFF** (should be **gray**, not orange)
- **TTL**: Leave as `Auto`

Click **Save**

---

## ✅ Verification Checklist

After adding both records, verify:

- [ ] **www CNAME** record exists
  - Name: `www`
  - Target: `dd76a87b2c0ea9f7.vercel-dns-017.com`
  - Proxy: **OFF** (gray cloud)

- [ ] **Root A** record exists
  - Name: `@`
  - IPv4: `216.150.1.1`
  - Proxy: **OFF** (gray cloud)

---

## ⏱️ What Happens Next

1. **DNS Propagation**: Wait 5-10 minutes for DNS to propagate
2. **Vercel Verification**: Vercel will automatically detect the `www` CNAME record
3. **SSL Certificate**: Vercel will automatically provision SSL certificates
4. **Domain Live**: Your site will be accessible at:
   - `https://cursorsalestrainer.com`
   - `https://www.cursorsalestrainer.com`

---

## 🔍 Check Status

### In Cloudflare:
- Go to **DNS** section
- You should see both records listed

### In Vercel:
1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Find `cursorsalestrainer.com`
3. Status should change to **✅ Valid** (may take 5-10 minutes)

---

## ⚠️ Common Issues

### Issue: "Proxy is orange (ON)"
**Fix**: Click the cloud icon to turn it **OFF** (gray). Vercel needs direct DNS access.

### Issue: "Record already exists"
**Fix**: Edit the existing record and update it to match the values above.

### Issue: "Vercel shows 'Invalid' status"
**Fix**: 
- Double-check the `www` CNAME target is exactly: `dd76a87b2c0ea9f7.vercel-dns-017.com`
- Make sure Proxy is **OFF**
- Wait 10-15 minutes for DNS propagation

---

## 🎯 Quick Reference

| Record | Type | Name | Value | Proxy |
|--------|------|------|-------|-------|
| Verification | CNAME | `www` | `dd76a87b2c0ea9f7.vercel-dns-017.com` | OFF |
| Root Domain | A | `@` | `216.150.1.1` | OFF |

---

## 📞 Need More Help?

- **Cloudflare DNS Docs**: https://developers.cloudflare.com/dns/
- **Vercel Domain Setup**: https://vercel.com/docs/concepts/projects/domains
- **Check DNS Status**: Run `./check-domain-status.sh` in terminal

---

**That's it!** Once you add these 2 records, everything else happens automatically. 🎉

