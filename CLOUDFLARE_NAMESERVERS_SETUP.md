# 🔧 Cloudflare Nameservers Setup

## Your Cloudflare Nameservers

```
emma.ns.cloudflare.com
henry.ns.cloudflare.com
```

These are Cloudflare's nameservers assigned to your domain. You need to configure them at your domain registrar.

---

## Step-by-Step: Configure Nameservers

### If Domain is Already in Cloudflare

If you see these nameservers in Cloudflare, your domain is already configured! You just need to:

1. **Add DNS Records** (see below)
2. **Add Domain in Vercel**
3. **Wait for propagation**

---

### If Domain is at Another Registrar

You need to update nameservers at your current registrar:

#### Step 1: Log into Your Domain Registrar

Go to where you bought the domain (GoDaddy, Namecheap, Google Domains, etc.)

#### Step 2: Find Nameserver Settings

Look for:
- **Nameservers**
- **DNS Settings**
- **Name Servers**
- **DNS Management**

#### Step 3: Update Nameservers

Replace existing nameservers with:

```
emma.ns.cloudflare.com
henry.ns.cloudflare.com
```

**How to do it:**

**GoDaddy:**
1. My Products → Domains → Manage DNS
2. Scroll to **Nameservers**
3. Click **Change**
4. Select **Custom**
5. Enter:
   - `emma.ns.cloudflare.com`
   - `henry.ns.cloudflare.com`
6. Click **Save**

**Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Scroll to **Nameservers**
3. Select **Custom DNS**
4. Enter:
   - `emma.ns.cloudflare.com`
   - `henry.ns.cloudflare.com`
5. Click **Save**

**Google Domains:**
1. DNS → Name servers
2. Click **Use custom name servers**
3. Enter:
   - `emma.ns.cloudflare.com`
   - `henry.ns.cloudflare.com`
4. Click **Save**

**Other Registrars:**
- Find "Nameservers" or "DNS" section
- Replace with the two Cloudflare nameservers above
- Save changes

---

## Step 4: Add DNS Records in Cloudflare

Once nameservers are configured:

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Click on your domain: `cursor-gtm-enablement-trainer.com`

2. **Go to DNS Section**
   - Click **DNS** in left sidebar

3. **Add A Record**
   - Click **Add record**
   - **Type**: `A`
   - **Name**: `@` (or leave blank)
   - **IPv4 address**: `76.76.21.21`
   - **Proxy status**: **OFF** (gray cloud, not orange) ⚠️ Important!
   - **TTL**: `Auto`
   - Click **Save**

4. **Verify Record**
   - You should see:
     ```
     Type: A
     Name: @
     Content: 76.76.21.21
     Proxy: DNS only (gray cloud)
     ```

---

## Step 5: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click your project: **cursor-gtm-training**

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `cursor-gtm-enablement-trainer.com`
   - Click **Add**

3. **Wait for Verification**
   - Status will show: ⏳ **Pending**
   - Will change to ✅ **Valid** once DNS propagates

---

## Step 6: Wait for Propagation

### Timeline
- **Nameserver Update**: 15 minutes to 48 hours
- **DNS Propagation**: 5 minutes to 2 hours (usually faster)
- **Vercel Verification**: 5-10 minutes after DNS propagates
- **SSL Certificate**: Auto-provisioned (5-10 minutes)

### Check Status

**1. Verify Nameservers**
```bash
# Check nameservers
dig NS cursor-gtm-enablement-trainer.com

# Should show:
# emma.ns.cloudflare.com
# henry.ns.cloudflare.com
```

**2. Check DNS Propagation**
- Visit: https://dnschecker.org
- Enter: `cursor-gtm-enablement-trainer.com`
- Select: `A` record
- Look for: `76.76.21.21`

**3. Run Status Checker**
```bash
./check-domain-status.sh
```

**4. Check Vercel**
- Go to Settings → Domains
- Status should show ✅ **Valid**

---

## ⚠️ Important Notes

### Keep Proxy OFF
- In Cloudflare DNS, make sure A record has **gray cloud** (not orange)
- Orange cloud = Proxy ON (can interfere with Vercel)
- Gray cloud = DNS only (correct)

### Nameserver Propagation
- Can take up to 48 hours (usually 15-30 minutes)
- During this time, domain may not work
- Be patient - it will propagate!

### DNS Records
- Only add the A record (`@` → `76.76.21.21`)
- Don't delete existing NS records
- Cloudflare will handle the rest automatically

---

## 🔍 Troubleshooting

### Issue: Nameservers Not Updating

**Check:**
- Did you save changes at registrar?
- Wait longer (can take up to 48 hours)
- Verify nameservers are correct (no typos)

**Verify:**
```bash
dig NS cursor-gtm-enablement-trainer.com
```

Should show:
```
emma.ns.cloudflare.com
henry.ns.cloudflare.com
```

### Issue: Domain Not Working After Nameserver Update

**Wait:**
- Nameserver changes take time to propagate
- Can take 15 minutes to 48 hours
- Check with dnschecker.org

**Check:**
- DNS records are added in Cloudflare
- A record points to `76.76.21.21`
- Proxy is OFF (gray cloud)

### Issue: "Invalid Nameservers" Error

**Solution:**
- Double-check nameservers are exactly:
  - `emma.ns.cloudflare.com`
  - `henry.ns.cloudflare.com`
- No typos or extra spaces
- Make sure both are entered

---

## 📋 Quick Checklist

- [ ] Nameservers updated at registrar: `emma.ns.cloudflare.com` and `henry.ns.cloudflare.com`
- [ ] Nameservers saved/activated
- [ ] Waited 15+ minutes for propagation
- [ ] Added A record in Cloudflare: `@` → `76.76.21.21`
- [ ] Set proxy to OFF (gray cloud)
- [ ] Added domain in Vercel Dashboard
- [ ] Verified nameservers with `dig NS` command
- [ ] Checked DNS propagation with dnschecker.org
- [ ] Domain shows "Valid" in Vercel
- [ ] Can access https://cursor-gtm-enablement-trainer.com

---

## 🎯 Current Status

**If you see these nameservers:**
- ✅ Domain is configured in Cloudflare
- ✅ Next step: Add DNS records
- ✅ Then: Add domain in Vercel

**If you need to update nameservers:**
- ⏳ Update at your registrar
- ⏳ Wait for propagation
- ⏳ Then add DNS records

---

## 💡 Quick Commands

```bash
# Check nameservers
dig NS cursor-gtm-enablement-trainer.com

# Check DNS resolution
dig cursor-gtm-enablement-trainer.com

# Check domain status
./check-domain-status.sh
```

---

## 🚀 Next Steps

1. **If nameservers are already set**: Add DNS records in Cloudflare
2. **If nameservers need updating**: Update at registrar first
3. **Then**: Add domain in Vercel
4. **Wait**: For propagation (15 min - 2 hours)
5. **Verify**: Domain is working!

---

**Your nameservers are ready!** Follow the steps above to complete the setup. 🎉

