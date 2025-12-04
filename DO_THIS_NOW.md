# ✅ DO THIS NOW - Complete Setup in 5 Minutes

## 🎯 Quick Setup Steps

### Step 1: Add DNS Record in Cloudflare (2 minutes)

1. **Open Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Click on: **cursorsalestrainer.com**

2. **Go to DNS Section**
   - Click **DNS** in the left sidebar

3. **Add A Record**
   - Click **Add record** button
   - Fill in exactly:
     ```
     Type: A
     Name: @ (or leave blank)
     IPv4 address: 76.76.21.21
     Proxy status: OFF (gray cloud, NOT orange)
     TTL: Auto
     ```
   - Click **Save**

4. **Verify**
   - You should see: `A @ 76.76.21.21 DNS only`

✅ **Done!** Move to Step 2.

---

### Step 2: Add Domain in Vercel (2 minutes)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Click on: **cursor-gtm-training** project

2. **Go to Domains**
   - Click **Settings** tab
   - Click **Domains** in left sidebar

3. **Add Domain**
   - Click **Add Domain** button
   - Enter: `cursorsalestrainer.com`
   - Click **Add**

4. **Verify**
   - Domain will appear in list
   - Status will show: ⏳ **Pending** (this is normal)

✅ **Done!** Move to Step 3.

---

### Step 3: Wait and Monitor (15-30 minutes)

**Run this command to check status:**
```bash
./auto-setup.sh
```

**Or check manually:**
- Vercel Dashboard → Domains → Should show ✅ **Valid**
- Visit: https://cursorsalestrainer.com (should load your site)

✅ **Done when:** Domain shows "Valid" in Vercel and site loads!

---

## 📋 Checklist

- [ ] DNS A record added in Cloudflare (`@` → `76.76.21.21`)
- [ ] Proxy is OFF (gray cloud)
- [ ] Domain added in Vercel Dashboard
- [ ] Waited 15-30 minutes
- [ ] Domain shows "Valid" in Vercel
- [ ] Can access https://cursorsalestrainer.com

---

## ⏱️ Timeline

- **Steps 1-2**: 5 minutes (you do these)
- **DNS Propagation**: 15-30 minutes (automatic)
- **Vercel SSL**: 5-10 minutes (automatic)
- **Total**: ~20-40 minutes

---

## 🎉 Success!

Once complete, your site will be live at:
**https://cursorsalestrainer.com**

---

## 🔍 Monitor Progress

Run this anytime to check:
```bash
./auto-setup.sh
```

The script will tell you exactly what's done and what's remaining!

---

**Start with Step 1 above - it only takes 2 minutes!** 🚀

