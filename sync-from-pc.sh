#!/bin/bash
# Quick sync script to pull latest changes from PC

echo "🔄 Syncing from PC..."
git fetch origin
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Synced successfully!"
    echo "📊 Latest commits:"
    git log --oneline -5
else
    echo "❌ Sync failed. Check for conflicts."
fi

