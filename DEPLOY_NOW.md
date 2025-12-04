# 🚀 Deploy Now - Quick Guide

## ✅ Pre-Deployment Checklist

- ✅ All code committed and pushed to GitHub
- ✅ Repository: `https://github.com/kandy-209/cursor-gtm-training`
- ✅ Branch: `main`
- ✅ Latest commit: `a40bdff` - Caching system, ElevenLabs improvements
- ✅ Tests passing
- ✅ Dependencies upgraded

## 🚀 Deploy to Production (Choose One)

### Option 1: Vercel Dashboard (Easiest - 5 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose: `kandy-209/cursor-gtm-training`
   - Click "Import"

3. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Click "Deploy"

4. **Add Environment Variables** (After first deployment)
   - Go to Project → Settings → Environment Variables
   - Add:
     ```
     OPENAI_API_KEY=your-key
     NEXT_PUBLIC_SUPABASE_URL=your-url
     SUPABASE_SERVICE_ROLE_KEY=your-key
     NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-id (optional)
     NODE_ENV=production
     ```
   - Redeploy after adding variables

5. **Your site will be live at**: `https://cursor-gtm-training.vercel.app`

---

### Option 2: Vercel CLI (2 minutes)

```powershell
# 1. Login to Vercel
vercel login

# 2. Visit the URL shown and authenticate
# 3. Then deploy:
vercel --prod --yes
```

**During deployment:**
- Set up and deploy? → **Yes**
- Which scope? → Choose your account
- Link to existing project? → **No** (first time)
- Project name? → Press Enter (uses `cursor-gtm-training`)
- Directory? → **./** (press Enter)
- Override settings? → **No**

---

### Option 3: GitHub Actions (If configured)

If you have Vercel secrets configured in GitHub:
- Push to `main` branch triggers auto-deployment
- Check: https://github.com/kandy-209/cursor-gtm-training/actions

---

## 📝 Environment Variables Needed

After deployment, add these in Vercel Dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs agent ID | No |
| `NODE_ENV` | Environment | Yes (set to `production`) |

---

## ✅ Post-Deployment Checklist

- [ ] Visit your live URL
- [ ] Test main features
- [ ] Verify environment variables are set
- [ ] Check Vercel Analytics
- [ ] Monitor error logs

---

## 🎯 Quick Start

**Fastest way:**
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import `kandy-209/cursor-gtm-training`
4. Click "Deploy"
5. Done! 🎉

Your app will be live in ~2 minutes!
