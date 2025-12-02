# 🆓 Setup Free AI Provider (Hugging Face)

## Step-by-Step Guide

### Step 1: Get Hugging Face API Token

1. **Visit**: https://huggingface.co/settings/tokens
2. **Sign up** (if you don't have an account) - it's FREE!
3. **Click** "New token"
4. **Name it**: `cursor-training-app`
5. **Select**: "Read" permission (that's all you need)
6. **Click** "Generate token"
7. **Copy the token** (starts with `hf_...`)

### Step 2: Add to Vercel

Run these commands one by one:

```bash
# Add the API key
echo "YOUR_HUGGINGFACE_TOKEN_HERE" | npx vercel env add HUGGINGFACE_API_KEY production

# Set provider to Hugging Face
echo "huggingface" | npx vercel env add AI_PROVIDER production

# Also add to preview and development
echo "YOUR_HUGGINGFACE_TOKEN_HERE" | npx vercel env add HUGGINGFACE_API_KEY preview
echo "huggingface" | npx vercel env add AI_PROVIDER preview

echo "YOUR_HUGGINGFACE_TOKEN_HERE" | npx vercel env add HUGGINGFACE_API_KEY development
echo "huggingface" | npx vercel env add AI_PROVIDER development
```

### Step 3: Redeploy

```bash
npx vercel --prod
```

## That's It! 🎉

Your app will now use the FREE Hugging Face API!

## Troubleshooting

**First request is slow?**
- Normal! Hugging Face has a "cold start" - first request takes 30-60 seconds
- Subsequent requests are much faster

**Rate limits?**
- Free tier has limits, but generous for testing
- Upgrade to Pro ($9/month) for more if needed

**Want faster responses?**
- Try Anthropic Claude (also has free tier)
- See FREE_AI_OPTIONS.md for details

