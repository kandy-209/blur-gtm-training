#!/bin/bash

# Quick deployment script for Vercel

set -e

echo "🚀 Starting deployment process..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build check
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Build successful!"
echo ""
echo "📤 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Add environment variables in Vercel dashboard:"
echo "      - OPENAI_API_KEY"
echo "      - NEXT_PUBLIC_SUPABASE_URL"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "      - NEXT_PUBLIC_ELEVENLABS_AGENT_ID (optional)"
echo "   2. Redeploy after adding variables"
echo "   3. Test your deployment"
