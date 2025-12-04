#!/bin/bash

# Voice Coaching API Test Script
# Tests the voice coaching API endpoints

BASE_URL="http://localhost:3000"
CONVERSATION_ID="test_conv_$(date +%s)"

echo "🧪 Testing Voice Coaching API Endpoints"
echo "========================================"
echo ""

# Test 1: Save Metrics
echo "1️⃣ Testing POST /api/voice-coaching/metrics"
echo "--------------------------------------------"

METRICS_JSON=$(cat <<EOF
{
  "conversationId": "$CONVERSATION_ID",
  "userId": null,
  "metrics": {
    "pace": 165,
    "pitch": 180,
    "volume": -10,
    "pauses": 5,
    "clarity": 85,
    "confidence": 78
  },
  "timestamp": $(date +%s)000
}
EOF
)

RESPONSE=$(curl -s -X POST "$BASE_URL/api/voice-coaching/metrics" \
  -H "Content-Type: application/json" \
  -d "$METRICS_JSON")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: Get Metrics
echo "2️⃣ Testing GET /api/voice-coaching/metrics"
echo "------------------------------------------"

RESPONSE=$(curl -s "$BASE_URL/api/voice-coaching/metrics?conversationId=$CONVERSATION_ID")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Get Feedback
echo "3️⃣ Testing GET /api/voice-coaching/feedback"
echo "--------------------------------------------"

RESPONSE=$(curl -s "$BASE_URL/api/voice-coaching/feedback?conversationId=$CONVERSATION_ID")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

echo "✅ API Tests Complete!"
echo ""
echo "To test in browser:"
echo "1. Start your Next.js dev server: npm run dev"
echo "2. Navigate to: http://localhost:3000/test/voice-coaching"
echo "3. Click 'Start Analysis' and speak into your microphone"

