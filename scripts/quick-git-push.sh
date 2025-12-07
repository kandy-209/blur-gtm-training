#!/bin/bash
# Quick Git Push Script (Mac/Linux)
# Handles git operations safely

MESSAGE="${1:-Update: Cache system improvements and bug fixes}"

echo "🔄 Safe Git Push Process"
echo "========================"
echo ""

# Step 1: Check status
echo "1️⃣ Checking git status..."
if git status --porcelain > /dev/null 2>&1; then
    CHANGES=$(git status --porcelain)
    if [ -z "$CHANGES" ]; then
        echo "   ℹ️  No changes to commit"
        exit 0
    else
        echo "   ✅ Changes detected"
    fi
else
    echo "   ⚠️  Git not initialized"
    exit 1
fi

echo ""

# Step 2: Stage files
echo "2️⃣ Staging files..."
if git add . 2>/dev/null; then
    echo "   ✅ Files staged successfully"
else
    echo "   ⚠️  Error staging files"
    exit 1
fi

echo ""

# Step 3: Commit
echo "3️⃣ Committing changes..."
if git commit -m "$MESSAGE" 2>/dev/null; then
    echo "   ✅ Committed successfully"
    echo "   Message: $MESSAGE"
else
    echo "   ⚠️  Nothing to commit or commit failed"
fi

echo ""

# Step 4: Push
echo "4️⃣ Pushing to main branch..."
if git push origin main 2>/dev/null; then
    echo "   ✅ Pushed successfully to main"
else
    echo "   ⚠️  Push failed - check git status"
    echo "   Try: git push origin main"
fi

echo ""
echo "✅ Git operations complete!"

