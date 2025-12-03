# 🌐 Add cursor-gtm-enablement.com Domain

## Goal
Link `https://cursor-gtm-enablement.com/` to the same Vercel deployment as `https://howtosellcursor.me/`

---

## Step-by-Step Instructions

### Step 1: Add Domain in Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Click:** `cursor-gtm-training` project
3. **Navigate to:** **Settings** → **Domains**
4. **Click:** **Add Domain** button
5. **Enter:** `cursor-gtm-enablement.com`
6. **Click:** **Add**

### Step 2: Vercel Shows DNS Instructions

After adding, Vercel will display DNS configuration instructions. You'll see something like:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: @ (or root)
Value: cname.vercel-dns.com
```

**Option B: A Record**
```
Type: A
Name: @ (or root)
Value: 76.76.21.21
```

### Step 3: Configure DNS at Your Domain Registrar

**Where did you buy `cursor-gtm-enablement.com`?**
- GoDaddy, Namecheap, Google Domains, Cloudflare, etc.

**At your domain registrar:**

1. **Log into your account**
2. **Go to DNS Management** (or DNS Settings)
3. **Add DNS Record:**

   **For CNAME (Recommended):**
   - **Type:** `CNAME`
   - **Name:** `@` (or leave blank for root domain)
   - **Value/Target:** `cname.vercel-dns.com`
   - **TTL:** `3600` (or default)
   - **Save**

   **OR For A Record:**
   - **Type:** `A`
   - **Name:** `@` (or leave blank)
   - **Value/IP:** `76.76.21.21`
   - **TTL:** `3600` (or default)
   - **Save**

### Step 4: Wait for DNS Propagation

- **Time:** 15 minutes to 48 hours
- **Usually:** 1-2 hours
- **Check:** Vercel dashboard will show "Valid" when ready

### Step 5: Verify Both Domains Work

Once DNS propagates:

1. ✅ Visit: https://howtosellcursor.me/ - Should work
2. ✅ Visit: https://cursor-gtm-enablement.com/ - Should work
3. ✅ Both show the same site with premium design
4. ✅ Both have SSL certificates (auto-provisioned)

---

## What Happens

- ✅ Both domains point to the same Vercel deployment
- ✅ Both show your premium design system
- ✅ SSL certificates auto-provisioned for both
- ✅ Changes deploy to both domains automatically

---

## Update Environment Variables (Optional)

If your app uses `NEXT_PUBLIC_SITE_URL`:

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Find:** `NEXT_PUBLIC_SITE_URL`
3. **Update to:** `https://howtosellcursor.me` (primary domain)
4. **Or leave as is** - it will work with both domains

---

## Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → Domains
- [ ] Add `cursor-gtm-enablement.com`
- [ ] Copy DNS instructions from Vercel
- [ ] Add DNS record at domain registrar
- [ ] Wait for DNS propagation (1-2 hours)
- [ ] Verify both domains work

---

## Common Domain Registrars

### GoDaddy:
- My Products → Domains → Manage DNS
- Add CNAME: `@` → `cname.vercel-dns.com`

### Namecheap:
- Domain List → Manage → Advanced DNS
- Add CNAME: `@` → `cname.vercel-dns.com`

### Google Domains:
- DNS → Custom records
- Add CNAME: `@` → `cname.vercel-dns.com`

### Cloudflare:
- DNS → Records → Add record
- Type: CNAME, Name: @, Target: `cname.vercel-dns.com`

---

## After Setup

Both domains will:
- ✅ Show the same premium design system
- ✅ Have SSL certificates
- ✅ Update automatically when you deploy
- ✅ Work identically

---

*Add the domain in Vercel dashboard, then configure DNS at your registrar!*

