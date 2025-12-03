# 🔧 Change Nameservers in Cloudflare Registrar

## Step-by-Step: Change to Vercel Nameservers

Since Cloudflare is your registrar, here's exactly where to change nameservers:

---

## 📍 Exact Steps in Cloudflare Dashboard

### Step 1: Go to Registrar Section

1. **Log into Cloudflare**
   - Go to: https://dash.cloudflare.com
   - Sign in to your account

2. **Click "Registrar" in Left Sidebar**
   - Look for **Registrar** in the left navigation menu
   - Or go directly to: https://dash.cloudflare.com/registrar

3. **Find Your Domain**
   - You should see: `cursorsalestrainer.com`
   - Click on it

### Step 2: Find Nameservers Section

1. **Look for "Nameservers" Section**
   - Should show current nameservers:
     - `emma.ns.cloudflare.com`
     - `henry.ns.cloudflare.com`

2. **Click "Change" or "Edit"**
   - There should be a button to change nameservers
   - May say "Change", "Edit", or "Manage"

### Step 3: Update to Vercel Nameservers

1. **Enter New Nameservers**
   - Replace with:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Make sure they're entered exactly (no typos!)

2. **Save Changes**
   - Click **Save** or **Update**
   - Confirm if prompted

### Step 4: Wait for Propagation

- **Time**: 15 minutes to 48 hours
- **Usually**: 15-30 minutes
- Cloudflare will show status updates

---

## 🎯 Visual Guide

```
Cloudflare Dashboard
  ↓
Left Sidebar → Click "Registrar"
  ↓
Find "cursorsalestrainer.com" → Click it
  ↓
Find "Nameservers" section
  ↓
Click "Change" or "Edit"
  ↓
Replace with:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ↓
Click "Save"
```

---

## ⚠️ Important Notes

### What Happens When You Change:

1. **Cloudflare DNS Stops Working**
   - Once switched to Vercel nameservers, Cloudflare DNS records won't apply
   - Vercel will manage DNS instead

2. **Vercel Takes Over**
   - Vercel automatically configures DNS
   - No need to add DNS records manually
   - SSL certificate auto-provisioned

3. **You'll Lose Cloudflare Proxy**
   - Cloudflare proxy/CDN features won't work
   - But Vercel has its own CDN (built-in)

---

## 📝 After Changing Nameservers

### Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click: **cursor-gtm-training** project

2. **Add Domain**
   - Settings → Domains
   - Click **Add Domain**
   - Enter: `cursorsalestrainer.com`
   - Click **Add**

### Step 2: Wait and Verify

- **Wait**: 15-30 minutes for propagation
- **Check Status**: Run `./auto-setup.sh`
- **Visit**: https://cursorsalestrainer.com

---

## 🔍 Can't Find Nameservers Section?

### Alternative Locations:

1. **Domain Overview Page**
   - Click on domain name in dashboard
   - Look for "Nameservers" tab or section

2. **DNS Section**
   - Some registrars show nameservers in DNS section
   - Look for "Name Servers" or "NS Records"

3. **Account Settings**
   - Sometimes under account/domain settings
   - Look for "DNS" or "Nameservers"

---

## ✅ Checklist

- [ ] Logged into Cloudflare Dashboard
- [ ] Went to Registrar section
- [ ] Found `cursorsalestrainer.com`
- [ ] Found Nameservers section
- [ ] Changed to: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- [ ] Saved changes
- [ ] Added domain in Vercel Dashboard
- [ ] Waited 15-30 minutes
- [ ] Verified domain is live

---

## 🚀 Quick Summary

**In Cloudflare Dashboard:**
1. Registrar → Your Domain → Nameservers
2. Change to: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
3. Save

**Then in Vercel:**
1. Settings → Domains → Add Domain
2. Enter: `cursorsalestrainer.com`
3. Wait 15-30 minutes
4. Done!

---

**Go to Cloudflare Dashboard → Registrar → Your Domain → Change Nameservers Now!** 🎯

