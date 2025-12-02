# 🔐 Add Environment Variables to Vercel

## Quick Method: Use the Script

```bash
./add-env-vars.sh
```

This will guide you through adding all required variables interactively.

## Manual Method: Vercel Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your project: **cursor-gtm-training**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable

Click **"Add New"** for each variable below:

#### 1. OPENAI_API_KEY (Required)
- **Name:** `OPENAI_API_KEY`
- **Value:** Your OpenAI API key (starts with `sk-proj-`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Get it:** https://platform.openai.com/api-keys

#### 2. NEXT_PUBLIC_SUPABASE_URL (Required)
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Get it:** Supabase Dashboard → Settings → API → Project URL

#### 3. SUPABASE_SERVICE_ROLE_KEY (Required)
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service_role key
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Get it:** Supabase Dashboard → Settings → API → service_role key
- ⚠️ **Keep this secret!** Never commit to Git.

#### 4. NEXT_PUBLIC_ELEVENLABS_AGENT_ID (Optional)
- **Name:** `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- **Value:** Your ElevenLabs agent ID
- **Environment:** ✅ Production, ✅ Preview, ✅ Development
- **Get it:** ElevenLabs Dashboard

#### 5. NODE_ENV (Optional but Recommended)
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** ✅ Production only

#### 6. ALLOWED_ORIGINS (Optional)
- **Name:** `ALLOWED_ORIGINS`
- **Value:** Your domain (e.g., `https://yourdomain.com`) or leave empty
- **Environment:** ✅ Production

### Step 3: Save and Redeploy

1. Click **Save** after adding each variable
2. Go to **Deployments** tab
3. Click **...** on the latest deployment
4. Click **Redeploy**

## Using Vercel CLI

### Add Variables One by One

```bash
# OpenAI API Key
npx vercel env add OPENAI_API_KEY production
# Paste your key when prompted

# Supabase URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your URL when prompted

# Supabase Service Role Key
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your key when prompted

# ElevenLabs (optional)
npx vercel env add NEXT_PUBLIC_ELEVENLABS_AGENT_ID production
# Paste your agent ID when prompted
```

### Add to All Environments

For each variable, add it to all environments:

```bash
npx vercel env add VARIABLE_NAME production
npx vercel env add VARIABLE_NAME preview
npx vercel env add VARIABLE_NAME development
```

### Redeploy After Adding Variables

```bash
npx vercel --prod
```

## Getting Your Values

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-`)
5. ⚠️ Save it - you won't see it again!

### Supabase Credentials

**If you haven't set up Supabase yet:**

1. Go to https://supabase.com
2. Sign up/login
3. Click **"New Project"**
4. Fill in:
   - Name: `cursor-gtm-training`
   - Database Password: Create a strong password
   - Region: Choose closest to you
5. Wait 2-3 minutes for setup
6. Go to **SQL Editor** → **New Query**
7. Copy/paste contents of `scripts/migrate-database.sql`
8. Click **Run**
9. Go to **Settings** → **API**
10. Copy:
    - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
    - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**If you already have Supabase:**

1. Go to your Supabase dashboard
2. Settings → **API**
3. Copy **Project URL** and **service_role** key

### ElevenLabs Agent ID (Optional)

1. Go to ElevenLabs dashboard
2. Navigate to your agent/conversation settings
3. Copy the agent ID

## Verify Variables Are Set

```bash
# List all environment variables
npx vercel env ls

# Pull variables locally (for testing)
npx vercel env pull .env.local
```

## Troubleshooting

### Variables Not Working?

1. **Redeploy after adding variables** - Variables only apply to new deployments
2. **Check variable names** - Must match exactly (case-sensitive)
3. **Check environments** - Make sure variables are added to Production
4. **Check Vercel logs** - Look for errors in deployment logs

### Can't See Variables?

- Variables are hidden for security
- Use `npx vercel env ls` to see variable names (not values)
- Check Vercel dashboard → Settings → Environment Variables

## Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Never share API keys publicly
- ⚠️ Use different keys for development/production if possible
- ⚠️ Rotate keys if exposed

## Next Steps

After adding variables and redeploying:

1. ✅ Visit your site
2. ✅ Test role-play functionality
3. ✅ Check Supabase dashboard for saved data
4. ✅ Monitor Vercel logs for any errors
