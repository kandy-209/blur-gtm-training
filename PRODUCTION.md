# Production Deployment Guide

This guide covers deploying the Cursor GTM Training Platform to production.

## Prerequisites

- Node.js 20+ installed
- Vercel account (or your preferred hosting platform)
- Supabase account (or PostgreSQL database)
- OpenAI API key
- ElevenLabs API key (optional)

## Step 1: Set Up Production Database

### Option A: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations**
   ```sql
   -- Create user_responses table
   CREATE TABLE user_responses (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     scenario_id TEXT NOT NULL,
     turn_number INTEGER NOT NULL,
     objection_category TEXT NOT NULL,
     user_message TEXT NOT NULL,
     ai_response TEXT NOT NULL,
     evaluation TEXT NOT NULL CHECK (evaluation IN ('PASS', 'FAIL', 'REJECT')),
     confidence_score INTEGER NOT NULL CHECK (confidence_score >= 50 AND confidence_score <= 100),
     key_points_mentioned TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create technical_questions table
   CREATE TABLE technical_questions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     scenario_id TEXT NOT NULL,
     question TEXT NOT NULL,
     category TEXT NOT NULL,
     upvotes INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create indexes for performance
   CREATE INDEX idx_user_responses_user_id ON user_responses(user_id);
   CREATE INDEX idx_user_responses_scenario_id ON user_responses(scenario_id);
   CREATE INDEX idx_user_responses_objection_category ON user_responses(objection_category);
   CREATE INDEX idx_user_responses_created_at ON user_responses(created_at DESC);
   CREATE INDEX idx_technical_questions_scenario_id ON technical_questions(scenario_id);
   CREATE INDEX idx_technical_questions_category ON technical_questions(category);
   CREATE INDEX idx_technical_questions_upvotes ON technical_questions(upvotes DESC);

   -- Enable Row Level Security (optional but recommended)
   ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE technical_questions ENABLE ROW LEVEL SECURITY;

   -- Create policies (adjust based on your security needs)
   CREATE POLICY "Allow public read access" ON user_responses FOR SELECT USING (true);
   CREATE POLICY "Allow public insert" ON user_responses FOR INSERT WITH CHECK (true);
   CREATE POLICY "Allow public read access" ON technical_questions FOR SELECT USING (true);
   CREATE POLICY "Allow public insert" ON technical_questions FOR INSERT WITH CHECK (true);
   CREATE POLICY "Allow public update" ON technical_questions FOR UPDATE USING (true);
   ```

3. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

### Option B: PostgreSQL (Direct)

1. **Set up PostgreSQL database**
   - Use AWS RDS, Railway, Neon, or your preferred provider
   - Create database and user
   - Note connection string

2. **Run migrations** (same SQL as above)

3. **Install PostgreSQL client**
   ```bash
   npm install pg @types/pg
   ```

## Step 2: Update Database Implementation

Replace `src/lib/db.ts` with production database client. See `src/lib/db-production.ts.example` for reference.

## Step 3: Environment Variables

### Required Variables

Create `.env.production` or set in Vercel dashboard:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# ElevenLabs (optional)
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OR PostgreSQL (Direct)
DATABASE_URL=postgresql://user:password@host:5432/database

# CORS (comma-separated)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Node Environment
NODE_ENV=production
```

### Vercel Environment Variables Setup

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production environment
4. Redeploy after adding variables

## Step 4: Production Build Configuration

### Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Optimize images
  images: {
    domains: [],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Step 5: Deploy to Vercel

### Option A: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cursor-gtm-training.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables
   - Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 6: Post-Deployment Checklist

### Security
- [ ] All environment variables set
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS origins restricted
- [ ] Rate limiting configured
- [ ] Security headers verified
- [ ] API keys secured (never exposed to client)

### Database
- [ ] Database migrations run
- [ ] Connection pooling configured
- [ ] Backups enabled
- [ ] Indexes created
- [ ] Row Level Security policies set

### Monitoring
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Analytics (Vercel Analytics, Google Analytics)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (Vercel Logs, Datadog)

### Performance
- [ ] CDN configured (automatic on Vercel)
- [ ] Image optimization enabled
- [ ] Caching headers set
- [ ] Database queries optimized
- [ ] Bundle size analyzed

## Step 7: Monitoring & Analytics

### Add Error Tracking

1. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Initialize Sentry** (`sentry.client.config.js`):
   ```javascript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
     environment: process.env.NODE_ENV,
   });
   ```

### Add Analytics

1. **Vercel Analytics** (built-in)
   ```bash
   npm install @vercel/analytics
   ```

2. **Add to `app/layout.tsx`**:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Step 8: Database Migration Script

Create `scripts/migrate-to-production.ts`:

```typescript
// Script to migrate from in-memory to production database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Export data from in-memory database
// Import to Supabase
// Run this once before switching to production database
```

## Step 9: Production Optimizations

### Enable Caching

```typescript
// In API routes
export const revalidate = 3600; // Revalidate every hour
```

### Optimize Database Queries

- Use connection pooling
- Add database indexes
- Implement query caching
- Use pagination for large datasets

### Enable Compression

Already enabled in `next.config.js`, but verify:
- Gzip/Brotli compression
- Image optimization
- Font optimization

## Step 10: Backup Strategy

1. **Database Backups**
   - Supabase: Automatic daily backups
   - PostgreSQL: Set up automated backups

2. **Code Backups**
   - Git repository (GitHub/GitLab)
   - Regular commits

3. **Environment Variables**
   - Store securely (1Password, Vault)
   - Document in secure location

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version (20+)
   - Check build logs in Vercel

2. **Database Connection Errors**
   - Verify connection string
   - Check firewall rules
   - Ensure database is accessible

3. **API Rate Limits**
   - Monitor OpenAI usage
   - Implement request queuing
   - Add retry logic

4. **Performance Issues**
   - Check database indexes
   - Optimize API routes
   - Enable caching
   - Monitor bundle size

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI API**: https://platform.openai.com/docs

## Rollback Plan

If deployment fails:

1. **Revert Git commit**
   ```bash
   git revert HEAD
   git push
   ```

2. **Redeploy previous version in Vercel**
   - Go to Deployments
   - Click "..." on previous deployment
   - Select "Promote to Production"

3. **Restore database** (if needed)
   - Use database backup
   - Restore from snapshot

## Next Steps

After production deployment:

1. Monitor error rates
2. Track user engagement
3. Collect feedback
4. Iterate and improve
5. Scale infrastructure as needed

