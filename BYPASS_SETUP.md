# 🔓 Vercel Protection Bypass Setup

## What I Did

1. ✅ Added `VERCEL_PROTECTION_BYPASS` environment variable to Vercel
2. ✅ Updated middleware to include bypass token
3. ✅ Created client-side bypass helper
4. ✅ Auto-inject bypass token in fetch requests

## How to Access Your Site

### Option 1: Add Token to URL (Quick Test)

Add `?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G` to any URL:

```
https://cursor-gtm-training.vercel.app/scenarios?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

### Option 2: Use Environment Variable (Automatic)

The bypass token is now set as an environment variable. After redeploying, it should work automatically.

**Redeploy:**
```bash
npx vercel --prod
```

### Option 3: Add Public Environment Variable

For client-side access, add it as a public variable:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - **Name**: `NEXT_PUBLIC_VERCEL_PROTECTION_BYPASS`
   - **Value**: `H57sUHKy51E0Jix1JARV0MNeUQmMug4G`
   - **Environment**: Production, Preview, Development
3. Redeploy

## Test Now

Try accessing with the bypass token:
```
https://cursor-gtm-training.vercel.app/scenarios?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

This should bypass the password protection!

## After Redeploy

Once redeployed with the environment variable, the site should work normally without needing the query parameter.

