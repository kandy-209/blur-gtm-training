# ✅ Hugging Face Permission Fix

## Problem
Hugging Face API key lacks "Inference Provider" permissions (403 error). This requires a special token type.

## Solution
**Use Anthropic Claude instead** (recommended - free tier, more reliable)

### Quick Fix: Add Anthropic API Key

1. **Get FREE Anthropic API Key**:
   - Go to: https://console.anthropic.com/
   - Sign up (free tier available)
   - Create API key
   - Copy the key (starts with `sk-ant-`)

2. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your key
   - Save and redeploy

3. **Done!** The app will automatically use Anthropic Claude (more reliable than Hugging Face)

## Why Anthropic Claude?
- ✅ Free tier available
- ✅ More reliable than Hugging Face
- ✅ No special permissions needed
- ✅ Better quality responses
- ✅ Auto-selected when available

## Alternative: Fix Hugging Face Token
If you want to use Hugging Face:
1. Go to: https://huggingface.co/settings/tokens
2. Create a new token with "Inference Provider" permissions
3. Update `HUGGINGFACE_API_KEY` in Vercel

## Status
✅ Code updated to prioritize Anthropic Claude
✅ Better error messages
✅ Clear instructions for users

