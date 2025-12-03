#!/bin/bash
# Git Sync Script for Mac/Linux
# Run this script to sync with remote repository

echo "🔄 Syncing with remote repository..."
echo ""

# Step 1: Check status
echo "📊 Step 1: Checking git status..."
git status --short
echo ""

# Step 2: Stage all changes
echo "📦 Step 2: Staging changes..."
git add .
if [ $? -eq 0 ]; then
    echo "✅ Changes staged"
else
    echo "⚠️  No changes to stage"
fi
echo ""

# Step 3: Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "💾 Step 3: Committing changes..."
    read -p "Enter commit message (or press Enter for default): " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="chore: Update from Mac"
    fi
    git commit -m "$commit_message"
    if [ $? -eq 0 ]; then
        echo "✅ Changes committed"
    fi
    echo ""
fi

# Step 4: Pull latest changes
echo "⬇️  Step 4: Pulling latest changes..."
git pull origin main --rebase
if [ $? -eq 0 ]; then
    echo "✅ Pulled latest changes"
else
    echo "⚠️  Pull had issues - may need manual resolution"
fi
echo ""

# Step 5: Push changes
echo "⬆️  Step 5: Pushing changes..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to remote"
else
    echo "⚠️  Push failed - may need manual intervention"
fi
echo ""

# Step 6: Final status
echo "📊 Final status:"
git status --short
echo ""

echo "✨ Sync complete!"


