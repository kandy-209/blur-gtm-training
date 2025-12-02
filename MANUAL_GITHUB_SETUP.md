# 🔗 Manual GitHub Setup for kandy-209

## Step 1: Create Repository on GitHub

1. Go to: **https://github.com/new**
2. **Repository name**: `cursor-gtm-training`
3. **Description**: `Cursor Enterprise GTM Training Platform`
4. Choose **Public** or **Private**
5. ⚠️ **DO NOT** check any of these:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

## Step 2: Configure Git (if not done)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 3: Connect and Push

Run these commands:

```bash
# Add remote
git remote add origin https://github.com/kandy-209/cursor-gtm-training.git

# Set main branch
git branch -M main

# Stage all files (already done)
git add .

# Create commit
git commit -m "Initial commit: Cursor GTM Training Platform"

# Push to GitHub
git push -u origin main
```

## Step 4: Authentication

When you run `git push`, you'll be prompted for credentials:

- **Username**: `kandy-209`
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### Get Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Vercel Deployment`
4. Select scope: **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

## Step 5: Connect Vercel to GitHub

After pushing successfully:

1. Go to: https://vercel.com/dashboard
2. Select project: **cursor-gtm-training**
3. Go to **Settings** → **Git**
4. Click **"Connect Git Repository"**
5. Select **GitHub**
6. Authorize Vercel (if prompted)
7. Select repository: **cursor-gtm-training**
8. Click **"Connect"**

## ✅ Done!

After connecting:
- ✅ Every push to `main` triggers automatic deployment
- ✅ Pull requests get preview deployments
- ✅ Vercel Analytics starts tracking
- ✅ Speed Insights monitors performance

## 🔗 Your Repository

Once pushed, your repo will be at:
**https://github.com/kandy-209/cursor-gtm-training**

