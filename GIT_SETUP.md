# Git Repository Setup

## ✅ Git Initialized

Git repository has been initialized in your project.

## 🔗 Connect to GitHub/GitLab/Bitbucket

### Option 1: Create a new repository on GitHub

1. Go to https://github.com/new
2. Create a new repository (e.g., `cursor-gtm-training`)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL

Then run:
```bash
git remote add origin <your-repo-url>
git branch -M main
git add .
git commit -m "Initial commit: Cursor GTM Training Platform"
git push -u origin main
```

### Option 2: Connect to existing repository

```bash
git remote add origin <your-repo-url>
git branch -M main
git add .
git commit -m "Initial commit: Cursor GTM Training Platform"
git push -u origin main
```

## 🔗 Connect Vercel to Git Repository

### Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: `cursor-gtm-training`
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select your Git provider (GitHub/GitLab/Bitbucket)
6. Authorize Vercel to access your repositories
7. Select your repository
8. Click **Connect**

### Via Vercel CLI

```bash
vercel git connect
```

This will:
- Link your local project to a Git repository
- Enable automatic deployments on push
- Set up preview deployments for pull requests

## 📋 Next Steps

After connecting:
- ✅ Every push to `main` will trigger a production deployment
- ✅ Pull requests will get preview deployments
- ✅ Vercel Analytics is now enabled (see below)

## 🎯 Benefits

- **Automatic Deployments**: Every push deploys automatically
- **Preview Deployments**: Test changes before merging
- **Rollback**: Easy rollback to previous deployments
- **Collaboration**: Team members can deploy via Git

