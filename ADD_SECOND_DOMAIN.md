# 🌐 Add cursor-gtm-enablement.com Domain

## Goal
Link `https://cursor-gtm-enablement.com/` to the same Vercel deployment as `https://howtosellcursor.me/`

---

## Step-by-Step: Add Domain in Vercel

### Step 1: Go to Vercel Dashboard
1. **Visit:** https://vercel.com/dashboard
2. **Click:** `cursor-gtm-training` project

### Step 2: Add Domain
1. **Go to:** **Settings** → **Domains**
2. **Click:** **Add Domain** button
3. **Enter:** `cursor-gtm-enablement.com`
4. **Click:** **Add**

### Step 3: Configure DNS
Vercel will show DNS configuration instructions:

**Option A: CNAME Record (Recommended)**
- **Type:** `CNAME`
- **Name:** `@` (or root)
- **Value:** `cname.vercel-dns.com`
- **TTL:** `3600` (or default)

**Option B: A Record**
- **Type:** `A`
- **Name:** `@` (or root)
- **Value:** `76.76.21.21` (Vercel's IP)
- **TTL:** `3600` (or default)

### Step 4: Add DNS Record
1. **Go to your domain registrar** (where you bought `cursor-gtm-enablement.com`)
2. **Go to DNS settings**
3. **Add the record** Vercel showed you
4. **Save**

### Step 5: Wait for DNS Propagation
- **Time:** 15 minutes to 48 hours
- **Usually:** 1-2 hours
- **Check:** Vercel dashboard will show "Valid" when ready

---

## What Happens

Once DNS propagates:
- ✅ `cursor-gtm-enablement.com` → Points to same deployment
- ✅ `howtosellcursor.me` → Still works
- ✅ Both domains show the same site
- ✅ SSL certificates auto-provisioned

---

## Verify Setup

### In Vercel Dashboard:
1. **Settings** → **Domains**
2. **You should see:**
   - `howtosellcursor.me` - Valid
   - `cursor-gtm-enablement.com` - Valid (after DNS propagates)

### Test Domains:
1. Visit: https://howtosellcursor.me/ ✅
2. Visit: https://cursor-gtm-enablement.com/ ✅ (after DNS)
3. Both should show the same site!

---

## Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → Domains
- [ ] Add `cursor-gtm-enablement.com`
- [ ] Copy DNS instructions
- [ ] Add DNS record at registrar
- [ ] Wait for DNS propagation (1-2 hours)
- [ ] Verify both domains work

---

## Alternative: Via Vercel CLI

If you have Vercel CLI access:

```bash
npx vercel domains add cursor-gtm-enablement.com
```

Then follow DNS instructions shown.

---

*Add the domain in Vercel dashboard, then configure DNS at your registrar!*


