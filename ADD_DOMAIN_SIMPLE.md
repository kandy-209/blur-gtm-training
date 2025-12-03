# ✅ Add Domain - Simple Instructions

## Quick Steps (2 minutes)

### 1. Go to Vercel Dashboard
**Link:** https://vercel.com/dashboard

### 2. Select Project
Click: **cursor-gtm-training**

### 3. Add Domain
- Click: **Settings** (top navigation)
- Click: **Domains** (left sidebar)
- Click: **Add Domain** button
- Enter: `cursor-gtm-enablement.com`
- Click: **Add**

### 4. Configure DNS
Vercel will show DNS instructions. At your domain registrar:

**Add CNAME Record:**
- Type: `CNAME`
- Name: `@` (or root)
- Value: `cname.vercel-dns.com`
- TTL: `3600`

**OR A Record:**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`
- TTL: `3600`

### 5. Wait & Verify
- Wait: 1-2 hours for DNS propagation
- Check: Vercel dashboard shows "Valid"
- Test: Visit https://cursor-gtm-enablement.com/

---

## Result

✅ Both domains will work:
- https://howtosellcursor.me/
- https://cursor-gtm-enablement.com/

✅ Both show:
- Same premium design system
- Same content
- Auto-update together

---

*That's it! Just add the domain in Vercel dashboard.*


