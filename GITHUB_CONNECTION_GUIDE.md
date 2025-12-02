# 🔗 Connect to GitHub - Step by Step Guide

## Option 1: Using GitHub CLI (Fastest) ⚡

If you have GitHub CLI installed:

```bash
# Authenticate (if not already)
gh auth login

# Create repository and push
gh repo create cursor-gtm-training --public --source=. --remote=origin --push
```

## Option 2: Manual Setup (Step by Step) 📝

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `cursor-gtm-training` (or your preferred name)
3. Description: "Cursor Enterprise GTM Training Platform"
4. Choose **Public** or **Private**
5. **DO NOT** check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **Create repository**

### Step 2: Copy Repository URL

After creating, GitHub will show you a URL like:
- `https://github.com/YOUR_USERNAME/cursor-gtm-training.git`

Copy this URL!

### Step 3: Connect Local Repository

Run these commands (replace with your actual URL):

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/cursor-gtm-training.git

# Set main branch
git branch -M main

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Cursor GTM Training Platform"

# Push to GitHub
git push -u origin main
```

### Step 4: Verify Connection

```bash
git remote -v
```

You should see your GitHub URL.

## Option 3: Interactive Script 🎯

Run the interactive script:

```bash
./QUICK_GIT_SETUP.sh
```

Follow the prompts!

## 🔗 Connect Vercel to GitHub

After pushing to GitHub:

1. Go to https://vercel.com/dashboard
2. Select your project: `cursor-gtm-training`
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select **GitHub**
6. Authorize Vercel (if prompted)
7. Select your repository: `cursor-gtm-training`
8. Click **Connect**

## ✅ Benefits After Connection

- ✅ **Automatic Deployments**: Every push to `main` deploys automatically
- ✅ **Preview Deployments**: Pull requests get preview URLs
- ✅ **Rollback**: Easy rollback to previous versions
- ✅ **Analytics**: Vercel Analytics will start tracking

## 🆘 Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use GitHub CLI
gh auth login

# Or use Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPO.git
```

### Push Errors

If push fails:

```bash
# Pull first (if repo has content)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

## 📚 Need Help?

- [GitHub Docs](https://docs.github.com/en/get-started)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)

