#!/bin/bash
# Deploy Modal functions

echo "🚀 Deploying Modal Functions..."

# Install Modal CLI if not installed
if ! command -v modal &> /dev/null; then
    echo "Installing Modal CLI..."
    pip install modal
fi

# Authenticate (if not already)
echo "Authenticating with Modal..."
modal token new

# Deploy the function
echo "Deploying analyze_call function..."
modal deploy modal_functions/analyze_call.py

# Get the function URL
echo "✅ Deployment complete!"
echo ""
echo "Add the Modal function URL to your Vercel environment variables:"
echo "MODAL_FUNCTION_URL=<your-function-url>"

