#!/bin/bash

# Verify Git hooks and configuration are set up correctly

echo "🔍 Verifying Git hooks setup..."

# Check if hooks exist
if [ -f ".git/hooks/pre-commit" ]; then
    echo "✅ pre-commit hook installed"
else
    echo "❌ pre-commit hook missing"
fi

if [ -f ".git/hooks/pre-push" ]; then
    echo "✅ pre-push hook installed"
else
    echo "❌ pre-push hook missing"
fi

if [ -f ".git/hooks/commit-msg" ]; then
    echo "✅ commit-msg hook installed"
else
    echo "❌ commit-msg hook missing"
fi

# Check if hooks are executable
if [ -x ".git/hooks/pre-commit" ]; then
    echo "✅ pre-commit hook is executable"
else
    echo "⚠️  pre-commit hook is not executable"
fi

# Check commit template
if git config --get commit.template | grep -q ".gitmessage"; then
    echo "✅ Git commit template configured"
else
    echo "⚠️  Git commit template not configured"
    echo "   Run: git config commit.template .gitmessage"
fi

echo ""
echo "Setup verification complete!"

