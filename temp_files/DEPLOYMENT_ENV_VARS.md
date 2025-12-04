# 🔐 Environment Variables for Deployment

## Required Variables

### Core APIs
```
OPENAI_API_KEY=sk-proj-your-key-here
```

### Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## Optional Variables

### Voice Features
```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_API_KEY=your-elevenlabs-key
```

### Financial Data (Alpha Vantage)
```
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

### Company Enrichment
```
CLEARBIT_API_KEY=your-clearbit-key
```

### News & Sentiment
```
NEWS_API_KEY=your-newsapi-key
```

### Caching (Redis - Optional)
```
REDIS_URL=redis://your-redis-url:6379
```
*Note: Cache system works without Redis (falls back to memory)*

### Other
```
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## How to Add in Vercel

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name:** Variable name (e.g., `OPENAI_API_KEY`)
   - **Value:** Your actual key/value
   - **Environment:** Select `Production`, `Preview`, `Development` (or all)
4. Click **Save**
5. Go to **Deployments** → Click **...** → **Redeploy**

---

## Quick Setup Script

Run this to check which variables you have:
```cmd
npm run api-keys:check
```

Or setup interactively:
```cmd
npm run api-keys:setup
```


