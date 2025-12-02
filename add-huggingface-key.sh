#!/bin/bash
# Script to add Hugging Face API key to Vercel

echo "🔑 Adding Hugging Face API Key to Vercel..."
echo ""
echo "Please enter your Hugging Face API token (starts with hf_):"
read HF_TOKEN

if [ -z "$HF_TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

echo ""
echo "Adding to Production environment..."
echo "$HF_TOKEN" | npx vercel env add HUGGINGFACE_API_KEY production

echo ""
echo "Setting AI_PROVIDER to huggingface..."
echo "huggingface" | npx vercel env add AI_PROVIDER production

echo ""
echo "Adding to Preview environment..."
echo "$HF_TOKEN" | npx vercel env add HUGGINGFACE_API_KEY preview
echo "huggingface" | npx vercel env add AI_PROVIDER preview

echo ""
echo "Adding to Development environment..."
echo "$HF_TOKEN" | npx vercel env add HUGGINGFACE_API_KEY development
echo "huggingface" | npx vercel env add AI_PROVIDER development

echo ""
echo "✅ Done! Now redeploy with: npx vercel --prod"

