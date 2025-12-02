# Deployment Guide

This guide will help you deploy the Cursor GTM Training Platform to production.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the easiest deployment experience.

#### Steps:

1. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional, for TTS)
     NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_9101kb9t1120fjb84wgcem44dey2
     ```
   - Redeploy after adding variables

4. **Your site will be live at**: `https://your-project.vercel.app`

---

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

---

### Option 3: Railway

1. **Push to GitHub**

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables
   - Railway will auto-detect Next.js and deploy

---

### Option 4: Manual Deployment (VPS/Server)

If you have your own server:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Use a process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start npm --name "cursor-training" -- start
   pm2 save
   pm2 startup
   ```

4. **Set up reverse proxy** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Environment Variables Required

Make sure to set these in your hosting platform:

### Required:
- `OPENAI_API_KEY` - Your OpenAI API key for GPT-4 and Whisper

### Optional (for voice features):
- `ELEVENLABS_API_KEY` - ElevenLabs API key for text-to-speech
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - Your ElevenLabs Conversational AI agent ID

---

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Site is accessible via HTTPS
- [ ] Test voice features (microphone permissions)
- [ ] Test role-play scenarios
- [ ] Verify analytics tracking
- [ ] Check mobile responsiveness

---

## Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check Node.js version (requires 18+)
- Review build logs for specific errors

### Environment Variables Not Working
- Restart/redeploy after adding variables
- Check variable names match exactly
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

### Voice Features Not Working
- Check browser console for errors
- Verify API keys are set correctly
- Ensure HTTPS is enabled (required for microphone access)

---

## Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

---

## Need Help?

- Check the [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Review platform-specific documentation
- Check application logs in your hosting platform dashboard

