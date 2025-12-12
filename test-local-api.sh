#!/bin/bash

# Test script for local API testing
# Usage: ./test-local-api.sh

echo "🧪 Testing Phone Number Validation API Locally"
echo "=============================================="
echo ""

# Check if server is running
echo "1. Checking if dev server is running..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is not running!"
    echo "   Please start it in another terminal with: npm run dev"
    exit 1
fi

echo ""
echo "2. Testing phone number validation..."
echo ""

# Test different phone number formats
test_phone() {
    local phone="$1"
    local description="$2"
    
    echo "Testing: $description"
    echo "Phone: $phone"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST http://localhost:3000/api/vapi/sales-call \
        -H "Content-Type: application/json" \
        -d "{
            \"phoneNumber\": \"$phone\",
            \"userId\": \"test_user_123\",
            \"scenarioId\": \"SKEPTIC_VPE_001\",
            \"trainingMode\": \"practice\"
        }")
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')
    
    if [ "$http_status" = "200" ]; then
        echo "✅ SUCCESS (200)"
    else
        echo "❌ ERROR ($http_status)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Test cases
test_phone "+1 (209) 470-2824" "Formatted US number with spaces and parentheses"
test_phone "12094702824" "Cleaned US number with country code"
test_phone "2094702824" "US number without country code"
test_phone "+12094702824" "E.164 format"
test_phone "(209) 470-2824" "US format without country code"

echo "✅ All tests completed!"
echo ""
echo "💡 Tip: Check the terminal running 'npm run dev' for detailed server logs"
