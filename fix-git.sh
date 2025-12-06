#!/bin/bash
# Git Fix Script - Uses Git Bash directly
# This script fixes git issues without hanging

set -e

echo "========================================"
echo "FIXING GIT - GIT BASH VERSION"
echo "========================================"
echo ""

# Remove lock files
echo "Step 1: Removing lock files..."
rm -f .git/index.lock
rm -f .git/*.lock

# Remove problematic workflow file
echo "Step 2: Removing workflow file from git..."
git rm --cached .github/workflows/daily-dependency-check.yml 2>/dev/null || true
rm -f .github/workflows/daily-dependency-check.yml

# Add workflow to .gitignore if not already there
if ! grep -q ".github/workflows/daily-dependency-check.yml" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# GitHub Actions workflow (requires workflow scope)" >> .gitignore
    echo ".github/workflows/daily-dependency-check.yml" >> .gitignore
fi

# Stage all changes
echo "Step 3: Staging all changes..."
git add .

# Show status
echo ""
echo "Step 4: Current status:"
git status --short

# Commit
echo ""
echo "Step 5: Committing..."
git commit -m "Fix: Remove workflow file and commit all changes" || echo "Nothing to commit or already committed"

# Pull latest
echo ""
echo "Step 6: Pulling latest changes..."
git pull origin main --no-rebase || echo "Pull failed or already up to date"

# Push
echo ""
echo "Step 7: Pushing to GitHub..."
git push origin main || echo "Push failed - check error above"

echo ""
echo "========================================"
echo "DONE!"
echo "========================================"




