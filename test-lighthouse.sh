#!/bin/bash

# Lighthouse Performance Testing Script
DOMAIN="${1:-cursorsalestrainer.com}"
FULL_URL="https://${DOMAIN}"

echo "🔍 Running Lighthouse Tests for $FULL_URL"
echo "=========================================="
echo ""

# Check if Lighthouse CLI is installed
if ! command -v lighthouse &> /dev/null; then
    echo "📦 Installing Lighthouse CLI..."
    npm install -g lighthouse
fi

# Create output directory
OUTPUT_DIR="./lighthouse-reports"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📱 Testing Mobile Performance..."
lighthouse "$FULL_URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --preset=desktop \
  --output=html,json \
  --output-path="$OUTPUT_DIR/mobile_${TIMESTAMP}" \
  --chrome-flags="--headless --no-sandbox" \
  --quiet

if [ $? -eq 0 ]; then
    echo "   ✅ Mobile test completed"
    echo "   📄 Report: $OUTPUT_DIR/mobile_${TIMESTAMP}.html"
else
    echo "   ❌ Mobile test failed"
fi

echo ""

echo "🖥️  Testing Desktop Performance..."
lighthouse "$FULL_URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --preset=desktop \
  --output=html,json \
  --output-path="$OUTPUT_DIR/desktop_${TIMESTAMP}" \
  --chrome-flags="--headless --no-sandbox" \
  --quiet

if [ $? -eq 0 ]; then
    echo "   ✅ Desktop test completed"
    echo "   📄 Report: $OUTPUT_DIR/desktop_${TIMESTAMP}.html"
else
    echo "   ❌ Desktop test failed"
fi

echo ""

# Extract scores from JSON
if [ -f "$OUTPUT_DIR/mobile_${TIMESTAMP}.report.json" ]; then
    echo "📊 Mobile Scores:"
    node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$OUTPUT_DIR/mobile_${TIMESTAMP}.report.json', 'utf8'));
        const categories = data.categories || {};
        console.log('   Performance:', Math.round(categories.performance?.score * 100 || 0));
        console.log('   Accessibility:', Math.round(categories.accessibility?.score * 100 || 0));
        console.log('   Best Practices:', Math.round(categories['best-practices']?.score * 100 || 0));
        console.log('   SEO:', Math.round(categories.seo?.score * 100 || 0));
    "
fi

if [ -f "$OUTPUT_DIR/desktop_${TIMESTAMP}.report.json" ]; then
    echo ""
    echo "📊 Desktop Scores:"
    node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$OUTPUT_DIR/desktop_${TIMESTAMP}.report.json', 'utf8'));
        const categories = data.categories || {};
        console.log('   Performance:', Math.round(categories.performance?.score * 100 || 0));
        console.log('   Accessibility:', Math.round(categories.accessibility?.score * 100 || 0));
        console.log('   Best Practices:', Math.round(categories['best-practices']?.score * 100 || 0));
        console.log('   SEO:', Math.round(categories.seo?.score * 100 || 0));
    "
fi

echo ""
echo "📋 Reports saved to: $OUTPUT_DIR/"
echo "🌐 View reports: open $OUTPUT_DIR/mobile_${TIMESTAMP}.html"
echo ""

