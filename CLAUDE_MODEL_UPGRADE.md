# Claude Model Upgrade Guide

## Current Issue

The code is trying to use `claude-3-5-sonnet-latest` (or `claude-3-5-sonnet-20241022`), but your API key only has access to `claude-3-haiku-20240307`.

## Solution Options

### Option 1: Upgrade Your Anthropic API Key (Recommended)

To use Sonnet models, you need to upgrade your Anthropic API key:

1. **Go to Anthropic Console**: https://console.anthropic.com/
2. **Check Your Plan**: 
   - Free tier typically only includes Haiku
   - Paid plans include Sonnet and Opus
3. **Upgrade Your Plan**:
   - Go to Settings → Billing
   - Add payment method
   - Upgrade to a plan that includes Sonnet access
4. **Verify Model Access**:
   - After upgrading, your API key should have access to:
     - `claude-3-haiku-20240307` (always available)
     - `claude-3-5-sonnet-latest` (with paid plan)
     - `claude-3-5-sonnet-20241022` (with paid plan)
     - `claude-3-7-sonnet-latest` (newer, with paid plan)

### Option 2: Use Haiku (Current Fallback)

The code now automatically falls back to Haiku if Sonnet isn't available:

- **Pros**: Works with free tier, faster, cheaper
- **Cons**: Lower quality responses, less capable

The fallback happens automatically - if Sonnet fails with a 404, it will try Haiku.

### Option 3: Use Latest Model Tags

The code now uses `claude-3-5-sonnet-latest` instead of specific version numbers:

- **Pros**: More likely to work, automatically uses latest version
- **Cons**: Less predictable (version may change)

## Model Comparison

| Model | Quality | Speed | Cost | API Key Access |
|-------|---------|-------|------|----------------|
| Claude 3 Haiku | Good | Fast | Low | Free tier ✅ |
| Claude 3.5 Sonnet | Excellent | Medium | Medium | Paid plan ✅ |
| Claude 3.7 Sonnet | Best | Medium | Medium | Paid plan ✅ |

## Current Code Behavior

1. **First Attempt**: Tries `claude-3-5-sonnet-latest`
2. **If 404 Error**: Automatically falls back to `claude-3-haiku-20240307`
3. **If Both Fail**: Shows helpful error message

## Testing

After upgrading your API key, test with:

```bash
curl -X POST http://localhost:3000/api/prospect-intelligence/research \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com", "companyName": "Example Inc"}'
```

You should see in the logs:
- `🤖 Using Claude 3.5 Sonnet (latest) for Stagehand AI extraction`
- No 404 errors
- Successful extraction

## Environment Variables

No changes needed to `.env.local` - the code automatically detects which models are available.

## Troubleshooting

### Still Getting 404 Errors?

1. **Check API Key**: Verify it's the correct key in `.env.local`
2. **Check Billing**: Ensure your Anthropic account has an active paid plan
3. **Check Model Names**: Try using `claude-3-5-sonnet-latest` (recommended)
4. **Check Console**: Visit https://console.anthropic.com/ to see your plan status

### Want to Force Haiku?

If you want to always use Haiku (cheaper), you can modify the code to use Haiku directly:

```typescript
model = "claude-3-haiku-20240307";
```

But the automatic fallback should handle this for you.

## Cost Considerations

- **Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens

For prospect intelligence research, Haiku is usually sufficient and much cheaper.






