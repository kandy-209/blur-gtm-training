# 🔧 Domain Error Troubleshooting Guide

## Common Domain Errors and Solutions

### 1. DNS Not Configured Error

**Error**: Domain not resolving, DNS not found

**Solution**:
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain: `cursor-gtm-enablement-trainer.com`
3. Configure DNS at your registrar:
   - **A Record**: `@` → `76.76.21.21`
   - **OR CNAME**: `@` → `cname.vercel-dns.com`
4. Wait 15 minutes to 48 hours for DNS propagation

**Check Status**:
```bash
./check-domain-status.sh
```

---

### 2. Domain Verification Failed

**Error**: "Domain verification failed" in Vercel

**Solution**:
1. Make sure DNS records are correctly configured
2. Wait for DNS propagation (can take up to 48 hours)
3. Check DNS propagation: https://dnschecker.org
4. Verify record values match exactly what Vercel shows

---

### 3. SSL Certificate Error

**Error**: "SSL certificate not available" or HTTPS not working

**Solution**:
- Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after DNS propagates
- SSL certificates are free and automatic
- Check status in Vercel Dashboard → Domains → SSL

---

### 4. Domain Already in Use

**Error**: "Domain is already configured for another project"

**Solution**:
1. Check if domain is used in another Vercel project
2. Remove domain from the other project first
3. Then add it to this project

---

### 5. Invalid DNS Configuration

**Error**: "Invalid DNS configuration" or "DNS records not found"

**Solution**:
1. Double-check DNS record values:
   - A record: Must point to `76.76.21.21`
   - CNAME: Must point to `cname.vercel-dns.com`
2. Make sure record name is `@` or root (not `www` or subdomain)
3. Wait for DNS propagation
4. Use DNS checker: https://dnschecker.org

---

### 6. Domain Not Accessible After Configuration

**Error**: Domain configured but not loading

**Checklist**:
- [ ] DNS records added at registrar
- [ ] DNS propagated (check with dnschecker.org)
- [ ] Domain shows "Valid" in Vercel Dashboard
- [ ] SSL certificate provisioned (check in Vercel)
- [ ] Waited at least 15 minutes after DNS configuration

**Debug Steps**:
```bash
# Check DNS resolution
dig cursor-gtm-enablement-trainer.com

# Check HTTP status
curl -I https://cursor-gtm-enablement-trainer.com

# Run status checker
./check-domain-status.sh
```

---

### 7. CORS/Origin Errors

**Error**: CORS errors or origin not allowed

**Solution**:
1. Update `ALLOWED_ORIGINS` environment variable in Vercel:
   - Go to Settings → Environment Variables
   - Add/Update: `ALLOWED_ORIGINS`
   - Value: `https://cursor-gtm-enablement-trainer.com,https://www.cursor-gtm-enablement-trainer.com`
   - Redeploy after updating

**Note**: If `ALLOWED_ORIGINS` is not set, the app defaults to allowing all origins (`*`), so this is optional.

---

### 8. Build Errors Related to Domain

**Error**: Build fails with domain-related errors

**Solution**:
- Domain configuration doesn't affect builds
- Build errors are usually code/dependency issues
- Check build logs in Vercel Dashboard → Deployments

---

## Quick Diagnostic Commands

```bash
# Check domain status
./check-domain-status.sh

# Check DNS resolution
dig cursor-gtm-enablement-trainer.com @8.8.8.8

# Check HTTP connectivity
curl -I https://cursor-gtm-enablement-trainer.com

# Check SSL certificate
openssl s_client -connect cursor-gtm-enablement-trainer.com:443 -servername cursor-gtm-enablement-trainer.com
```

---

## Vercel Dashboard Checks

1. **Settings → Domains**
   - Is domain listed?
   - What's the status? (Pending/Valid/Invalid)
   - Any error messages?

2. **Deployments**
   - Are deployments succeeding?
   - Check latest deployment logs

3. **Environment Variables**
   - Is `ALLOWED_ORIGINS` set? (optional)
   - Are other required variables set?

---

## Still Having Issues?

1. **Check Vercel Status**: https://vercel-status.com
2. **Contact Vercel Support**: https://vercel.com/support
3. **Check DNS Propagation**: https://dnschecker.org
4. **Review Vercel Docs**: https://vercel.com/docs/concepts/projects/domains

---

## Current Domain Status

Run this to check current status:
```bash
./check-domain-status.sh
```

