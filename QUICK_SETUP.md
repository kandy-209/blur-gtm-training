# ⚡ Quick Setup - Copy & Paste

## Step 1: Get Token
Visit: https://huggingface.co/settings/tokens
- Sign up/Login (FREE!)
- Click "New token"
- Name: `cursor-training-app`
- Permission: Read
- Copy token (starts with `hf_...`)

## Step 2: Run This (Replace YOUR_TOKEN)

```bash
# Copy this entire block and replace YOUR_TOKEN with your actual token

TOKEN="YOUR_TOKEN"
echo "$TOKEN" | npx vercel env add HUGGINGFACE_API_KEY production
echo "huggingface" | npx vercel env add AI_PROVIDER production
echo "$TOKEN" | npx vercel env add HUGGINGFACE_API_KEY preview  
echo "huggingface" | npx vercel env add AI_PROVIDER preview
echo "$TOKEN" | npx vercel env add HUGGINGFACE_API_KEY development
echo "huggingface" | npx vercel env add AI_PROVIDER development
npx vercel --prod
```

## That's It! 🎉

Your app will now use FREE Hugging Face AI!

---

**OR** just paste your token here and I'll do it for you! 🚀

