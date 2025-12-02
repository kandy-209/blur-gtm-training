# Free AI Provider Options

## 🆓 Free Alternatives to OpenAI

The app now supports multiple AI providers, including **free options**!

### Option 1: Hugging Face (FREE) ⭐ Recommended

**Get your free API key:**
1. Go to https://huggingface.co/settings/tokens
2. Create a free account
3. Generate a new token
4. Add to Vercel:

```bash
npx vercel env add HUGGINGFACE_API_KEY production
# Paste your token

npx vercel env add AI_PROVIDER production  
# Enter: huggingface
```

**Models available (free):**
- `meta-llama/Llama-3.1-8B-Instruct` (default)
- `mistralai/Mistral-7B-Instruct-v0.2`
- `google/gemma-7b-it`

### Option 2: Anthropic Claude (Free Tier)

**Get your free API key:**
1. Go to https://console.anthropic.com/
2. Sign up for free tier
3. Get your API key
4. Add to Vercel:

```bash
npx vercel env add ANTHROPIC_API_KEY production
# Paste your key

npx vercel env add AI_PROVIDER production
# Enter: anthropic
```

**Models:**
- `claude-3-haiku-20240307` (cheapest/fastest)
- `claude-3-sonnet-20240229` (better quality)

### Option 3: OpenAI (Requires Credits)

If you have OpenAI credits:
```bash
npx vercel env add OPENAI_MODEL production
# Enter: gpt-3.5-turbo (cheapest option)
```

## Auto-Detection

If you set `AI_PROVIDER=auto`, the app will:
1. Try Hugging Face first (free)
2. Try Anthropic second (free tier)
3. Fall back to OpenAI (requires credits)

## Quick Setup (Free)

**Recommended free setup:**

```bash
# 1. Get Hugging Face token (free)
# Visit: https://huggingface.co/settings/tokens

# 2. Add to Vercel
npx vercel env add HUGGINGFACE_API_KEY production
# Paste token

npx vercel env add AI_PROVIDER production
# Enter: huggingface

# 3. Redeploy
npx vercel --prod
```

That's it! Your app will now use the free Hugging Face API! 🎉

## Cost Comparison

| Provider | Cost | Quality | Speed |
|----------|------|---------|-------|
| Hugging Face | **FREE** | Good | Fast |
| Anthropic (Haiku) | **Free tier** | Excellent | Very Fast |
| OpenAI (GPT-3.5) | ~$0.0015/1K tokens | Good | Fast |
| OpenAI (GPT-4) | ~$0.03/1K tokens | Excellent | Slower |

## Troubleshooting

**If Hugging Face is slow:**
- First request may take 30-60 seconds (cold start)
- Subsequent requests are faster
- Consider using Anthropic for faster responses

**If you get rate limits:**
- Hugging Face: Free tier has rate limits, upgrade for more
- Anthropic: Free tier has generous limits
- OpenAI: Requires paid credits

## Next Steps

1. Get a free Hugging Face token
2. Add it to Vercel environment variables
3. Set `AI_PROVIDER=huggingface`
4. Redeploy

Your app will work completely free! 🚀

