#!/bin/bash

# Google Core Web Vitals Testing Script
DOMAIN="cursorsalestrainer.com"
API_KEY="${GOOGLE_PAGESPEED_API_KEY:-}"

echo "📊 Testing Core Web Vitals for $DOMAIN"
echo "========================================"
echo ""

# Check if API key is set
if [ -z "$API_KEY" ]; then
    echo "⚠️  No API key provided"
    echo ""
    echo "Option 1: Use PageSpeed Insights Web Interface"
    echo "  → https://pagespeed.web.dev/"
    echo "  → Enter: https://$DOMAIN"
    echo ""
    echo "Option 2: Get API Key for automated testing"
    echo "  1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "  2. Create API Key"
    echo "  3. Enable 'PageSpeed Insights API'"
    echo "  4. Set: export GOOGLE_PAGESPEED_API_KEY='your-key'"
    echo ""
    echo "Running web-based test instead..."
    echo ""
    
    # Open PageSpeed Insights in browser
    if command -v open &> /dev/null; then
        echo "🌐 Opening PageSpeed Insights..."
        open "https://pagespeed.web.dev/report?url=https://$DOMAIN"
    elif command -v xdg-open &> /dev/null; then
        echo "🌐 Opening PageSpeed Insights..."
        xdg-open "https://pagespeed.web.dev/report?url=https://$DOMAIN"
    else
        echo "📋 Manual test URL:"
        echo "   https://pagespeed.web.dev/report?url=https://$DOMAIN"
    fi
    
    exit 0
fi

echo "🔍 Testing with PageSpeed Insights API..."
echo ""

# Test mobile
echo "📱 Mobile Performance:"
MOBILE_RESULT=$(curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://$DOMAIN&key=$API_KEY&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo")

if echo "$MOBILE_RESULT" | grep -q "error"; then
    ERROR=$(echo "$MOBILE_RESULT" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   ❌ Error: $ERROR"
else
    # Extract Core Web Vitals
    LCP=$(echo "$MOBILE_RESULT" | grep -o '"largest-contentful-paint"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    FID=$(echo "$MOBILE_RESULT" | grep -o '"first-input-delay"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    CLS=$(echo "$MOBILE_RESULT" | grep -o '"cumulative-layout-shift"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    SCORE=$(echo "$MOBILE_RESULT" | grep -o '"performance"[^}]*"score":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    
    echo "   Performance Score: ${SCORE:-N/A}/100"
    echo "   LCP: ${LCP:-N/A}s (target: <2.5s)"
    echo "   FID: ${FID:-N/A}ms (target: <100ms)"
    echo "   CLS: ${CLS:-N/A} (target: <0.1)"
fi

echo ""

# Test desktop
echo "🖥️  Desktop Performance:"
DESKTOP_RESULT=$(curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://$DOMAIN&key=$API_KEY&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo")

if echo "$DESKTOP_RESULT" | grep -q "error"; then
    ERROR=$(echo "$DESKTOP_RESULT" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   ❌ Error: $ERROR"
else
    # Extract Core Web Vitals
    LCP=$(echo "$DESKTOP_RESULT" | grep -o '"largest-contentful-paint"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    FID=$(echo "$DESKTOP_RESULT" | grep -o '"first-input-delay"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    CLS=$(echo "$DESKTOP_RESULT" | grep -o '"cumulative-layout-shift"[^}]*"value":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    SCORE=$(echo "$DESKTOP_RESULT" | grep -o '"performance"[^}]*"score":[0-9.]*' | grep -o '[0-9.]*$' | head -1)
    
    echo "   Performance Score: ${SCORE:-N/A}/100"
    echo "   LCP: ${LCP:-N/A}s (target: <2.5s)"
    echo "   FID: ${FID:-N/A}ms (target: <100ms)"
    echo "   CLS: ${CLS:-N/A} (target: <0.1)"
fi

echo ""
echo "📋 Full Report:"
echo "   https://pagespeed.web.dev/report?url=https://$DOMAIN"
echo ""
echo "💡 For real user data (CrUX):"
echo "   1. Set up Google Search Console"
echo "   2. Wait 28 days for data"
echo "   3. Check: https://search.google.com/search-console → Experience → Core Web Vitals"
echo ""

