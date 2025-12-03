# Environment Variables Setup Guide

## Required for Company Analysis System

Add these to your `.env.local` file:

```bash
# ============================================
# LLM Providers (Choose one or both)
# ============================================

# Best Option - Claude (Anthropic) - Most accurate for financial analysis
# Get your key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Alternative - OpenAI GPT-4 Turbo
# Get your key at: https://platform.openai.com/
OPENAI_API_KEY=sk-...

# ============================================
# Financial Data APIs
# ============================================

# Alpha Vantage - Free tier: 5 requests/minute, 500/day
# Your API Key: D05K80BVIL89XP20
ALPHA_VANTAGE_API_KEY=D05K80BVIL89XP20

# Polygon.io - Optional alternative data source
# Get your key at: https://polygon.io/
POLYGON_API_KEY=...

# ============================================
# S3 Storage (Already Configured)
# ============================================

# Your S3 credentials (already set from your input)
S3_ENDPOINT=https://files.massive.com
S3_ACCESS_KEY_ID=9608b1ba-919e-43df-aaa5-31c69921572c
S3_SECRET_ACCESS_KEY=axEzCy2XHAk2UKVRtPdMS1EQyapWjI0b
S3_BUCKET=flatfiles
S3_REGION=us-east-1

# ============================================
# Other APIs (if needed)
# ============================================

# OpenAI (for other features)
OPENAI_API_KEY=sk-...

# ElevenLabs (for voice features)
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...
```

## Quick Setup

1. Create `.env.local` file in the root directory
2. Copy the Alpha Vantage key above
3. Add Claude or OpenAI API key (recommended: Claude)
4. The S3 credentials are already configured

## Priority Order

The system will use providers in this order:
1. **Claude** (if `ANTHROPIC_API_KEY` is set) - Best accuracy
2. **OpenAI** (if `OPENAI_API_KEY` is set) - Good alternative
3. **Rule-based** (if no LLM available) - Functional fallback

## Alpha Vantage Limits

- **Free Tier**: 5 requests/minute, 500 requests/day
- **Rate Limiting**: Built into the system
- **Caching**: 24-hour cache reduces API calls significantly

## Testing

After adding your keys, test with:
```bash
POST /api/company-analysis
{ "ticker": "AAPL" }
```



