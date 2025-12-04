# Quick Deployment Guide 🚀

## Fastest Way: Deploy to Vercel (5 minutes)

### Step 1: Install Vercel CLI (if you want CLI deployment)
```bash
npm install -g vercel
```

### Step 2: Deploy via CLI
```bash
cd "/Users/lemonbear/Desktop/Blurred Lines"
vercel
```

Follow the prompts:
- Login to Vercel (or create account)
- Link to existing project or create new
- Deploy!

### OR: Deploy via GitHub (Recommended)

1. **Create GitHub Repository**:
   - Go to github.com
   - Click "New repository"
   - Name it (e.g., "cursor-gtm-training")
   - Create repository

2. **Push Code to GitHub**:
   ```bash
   cd "/Users/lemonbear/Desktop/Blurred Lines"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login (use GitHub)
   - Click "Add New Project"
   - Import your GitHub repository
   - **IMPORTANT**: Add Environment Variables:
     - `OPENAI_API_KEY` = your OpenAI key
     - `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` = agent_9101kb9t1120fjb84wgcem44dey2
     - `ELEVENLABS_API_KEY` = your ElevenLabs key (optional)
   - Click "Deploy"

4. **Done!** Your site will be live at `https://your-project.vercel.app`

---

## Environment Variables to Set

In Vercel Dashboard → Project Settings → Environment Variables:

```
OPENAI_API_KEY=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
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_9101kb9t1120fjb84wgcem44dey2
ELEVENLABS_API_KEY=your_elevenlabs_key_here (if you have one)
```

---

## Alternative: Deploy via Vercel CLI (No GitHub needed)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd "/Users/lemonbear/Desktop/Blurred Lines"
vercel

# Follow prompts:
# - Login/Create account
# - Link to project or create new
# - Set environment variables when prompted
# - Deploy!
```

After first deployment, use `vercel --prod` for production deployments.

---

## Your Site Will Be Live At:
- Production: `https://your-project-name.vercel.app`
- Preview: `https://your-project-name-git-branch.vercel.app`

---

## Need Help?
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

