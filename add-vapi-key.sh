#!/bin/bash

# Helper script to add Vapi API key to .env.local and Vercel

echo "🔐 Vapi API Key Setup"
echo "===================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

# Ask for the API key
echo "Please enter your Vapi API key:"
echo "(You can get it from https://vapi.ai/dashboard → Settings → API Keys)"
echo ""
read -p "VAPI_API_KEY: " vapi_key

if [ -z "$vapi_key" ]; then
    echo "❌ No API key provided. Exiting."
    exit 1
fi

# Add to .env.local
echo ""
echo "📝 Adding to .env.local..."

# Remove existing VAPI_API_KEY if present
sed -i.bak '/^VAPI_API_KEY=/d' .env.local 2>/dev/null || true

# Add new key
echo "VAPI_API_KEY=$vapi_key" >> .env.local

echo "✅ Added to .env.local"
echo ""

# Ask if they want to add to Vercel
read -p "Do you want to add this to Vercel production? (y/n): " add_to_vercel

if [ "$add_to_vercel" = "y" ] || [ "$add_to_vercel" = "Y" ]; then
    echo ""
    echo "📤 Adding to Vercel..."
    
    # Check if vercel CLI is available
    if command -v vercel &> /dev/null || command -v npx &> /dev/null; then
        echo "$vapi_key" | npx vercel env add VAPI_API_KEY production
        echo "$vapi_key" | npx vercel env add VAPI_API_KEY preview
        echo "$vapi_key" | npx vercel env add VAPI_API_KEY development
        
        echo ""
        echo "✅ Added to Vercel (all environments)"
        echo ""
        echo "⚠️  Don't forget to redeploy:"
        echo "   npx vercel --prod"
    else
        echo "❌ Vercel CLI not found. Please add manually:"
        echo "   1. Go to https://vercel.com/dashboard"
        echo "   2. Select project: cursor-gtm-training"
        echo "   3. Settings → Environment Variables"
        echo "   4. Add VAPI_API_KEY = $vapi_key"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Test locally: http://localhost:3000/api/vapi/test"
echo "   3. If added to Vercel, redeploy: npx vercel --prod"
