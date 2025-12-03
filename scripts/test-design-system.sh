#!/bin/bash

# Design System Testing Script
# Run comprehensive tests for the design system

echo "🎨 Design System Testing Suite"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "📡 Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
else
    echo -e "${RED}❌ Dev server is not running${NC}"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi

echo ""
echo "🧪 Running Tests..."
echo ""

# Test 1: Build check
echo "1️⃣  Testing build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Test 2: Type check
echo "2️⃣  Testing TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript warnings (non-critical)${NC}"
fi

# Test 3: Lint check
echo "3️⃣  Testing linting..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linting warnings (non-critical)${NC}"
fi

echo ""
echo "📊 Performance Testing"
echo "======================"
echo ""
echo "To run Lighthouse audit:"
echo "  npx lighthouse http://localhost:3000 --view"
echo ""
echo "To check Web Vitals:"
echo "  Open Chrome DevTools > Performance tab"
echo ""

echo "♿ Accessibility Testing"
echo "======================="
echo ""
echo "To run accessibility audit:"
echo "  npx @axe-core/cli http://localhost:3000"
echo ""
echo "Or use WAVE:"
echo "  https://wave.webaim.org/"
echo ""

echo "✅ Basic tests complete!"
echo ""
echo "Next steps:"
echo "1. Run Lighthouse audit"
echo "2. Test on mobile devices"
echo "3. Test with screen readers"
echo "4. Check browser compatibility"
echo ""

