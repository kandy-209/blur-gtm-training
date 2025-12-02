# 🔓 Access Your Site with Bypass Token

## Quick Access (Right Now)

Add the bypass token to any URL as a query parameter:

**Scenarios Page:**
```
https://cursor-gtm-training.vercel.app/scenarios?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

**Roleplay Page:**
```
https://cursor-gtm-training.vercel.app/roleplay/SKEPTIC_VPE_001?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

**Home Page:**
```
https://cursor-gtm-training.vercel.app/?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

## What I've Done

1. ✅ Added bypass token to environment variables
2. ✅ Created `BypassProtection` component that automatically adds token to URLs
3. ✅ Updated layout to include bypass component
4. ✅ Redeployed with bypass support

## After Latest Deployment

The new deployment should automatically:
- Add bypass token to URLs when you visit
- Include token in all API requests
- Set cookie for persistent access

**New Deployment URL:**
https://cursor-gtm-training-kj3qj3luh-andrewkosel93-1443s-projects.vercel.app

Try it with the bypass token:
```
https://cursor-gtm-training-kj3qj3luh-andrewkosel93-1443s-projects.vercel.app/scenarios?x-vercel-protection-bypass=H57sUHKy51E0Jix1JARV0MNeUQmMug4G
```

## How It Works

The `BypassProtection` component:
1. Checks if bypass token is in URL
2. If not, redirects to same URL with token added
3. Sets cookie for API requests
4. Overrides `fetch` to add token to all requests

## Test It

1. Visit any URL with the bypass token
2. The page should load (no password prompt)
3. Click "Start Scenario" - should work!
4. Try role-play functionality

The site should now be accessible!

