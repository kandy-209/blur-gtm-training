#!/bin/bash

# GitHub Setup Script for kandy-209
# Repository: cursor-gtm-training

set -e

GITHUB_USERNAME="kandy-209"
REPO_NAME="cursor-gtm-training"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🔗 Setting up GitHub connection for ${GITHUB_USERNAME}"
echo ""

# Configure git if needed
if ! git config --get user.name > /dev/null 2>&1; then
  echo "📝 Configuring Git..."
  read -p "Enter your name for git commits: " git_name
  read -p "Enter your email for git commits: " git_email
  git config user.name "$git_name"
  git config user.email "$git_email"
  echo "✅ Git configured!"
  echo ""
fi

echo "📋 Repository Details:"
echo "  Username: ${GITHUB_USERNAME}"
echo "  Repository: ${REPO_NAME}"
echo "  URL: ${REPO_URL}"
echo ""

echo "📝 Step 1: Create the repository on GitHub"
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Open: https://github.com/new"
echo "2. Repository name: ${REPO_NAME}"
echo "3. Description: Cursor Enterprise GTM Training Platform"
echo "4. Choose Public or Private"
echo "5. ⚠️  DO NOT check 'Add a README file'"
echo "6. ⚠️  DO NOT check 'Add .gitignore'"
echo "7. ⚠️  DO NOT check 'Choose a license'"
echo "8. Click 'Create repository'"
echo ""
read -p "Press Enter after you've created the repository on GitHub..."

echo ""
echo "🔗 Step 2: Connecting to GitHub..."
echo ""

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
  current_url=$(git remote get-url origin)
  if [ "$current_url" != "$REPO_URL" ]; then
    echo "⚠️  Remote 'origin' exists with different URL:"
    echo "   ${current_url}"
    read -p "Update to ${REPO_URL}? (y/n): " update
    if [ "$update" = "y" ]; then
      git remote set-url origin "$REPO_URL"
      echo "✅ Updated remote URL"
    else
      echo "Keeping existing remote."
      REPO_URL="$current_url"
    fi
  else
    echo "✅ Remote already configured correctly"
  fi
else
  git remote add origin "$REPO_URL"
  echo "✅ Added remote: ${REPO_URL}"
fi

# Set main branch
git branch -M main 2>/dev/null || true
echo "✅ Set branch to 'main'"

# Stage all files
echo ""
echo "📦 Staging all files..."
git add .
echo "✅ Files staged"

# Check if there are changes to commit
if git diff --cached --quiet 2>/dev/null; then
  echo "✅ All files already committed"
else
  echo ""
  echo "💾 Creating initial commit..."
  git commit -m "Initial commit: Cursor GTM Training Platform

- Next.js 15 with TypeScript
- Vercel Analytics & Speed Insights
- Supabase integration
- AI-powered role-play engine
- Permission-aware chatbot
- Live peer-to-peer role-play
- Analytics dashboard
- Leaderboard system"
  echo "✅ Commit created!"
fi

echo ""
echo "🚀 Step 3: Pushing to GitHub..."
echo ""
echo "You'll be prompted for authentication."
echo "If you have 2FA enabled, use a Personal Access Token as your password."
echo ""
echo "Get a token at: https://github.com/settings/tokens"
echo ""

# Try to push
if git push -u origin main; then
  echo ""
  echo "🎉 Successfully pushed to GitHub!"
  echo ""
  echo "🔗 Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
  echo ""
  echo "📊 Next Steps:"
  echo ""
  echo "1. Connect Vercel to GitHub:"
  echo "   - Go to: https://vercel.com/dashboard"
  echo "   - Select: cursor-gtm-training"
  echo "   - Settings → Git → Connect Git Repository"
  echo "   - Select GitHub → ${REPO_NAME}"
  echo ""
  echo "2. Enable automatic deployments:"
  echo "   - Every push to 'main' will auto-deploy"
  echo "   - Pull requests get preview deployments"
  echo ""
  echo "3. View analytics:"
  echo "   - Vercel Dashboard → Analytics"
  echo ""
else
  echo ""
  echo "❌ Push failed. Common solutions:"
  echo ""
  echo "Option A: Use Personal Access Token"
  echo "  1. Go to: https://github.com/settings/tokens"
  echo "  2. Generate new token (classic)"
  echo "  3. Select 'repo' scope"
  echo "  4. Copy token"
  echo "  5. When prompted for password, paste token"
  echo ""
  echo "Option B: Install GitHub CLI"
  echo "  brew install gh"
  echo "  gh auth login"
  echo "  git push -u origin main"
  echo ""
  echo "Option C: Try again"
  echo "  git push -u origin main"
  echo ""
fi

