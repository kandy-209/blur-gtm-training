# 🌐 Domain Configuration Guide

## Current Domains

### Primary Domain
- **URL:** `https://howtosellcursor.me/`
- **Status:** ✅ Active (should be working)

### Domain to Add
- **URL:** `https://cursor-gtm-enablement.com/`
- **Status:** ⏳ Needs to be added

---

## Add Second Domain to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** `cursor-gtm-training` project
3. **Go to:** **Settings** → **Domains**
4. **Click:** **Add Domain**
5. **Enter:** `cursor-gtm-enablement.com`
6. **Click:** **Add**

Vercel will show DNS configuration instructions.

---

## DNS Configuration

### At Your Domain Registrar:

**For cursor-gtm-enablement.com:**

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: @ (or leave blank for root)
Value: cname.vercel-dns.com
TTL: 3600
```

**Option B: A Record**
```
Type: A
Name: @ (or leave blank for root)
Value: 76.76.21.21
TTL: 3600
```

**For WWW Subdomain (Optional):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## After Adding DNS

1. **Wait:** 15 minutes to 48 hours (usually 1-2 hours)
2. **Check:** Vercel dashboard → Domains → Should show "Valid"
3. **Test:** Visit https://cursor-gtm-enablement.com/
4. **Verify:** Both domains show the same site

---

## Update Environment Variables (If Needed)

If your app uses `NEXT_PUBLIC_SITE_URL`:

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Update:** `NEXT_PUBLIC_SITE_URL`
3. **Value:** `https://howtosellcursor.me,https://cursor-gtm-enablement.com`
4. **Or:** Use the primary domain: `https://howtosellcursor.me`

---

## Verify Both Domains Work

### Test:
1. ✅ https://howtosellcursor.me/ - Should work
2. ✅ https://cursor-gtm-enablement.com/ - Should work (after DNS)
3. ✅ Both show same premium design system
4. ✅ Both have SSL certificates

---

## Quick Steps Summary

1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Add Domain:** `cursor-gtm-enablement.com`
3. **Copy DNS instructions**
4. **Add DNS record** at registrar
5. **Wait** for DNS propagation
6. **Test** both domains

---

*Add the domain in Vercel, then configure DNS at your registrar!*

