# 🚀 Deployment Steps - Follow These Now!

## Quick Deploy (Choose One Method)

### Method 1: Vercel CLI (Fastest - 2 minutes)

```bash
# 1. Install Vercel CLI (if not installed)
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy!
vercel --prod
```

**After deployment:**
- Go to Vercel dashboard → Your project → Settings → Environment Variables
- Add these variables:
  - `OPENAI_API_KEY` = your OpenAI key
  - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
  - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase key
  - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` = your agent ID (optional)
- Redeploy: `vercel --prod` or use dashboard

### Method 2: GitHub + Vercel (Recommended - 5 minutes)

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository
5. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. Click **"Environment Variables"**
7. Add each variable:
   ```
   OPENAI_API_KEY = sk-proj-your-key
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID = your-agent-id (optional)
   ALLOWED_ORIGINS = (leave empty or add your domain)
   NODE_ENV = production
   ```
8. Click **"Deploy"**

### Method 3: Use Deployment Script

```bash
npm run deploy
```

This will:
- Check/build your app
- Deploy to Vercel
- Guide you through next steps

## ⚠️ Before Deploying - Do You Have?

### Required:
- [ ] **Supabase Database Set Up**
  - Created project at supabase.com
  - Ran `scripts/migrate-database.sql` in SQL Editor
  - Have URL and service role key

- [ ] **OpenAI API Key**
  - Get from https://platform.openai.com/api-keys
  - Make sure you have credits

### Optional:
- [ ] **ElevenLabs Agent ID** (for voice features)
- [ ] **Custom Domain** (can add later)

## 🎯 After Deployment

1. **Visit your site**: `your-project.vercel.app`
2. **Test functionality**:
   - Navigate to scenarios
   - Try a role-play session
   - Check if data saves to Supabase
3. **Verify database**:
   - Go to Supabase dashboard
   - Check Tables → user_responses
   - Should see data after testing

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set in Vercel
- Check build logs in Vercel dashboard
- Ensure Node.js 20+ is selected

### Database Connection Fails
- Verify Supabase URL and key are correct
- Check Supabase dashboard → Settings → API
- Ensure RLS policies allow access

### Site Works But No Data Saves
- Check Supabase credentials in environment variables
- Verify migration script was run
- Check Vercel function logs for errors

## 📞 Need Help?

- Check `DEPLOY_NOW.md` for detailed steps
- Check `PRODUCTION.md` for comprehensive guide
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs

