#!/bin/bash

# Mac Setup Script - Run this on your Mac to ensure consistency

set -e

echo "🍎 Setting up Mac development environment..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version is less than 20.x. Recommended: Node.js 20.x or higher."
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup git hooks
echo "🔧 Setting up Git hooks..."
bash scripts/setup-git-hooks.sh

# Setup git config (if not already set)
echo "⚙️  Configuring Git..."
if [ -z "$(git config user.name)" ]; then
    echo "Please set your Git user name:"
    read -p "Git user name: " GIT_NAME
    git config user.name "$GIT_NAME"
fi

if [ -z "$(git config user.email)" ]; then
    echo "Please set your Git user email:"
    read -p "Git user email: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

echo ""
echo "✅ Mac setup complete!"
echo ""
echo "Git workflow:"
echo "  • Always commit before switching machines"
echo "  • Use format: 'type(scope): description'"
echo "  • Push after committing: 'git push'"

