# 🚀 Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub** (if using git):
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

### Option 3: Use Deploy Script

```bash
npm run deploy
```

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional:
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - For voice features
- `ELEVENLABS_API_KEY` - For voice features

## Post-Deployment Checklist

- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Test role-play functionality
- [ ] Test analytics dashboard
- [ ] Verify database connection
- [ ] Test ML learning features

## Current Status

✅ Build successful
✅ All tests passing (124/124)
✅ Ready for deployment
