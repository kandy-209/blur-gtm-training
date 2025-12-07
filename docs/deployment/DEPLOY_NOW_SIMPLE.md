# 🚀 Deploy Now - Simple Steps

## Quick Deploy (2 minutes)

### Step 1: Install & Login to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# OR use npx (no install needed)
npx vercel login
```

### Step 2: Deploy

```bash
# From your project directory
cd "/Users/lemonbear/Desktop/Blurred Lines"

# Deploy to production
npx vercel --prod
```

**During deployment, Vercel will ask:**
- Set up and deploy? → **Yes**
- Which scope? → Choose your account
- Link to existing project? → **No** (first time)
- Project name? → Press Enter (uses folder name)
- Directory? → **./** (press Enter)
- Override settings? → **No**

### Step 3: Add Environment Variables

After deployment, you'll get a URL. Then:

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add these (one by one):

```
OPENAI_API_KEY
Value: sk-proj-your-openai-key-here

NEXT_PUBLIC_SUPABASE_URL  
Value: https://your-project.supabase.co

SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key-here

NEXT_PUBLIC_ELEVENLABS_AGENT_ID
Value: your-agent-id (optional)

NODE_ENV
Value: production
```

5. Click **Save** for each
6. Go to **Deployments** tab
7. Click **...** on latest deployment → **Redeploy**

### Step 4: Test

Visit your site URL (shown after deployment) and test!

## ⚠️ Before Deploying - Do You Have?

- [ ] Supabase database set up? (If not, see below)
- [ ] OpenAI API key? (Get from platform.openai.com)

### Quick Supabase Setup (5 min)

1. Go to https://supabase.com → Sign up
2. Create new project
3. Go to **SQL Editor** → **New Query**
4. Copy/paste contents of `scripts/migrate-database.sql`
5. Click **Run**
6. Go to **Settings** → **API**
7. Copy **Project URL** and **service_role** key

## 🎯 That's It!

Your site will be live at: `your-project.vercel.app`

