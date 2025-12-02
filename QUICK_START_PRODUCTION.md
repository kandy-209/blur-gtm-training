# Quick Start: Production Deployment

## 5-Minute Production Setup

### Step 1: Set Up Database (2 minutes)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for database to initialize

2. **Run Migration**
   - Open Supabase SQL Editor
   - Copy contents of `scripts/migrate-database.sql`
   - Run the script
   - Note your project URL and service role key

### Step 2: Configure Environment Variables (1 minute)

1. **In Supabase Dashboard:**
   - Settings → API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

2. **Get OpenAI Key:**
   - [platform.openai.com](https://platform.openai.com)
   - API Keys → Create new key
   - Copy → `OPENAI_API_KEY`

### Step 3: Deploy to Vercel (2 minutes)

**Option A: GitHub + Vercel (Recommended)**

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Click "New Project"
# - Import GitHub repo
# - Add environment variables:
#   - OPENAI_API_KEY
#   - NEXT_PUBLIC_SUPABASE_URL
#   - SUPABASE_SERVICE_ROLE_KEY
#   - NEXT_PUBLIC_ELEVENLABS_AGENT_ID (optional)
# - Deploy
```

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy with environment variables
vercel --prod \
  -e OPENAI_API_KEY=your-key \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Step 4: Switch to Production Database

1. **Update `src/lib/db.ts`:**
   ```typescript
   // Replace the import at the top:
   // import { db } from './db-production';
   // export { db };
   ```

2. **Or create `src/lib/db.ts`:**
   ```typescript
   // Copy from db-production.ts.example
   // Update with your Supabase credentials
   ```

3. **Redeploy:**
   ```bash
   git add .
   git commit -m "Switch to production database"
   git push
   ```

### Step 5: Verify Deployment

1. **Check Site:**
   - Visit your Vercel URL
   - Test role-play functionality
   - Check analytics page

2. **Check Database:**
   - Go to Supabase Dashboard
   - Check Tables → user_responses
   - Verify data is being saved

3. **Monitor:**
   - Vercel Dashboard → Logs
   - Check for errors
   - Monitor API usage

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Node.js version (20+)
- Check build logs in Vercel

### Database Connection Fails
- Verify Supabase URL and key
- Check firewall settings
- Ensure RLS policies allow access

### API Errors
- Check OpenAI API key
- Verify rate limits
- Check API logs in Vercel

## Next Steps

- [ ] Set up custom domain
- [ ] Configure monitoring (Sentry)
- [ ] Set up backups
- [ ] Review security settings
- [ ] Monitor performance

## Support

- **Documentation**: See `PRODUCTION.md` for detailed guide
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

