#!/bin/bash

# Complete GitHub Setup Script
# This will create the repo and push everything automatically

set -e

GITHUB_USERNAME="kandy-209"
REPO_NAME="cursor-gtm-training"

echo "🚀 Complete GitHub Setup"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
  echo "✅ GitHub CLI found"
  
  # Check if authenticated
  if gh auth status &> /dev/null; then
    echo "✅ GitHub CLI authenticated"
    echo ""
    echo "📦 Creating repository and pushing code..."
    
    # Create repo and push
    gh repo create "$REPO_NAME" \
      --public \
      --source=. \
      --remote=origin \
      --push \
      --description "Cursor Enterprise GTM Training Platform"
    
    echo ""
    echo "🎉 Success! Repository created and code pushed!"
    echo "🔗 https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    
  else
    echo "⚠️  GitHub CLI not authenticated"
    echo ""
    echo "Please authenticate first:"
    echo "  gh auth login"
    echo ""
    echo "Then run this script again."
    exit 1
  fi
  
else
  echo "⚠️  GitHub CLI not installed"
  echo ""
  echo "Installing GitHub CLI..."
  echo ""
  
  # Try to install via different methods
  if command -v brew &> /dev/null; then
    echo "Installing via Homebrew..."
    brew install gh
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Please install GitHub CLI manually:"
    echo "  brew install gh"
    echo "  gh auth login"
    echo "  Then run this script again"
    exit 1
  else
    echo "Please install GitHub CLI:"
    echo "  Visit: https://cli.github.com/"
    exit 1
  fi
fi

echo ""
echo "📊 Next: Connect Vercel to GitHub"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select: cursor-gtm-training"
echo "3. Settings → Git → Connect Git Repository"
echo "4. Select GitHub → cursor-gtm-training"

