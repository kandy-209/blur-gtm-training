#!/bin/bash
# Setup Modal secrets

echo "🔐 Setting up Modal secrets..."

# Check if secrets already exist
if modal secret list | grep -q "openai-secret"; then
    echo "Secrets already exist. Skipping creation."
    exit 0
fi

# Create secrets (will prompt for values if not in env)
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. You'll be prompted to enter it."
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set. You'll be prompted to enter it."
fi

if [ -z "$VAPI_API_KEY" ]; then
    echo "⚠️  VAPI_API_KEY not set. You'll be prompted to enter it."
fi

# Create secrets
modal secret create openai-secret OPENAI_API_KEY="${OPENAI_API_KEY:-}"
modal secret create anthropic-secret ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
modal secret create vapi-secret VAPI_API_KEY="${VAPI_API_KEY:-}"

echo "✅ Secrets created!"

