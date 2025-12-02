# OpenAI API Quota Error

## Issue
You're seeing a 429 error: "You exceeded your current quota"

## Solution

### Option 1: Add Credits to OpenAI Account
1. Go to https://platform.openai.com/account/billing
2. Add payment method or credits
3. Check your usage limits

### Option 2: Use a Different Model
If you have access to other models, you can set the `OPENAI_MODEL` environment variable:
- `gpt-3.5-turbo` (cheaper, faster)
- `gpt-4-turbo` (if you have access)
- `gpt-4o-mini` (cheaper alternative)

### Option 3: Check API Key Permissions
Make sure your API key has the right permissions and isn't rate-limited.

## Current Error Handling
The app now shows a user-friendly message when quota is exceeded, directing users to check their billing.

## Next Steps
1. Add credits to your OpenAI account
2. Or update the `OPENAI_MODEL` environment variable to use a model you have access to
3. Redeploy after making changes

