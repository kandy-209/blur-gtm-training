#!/bin/bash

# Production Setup Script
# Run this script to set up production environment

set -e

echo "🚀 Setting up production environment..."

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version OK: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Check environment variables
echo "🔐 Checking environment variables..."
REQUIRED_VARS=("OPENAI_API_KEY" "NEXT_PUBLIC_SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '   %s\n' "${MISSING_VARS[@]}"
  echo ""
  echo "Please set these variables before continuing."
  exit 1
fi
echo "✅ All required environment variables set"

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build application
echo "🏗️  Building application..."
npm run build

echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Review PRODUCTION.md for deployment instructions"
echo "2. Set up database migrations"
echo "3. Configure monitoring and error tracking"
echo "4. Deploy to Vercel"

