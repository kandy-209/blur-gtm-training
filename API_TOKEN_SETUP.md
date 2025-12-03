# 🔑 Cloudflare API Token Setup

## Current Status

✅ **API Token Verified**: Token is valid and active
⚠️ **DNS Permissions**: Token may need additional permissions

## Required Token Permissions

For automated DNS management, your Cloudflare API token needs:

### Minimum Permissions:
- **Zone** → **DNS** → **Edit**
- **Zone** → **Zone** → **Read**

### How to Update Token Permissions:

1. **Go to Cloudflare API Tokens**
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Find your token (or create a new one)

2. **Edit Token Permissions**
   - Click **Edit** on your token
   - Under **Permissions**, set:
     - **Zone** → **DNS** → **Edit**
     - **Zone** → **Zone** → **Read**
   - Under **Zone Resources**, select:
     - **Include** → **Specific zone** → `cursorsalestrainer.com`
   - Click **Continue to summary**
   - Click **Create Token**

3. **Use New Token**
   - Copy the new token
   - Update the script with the new token

---

## Alternative: Manual Setup (Easier)

If API token setup is complicated, you can manually add the DNS record:

### Quick Manual Steps:

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Click: `cursorsalestrainer.com`

2. **Add DNS Record**
   - Click **DNS** (left sidebar)
   - Click **Add record**
   - Fill in:
     - **Type**: `A`
     - **Name**: `@`
     - **IPv4**: `76.76.21.21`
     - **Proxy**: OFF (gray cloud)
   - Click **Save**

**Takes only 2 minutes!**

---

## Current Token Status

- ✅ Token is valid
- ⚠️ May need DNS Edit permissions
- ⚠️ May need zone-specific permissions

---

## Recommendation

**Easier approach**: Add DNS record manually in Cloudflare Dashboard (2 minutes)
**Then**: Add domain in Vercel Dashboard (2 minutes)
**Total**: 4 minutes vs troubleshooting API permissions

See `QUICK_ACTIONS.md` for step-by-step manual instructions.

