#!/bin/bash

# Quick Git Setup Script
# This script helps you connect your project to a Git repository

echo "🔗 Git Repository Setup"
echo ""
echo "Choose your Git provider:"
echo "1) GitHub"
echo "2) GitLab"
echo "3) Bitbucket"
echo "4) Skip (manual setup)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    PROVIDER="github.com"
    ;;
  2)
    PROVIDER="gitlab.com"
    ;;
  3)
    PROVIDER="bitbucket.org"
    ;;
  4)
    echo "Skipping. See GIT_SETUP.md for manual instructions."
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
read -p "Enter your Git username: " username
read -p "Enter your repository name: " repo_name

REPO_URL="https://${PROVIDER}/${username}/${repo_name}.git"

echo ""
echo "Repository URL: ${REPO_URL}"
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "Setup cancelled."
  exit 1
fi

# Add remote
git remote add origin "${REPO_URL}" 2>/dev/null || git remote set-url origin "${REPO_URL}"

# Set main branch
git branch -M main

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: Cursor GTM Training Platform"

echo ""
echo "✅ Git setup complete!"
echo ""
echo "Next steps:"
echo "1. Create the repository on ${PROVIDER} (if it doesn't exist)"
echo "2. Run: git push -u origin main"
echo "3. Connect Vercel to your Git repository in the Vercel dashboard"
echo ""

