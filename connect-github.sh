#!/bin/bash

# GitHub Connection Script
# This script helps you connect your project to GitHub

set -e

echo "🔗 Connecting to GitHub"
echo ""

# Check if git is configured
if ! git config --get user.name > /dev/null 2>&1; then
  echo "⚠️  Git is not configured. Let's set it up:"
  read -p "Enter your name: " git_name
  read -p "Enter your email: " git_email
  git config user.name "$git_name"
  git config user.email "$git_email"
  echo "✅ Git configured!"
  echo ""
fi

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
  echo "⚠️  Remote 'origin' already exists:"
  git remote get-url origin
  read -p "Do you want to update it? (y/n): " update_remote
  if [ "$update_remote" != "y" ]; then
    echo "Keeping existing remote."
    exit 0
  fi
fi

echo "📝 Step 1: Create a repository on GitHub"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: cursor-gtm-training (or your preferred name)"
echo "3. Choose Public or Private"
echo "4. DO NOT check 'Add a README file'"
echo "5. Click 'Create repository'"
echo ""
read -p "Press Enter after you've created the repository..."

echo ""
echo "📋 Step 2: Enter your repository details"
echo ""
read -p "Enter your GitHub username: " github_username
read -p "Enter your repository name [cursor-gtm-training]: " repo_name
repo_name=${repo_name:-cursor-gtm-training}

REPO_URL="https://github.com/${github_username}/${repo_name}.git"

echo ""
echo "Repository URL: ${REPO_URL}"
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "Setup cancelled."
  exit 1
fi

# Add or update remote
if git remote get-url origin > /dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
  echo "✅ Updated remote URL"
else
  git remote add origin "$REPO_URL"
  echo "✅ Added remote URL"
fi

# Set main branch
git branch -M main 2>/dev/null || true

# Stage all files
echo ""
echo "📦 Staging all files..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
  echo "✅ All files already committed"
else
  echo "💾 Creating initial commit..."
  git commit -m "Initial commit: Cursor GTM Training Platform with Vercel Analytics"
  echo "✅ Commit created!"
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo "You may be prompted for your GitHub credentials."
echo ""

# Try to push
if git push -u origin main; then
  echo ""
  echo "✅ Successfully pushed to GitHub!"
  echo ""
  echo "🔗 Repository URL: https://github.com/${github_username}/${repo_name}"
  echo ""
  echo "📊 Next Steps:"
  echo "1. Go to: https://vercel.com/dashboard"
  echo "2. Select your project: cursor-gtm-training"
  echo "3. Go to Settings → Git"
  echo "4. Click 'Connect Git Repository'"
  echo "5. Select GitHub and authorize"
  echo "6. Select your repository: ${repo_name}"
  echo ""
else
  echo ""
  echo "❌ Push failed. This might be because:"
  echo "1. Authentication required (use GitHub CLI or Personal Access Token)"
  echo "2. Repository doesn't exist yet"
  echo ""
  echo "Try these solutions:"
  echo ""
  echo "Option A: Install GitHub CLI"
  echo "  brew install gh"
  echo "  gh auth login"
  echo "  git push -u origin main"
  echo ""
  echo "Option B: Use Personal Access Token"
  echo "  1. Go to: https://github.com/settings/tokens"
  echo "  2. Generate new token (classic) with 'repo' scope"
  echo "  3. Use token as password when pushing"
  echo ""
  echo "Option C: Manual push"
  echo "  git push -u origin main"
  echo "  (Enter your GitHub username and password/token)"
fi

