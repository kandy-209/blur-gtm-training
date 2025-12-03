# 🔧 Change Nameservers in Cloudflare

## Where to Change Nameservers in Cloudflare

### If Cloudflare is Your Registrar:

#### Step 1: Go to Registrar Section

1. **Log into Cloudflare**
   - Go to: https://dash.cloudflare.com
   - Sign in

2. **Go to Registrar**
   - Click **Registrar** in the left sidebar
   - Or go to: https://dash.cloudflare.com/registrar

3. **Find Your Domain**
   - Look for: `cursorsalestrainer.com`
   - Click on it

#### Step 2: Update Nameservers

1. **Find Nameserver Settings**
   - Look for **Nameservers** section
   - Should show current nameservers:
     - `emma.ns.cloudflare.com`
     - `henry.ns.cloudflare.com`

2. **Change to Vercel Nameservers**
   - Click **Change** or **Edit** on nameservers
   - Replace with:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Click **Save** or **Update**

3. **Wait for Propagation**
   - Takes 15 minutes to 48 hours
   - Usually 15-30 minutes

---

### Alternative: If Domain is Managed Elsewhere

If you bought the domain from a different registrar (not Cloudflare):

1. **Go to Your Original Registrar**
   - Where you originally bought the domain
   - Log into that account

2. **Find Nameserver Settings**
   - Usually under: "DNS Settings", "Nameservers", or "Domain Management"

3. **Update Nameservers**
   - Change to:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Save

---

## Visual Guide: Cloudflare Dashboard

### Path 1: Via Registrar Section
```
Cloudflare Dashboard
  → Registrar (left sidebar)
    → cursorsalestrainer.com
      → Nameservers section
        → Change/Edit
          → Enter: ns1.vercel-dns.com, ns2.vercel-dns.com
            → Save
```

### Path 2: Via Domain Overview
```
Cloudflare Dashboard
  → Click: cursorsalestrainer.com (if listed)
    → Registrar tab (if available)
      → Nameservers
        → Change
```

---

## Important Notes

### ⚠️ What Happens When You Change Nameservers:

1. **Cloudflare DNS Stops Working**
   - Once you switch to Vercel nameservers, Cloudflare DNS records won't apply
   - Vercel will manage DNS instead

2. **Vercel Takes Over**
   - Vercel automatically configures DNS
   - No need to add DNS records manually
   - SSL certificate auto-provisioned

3. **Cloudflare Features**
   - You'll lose Cloudflare proxy/CDN features
   - But Vercel has its own CDN (built-in)

---

## Step-by-Step Screenshots Guide

### In Cloudflare Dashboard:

1. **Left Sidebar** → Click **Registrar**
2. **Find Domain** → Click `cursorsalestrainer.com`
3. **Nameservers Section** → Should show current nameservers
4. **Click Change/Edit** → Update to Vercel nameservers
5. **Save** → Wait for propagation

---

## After Changing Nameservers

1. **Add Domain in Vercel**
   - Go to: https://vercel.com/dashboard
   - Project → Settings → Domains
   - Add: `cursorsalestrainer.com`

2. **Wait 15-30 Minutes**
   - Nameservers propagate
   - Vercel configures DNS automatically

3. **Verify**
   - Check Vercel Dashboard → Domains → Should show ✅ **Valid**
   - Visit: https://cursorsalestrainer.com

---

## Can't Find Nameservers in Cloudflare?

### If Cloudflare is NOT Your Registrar:

The domain might be registered elsewhere. Check:

1. **Who is Your Registrar?**
   - Check your email for domain purchase confirmation
   - Common registrars: GoDaddy, Namecheap, Google Domains, etc.

2. **Update Nameservers There**
   - Log into that registrar
   - Update nameservers to Vercel's

### If Domain is Already Using Cloudflare Nameservers:

If you see `emma.ns.cloudflare.com` and `henry.ns.cloudflare.com`, then:
- Cloudflare IS managing DNS
- You need to change nameservers to Vercel's
- Or keep Cloudflare and add A record pointing to Vercel

---

## Quick Decision

**Option A: Use Vercel Nameservers** (Easier)
- Change nameservers to: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- Vercel manages everything

**Option B: Keep Cloudflare Nameservers**
- Keep: `emma.ns.cloudflare.com`, `henry.ns.cloudflare.com`
- Add A record: `@` → `216.150.1.1` (Vercel's IP)

**Recommendation**: Option A (Vercel nameservers) is simpler!

---

**Go to Cloudflare Dashboard → Registrar → Your Domain → Nameservers → Change to Vercel's!** 🚀

