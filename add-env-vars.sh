#!/bin/bash

# Script to help add environment variables to Vercel

echo "🔐 Adding Environment Variables to Vercel"
echo ""
echo "This script will help you add environment variables interactively."
echo ""

# Check if variables are provided as arguments
if [ $# -eq 0 ]; then
    echo "Usage: ./add-env-vars.sh"
    echo ""
    echo "Or provide values:"
    echo "  OPENAI_API_KEY=your-key"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your-url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your-key"
    echo ""
    read -p "Do you have your environment variable values ready? (y/n): " ready
    
    if [ "$ready" != "y" ]; then
        echo ""
        echo "📋 You'll need:"
        echo "  1. OpenAI API Key: https://platform.openai.com/api-keys"
        echo "  2. Supabase URL & Key: https://supabase.com (Settings → API)"
        echo ""
        echo "Run this script again when you have the values."
        exit 0
    fi
fi

echo ""
echo "Adding environment variables..."
echo ""

# Add OpenAI API Key
read -p "Enter OPENAI_API_KEY: " openai_key
if [ ! -z "$openai_key" ]; then
    npx vercel env add OPENAI_API_KEY production <<< "$openai_key"
    npx vercel env add OPENAI_API_KEY preview <<< "$openai_key"
    npx vercel env add OPENAI_API_KEY development <<< "$openai_key"
    echo "✅ Added OPENAI_API_KEY"
fi

# Add Supabase URL
read -p "Enter NEXT_PUBLIC_SUPABASE_URL: " supabase_url
if [ ! -z "$supabase_url" ]; then
    npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$supabase_url"
    npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$supabase_url"
    npx vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "$supabase_url"
    echo "✅ Added NEXT_PUBLIC_SUPABASE_URL"
fi

# Add Supabase Service Role Key
read -p "Enter SUPABASE_SERVICE_ROLE_KEY: " supabase_key
if [ ! -z "$supabase_key" ]; then
    npx vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$supabase_key"
    npx vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$supabase_key"
    npx vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "$supabase_key"
    echo "✅ Added SUPABASE_SERVICE_ROLE_KEY"
fi

# Optional: ElevenLabs
read -p "Enter NEXT_PUBLIC_ELEVENLABS_AGENT_ID (optional, press Enter to skip): " elevenlabs_id
if [ ! -z "$elevenlabs_id" ]; then
    npx vercel env add NEXT_PUBLIC_ELEVENLABS_AGENT_ID production <<< "$elevenlabs_id"
    npx vercel env add NEXT_PUBLIC_ELEVENLABS_AGENT_ID preview <<< "$elevenlabs_id"
    npx vercel env add NEXT_PUBLIC_ELEVENLABS_AGENT_ID development <<< "$elevenlabs_id"
    echo "✅ Added NEXT_PUBLIC_ELEVENLABS_AGENT_ID"
fi

# Add NODE_ENV
npx vercel env add NODE_ENV production <<< "production"
echo "✅ Added NODE_ENV"

echo ""
echo "✅ All environment variables added!"
echo ""
echo "📤 Next step: Redeploy your application"
echo "   Run: npx vercel --prod"
echo ""
echo "Or redeploy from Vercel dashboard:"
echo "   https://vercel.com/dashboard"
