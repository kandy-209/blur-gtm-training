#!/bin/bash

# API Testing Script
# Tests all critical endpoints to verify connectivity and functionality

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing API Endpoints..."
echo ""

# Test 1: Database Health Check
echo "1️⃣  Testing Database Health..."
DB_HEALTH=$(curl -s -X GET "${BASE_URL}/api/db/health")
if echo "$DB_HEALTH" | grep -q '"connected":true'; then
    echo -e "${GREEN}✅ Database: Connected${NC}"
    echo "$DB_HEALTH" | jq '.' 2>/dev/null || echo "$DB_HEALTH"
else
    echo -e "${RED}❌ Database: Not Connected${NC}"
    echo "$DB_HEALTH" | jq '.' 2>/dev/null || echo "$DB_HEALTH"
fi
echo ""

# Test 2: Analytics API
echo "2️⃣  Testing Analytics API..."
ANALYTICS=$(curl -s -X GET "${BASE_URL}/api/analytics?userId=test&includeStats=true&limit=10")
if echo "$ANALYTICS" | grep -q '"stats"'; then
    echo -e "${GREEN}✅ Analytics: Working${NC}"
    echo "$ANALYTICS" | jq '.stats' 2>/dev/null || echo "$ANALYTICS"
else
    echo -e "${RED}❌ Analytics: Failed${NC}"
    echo "$ANALYTICS"
fi
echo ""

# Test 3: Company Enrichment API
echo "3️⃣  Testing Company Enrichment API..."
ENRICHMENT=$(curl -s -X POST "${BASE_URL}/api/sales/enrich-company" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Microsoft","domain":"microsoft.com"}')
if echo "$ENRICHMENT" | grep -q '"company"'; then
    echo -e "${GREEN}✅ Company Enrichment: Working${NC}"
    echo "$ENRICHMENT" | jq '.company' 2>/dev/null || echo "$ENRICHMENT"
else
    echo -e "${RED}❌ Company Enrichment: Failed${NC}"
    echo "$ENRICHMENT"
fi
echo ""

# Test 4: Email Generation API
echo "4️⃣  Testing Email Generation API..."
EMAIL=$(curl -s -X POST "${BASE_URL}/api/llm/generate-email" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Acme Corp","prospectName":"John Doe","role":"VP Engineering","emailType":"cold-outreach","tone":"professional"}')
if echo "$EMAIL" | grep -q '"body"'; then
    echo -e "${GREEN}✅ Email Generation: Working${NC}"
    echo "$EMAIL" | jq '{subject, body: (.body | .[0:100] + "..."), cta}' 2>/dev/null || echo "$EMAIL"
else
    echo -e "${YELLOW}⚠️  Email Generation: Requires ANTHROPIC_API_KEY${NC}"
    echo "$EMAIL" | jq '.' 2>/dev/null || echo "$EMAIL"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

