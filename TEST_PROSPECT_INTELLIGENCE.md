# Prospect Intelligence & Browserbase Test Guide

This guide explains how to test and verify that Prospect Intelligence and Browserbase are working correctly.

## Quick Test

Run the comprehensive test script:

```bash
node test-prospect-intelligence.js
```

For a full test including a simple research operation (takes 30-60 seconds):

```bash
node test-prospect-intelligence.js --full-test
```

## What Gets Tested

The test script verifies:

1. **Environment Variables** ✅
   - `BROWSERBASE_API_KEY` - Required
   - `BROWSERBASE_PROJECT_ID` - Required
   - At least one LLM API key (ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, or OPENAI_API_KEY)

2. **Browserbase Credentials** ✅
   - Validates API key format (should start with `bb_` or `bb_live_`)
   - Validates Project ID format (should be a UUID)

3. **Stagehand Initialization** ✅
   - Tests Stagehand initialization with your configured LLM
   - Verifies browser automation setup
   - Tests Browserbase connectivity (if using OpenAI or Gemini)
   - Note: Claude uses LOCAL mode as a workaround for Browserbase 404 bug

4. **API Endpoint** ✅
   - Verifies the Prospect Intelligence API endpoint is available
   - Checks if the Next.js server is running

5. **Simple Research Operation** (Optional) ⚠️
   - Performs a test research on example.com
   - Only runs with `--full-test` flag
   - Takes 30-60 seconds

## Test Results

### ✅ All Tests Passed

If all tests pass, you'll see:
```
🎉 All tests passed! Prospect Intelligence and Browserbase are configured correctly.
```

### ⚠️ Warnings

Common warnings:
- **Browserbase Mode**: If using Claude, you'll see a warning about LOCAL mode. This is expected - Claude uses LOCAL mode as a workaround for Browserbase's 404 bug. To test Browserbase connectivity, add `OPENAI_API_KEY` or `GOOGLE_GEMINI_API_KEY`.
- **Simple Research**: Skipped by default. Use `--full-test` to run.

### ❌ Failed Tests

If tests fail, check:

1. **Missing Environment Variables**
   - Ensure `.env.local` exists and contains all required variables
   - Restart your dev server after adding environment variables

2. **Invalid API Keys**
   - Verify Browserbase API key format (starts with `bb_` or `bb_live_`)
   - Verify Project ID is a valid UUID
   - Check LLM API keys are valid

3. **Stagehand Initialization Failed**
   - Check LLM API key is valid
   - If using Claude and getting 404 errors, this is a known Browserbase bug - use OpenAI or Gemini instead
   - Verify Browserbase API key has sufficient credits

4. **API Endpoint Not Available**
   - Start the Next.js dev server: `npm run dev`
   - Ensure the server is running on `http://localhost:3000`

## Browserbase Connectivity Notes

- **Claude (Anthropic)**: Uses LOCAL mode (bypasses Browserbase) due to Browserbase 404 bug
- **OpenAI (GPT-4o)**: Uses BROWSERBASE mode - tests actual Browserbase connectivity
- **Gemini (Google)**: Uses BROWSERBASE mode - tests actual Browserbase connectivity

To fully test Browserbase connectivity, ensure you have `OPENAI_API_KEY` or `GOOGLE_GEMINI_API_KEY` configured.

## Manual Testing

You can also test Prospect Intelligence manually:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/prospect-intelligence`

3. Enter a company website URL and click "Research"

4. Wait for the research to complete (30-120 seconds)

## Troubleshooting

### "BROWSERBASE_API_KEY environment variable is not configured"
- Add `BROWSERBASE_API_KEY` to `.env.local`
- Get your key from: https://www.browserbase.com/settings/api-keys
- Restart the dev server

### "No LLM API key configured"
- Add at least one LLM API key to `.env.local`:
  - `ANTHROPIC_API_KEY` (recommended, free tier available)
  - `GOOGLE_GEMINI_API_KEY`
  - `OPENAI_API_KEY`

### "Browserbase + Claude Integration Error"
- This is a known Browserbase bug with Claude models
- Solution: Use `OPENAI_API_KEY` or `GOOGLE_GEMINI_API_KEY` instead
- Or use LOCAL mode (automatic for Claude)

### "Research timeout"
- The website may be slow or blocking automation
- Try a different website
- Check Browserbase session limits

## Additional Resources

- [Prospect Intelligence Setup Guide](./PROSPECT_INTELLIGENCE_SETUP.md)
- [Browserbase Documentation](https://docs.browserbase.com)
- [Stagehand Documentation](https://docs.stagehand.dev)





