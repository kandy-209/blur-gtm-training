#!/bin/bash

# Comprehensive Backend Testing Script
# Tests all APIs, database connections, and integrations

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Print test header
print_test() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Test result helpers
test_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    ((WARNINGS++))
}

# Check if server is running
check_server() {
    print_test "Checking Server Status"
    
    if curl -s -f "${BASE_URL}/api/db/health" > /dev/null 2>&1; then
        test_pass "Server is running at ${BASE_URL}"
        return 0
    else
        test_fail "Server is not running at ${BASE_URL}"
        echo "Start the server with: npm run dev"
        return 1
    fi
}

# Test database health
test_database() {
    print_test "Testing Database Connection"
    
    RESPONSE=$(curl -s "${BASE_URL}/api/db/health")
    
    if echo "$RESPONSE" | grep -q '"connected":true'; then
        test_pass "Database connection healthy"
        
        # Check tables
        if echo "$RESPONSE" | grep -q '"tables"'; then
            TABLES=$(echo "$RESPONSE" | jq -r '.tables[]' 2>/dev/null || echo "")
            if [ -n "$TABLES" ]; then
                echo "  Tables found: $(echo $TABLES | tr '\n' ' ')"
            fi
        fi
    else
        test_fail "Database connection failed"
        echo "  Response: $RESPONSE"
    fi
}

# Test analytics API
test_analytics() {
    print_test "Testing Analytics API"
    
    # Test GET
    RESPONSE=$(curl -s "${BASE_URL}/api/analytics?userId=test&includeStats=true&limit=10")
    
    if echo "$RESPONSE" | grep -q '"stats"'; then
        test_pass "Analytics GET endpoint working"
    else
        test_fail "Analytics GET endpoint failed"
        echo "  Response: $RESPONSE"
    fi
    
    # Test POST
    EVENT_DATA='{"eventType":"scenario_start","scenarioId":"test_scenario","metadata":{}}'
    POST_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/analytics" \
        -H "Content-Type: application/json" \
        -d "$EVENT_DATA")
    
    if echo "$POST_RESPONSE" | grep -q '"success"'; then
        test_pass "Analytics POST endpoint working"
    else
        test_warn "Analytics POST endpoint may have issues"
        echo "  Response: $POST_RESPONSE"
    fi
}

# Test company enrichment
test_company_enrichment() {
    print_test "Testing Company Enrichment API"
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/sales/enrich-company" \
        -H "Content-Type: application/json" \
        -d '{"companyName":"Microsoft","domain":"microsoft.com"}')
    
    if echo "$RESPONSE" | grep -q '"company"'; then
        test_pass "Company enrichment API working"
        
        COMPANY_NAME=$(echo "$RESPONSE" | jq -r '.company.name' 2>/dev/null || echo "")
        if [ -n "$COMPANY_NAME" ]; then
            echo "  Enriched company: $COMPANY_NAME"
        fi
    else
        test_fail "Company enrichment API failed"
        echo "  Response: $RESPONSE"
    fi
}

# Test email generation
test_email_generation() {
    print_test "Testing Email Generation API"
    
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/llm/generate-email" \
        -H "Content-Type: application/json" \
        -d '{"companyName":"Acme Corp","prospectName":"John Doe","role":"VP Engineering","emailType":"cold-outreach","tone":"professional"}')
    
    if echo "$RESPONSE" | grep -q '"body"'; then
        test_pass "Email generation API working"
        
        SUBJECT=$(echo "$RESPONSE" | jq -r '.subject' 2>/dev/null || echo "")
        if [ -n "$SUBJECT" ]; then
            echo "  Generated subject: $SUBJECT"
        fi
    elif echo "$RESPONSE" | grep -q '"error"'; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "")
        if echo "$ERROR" | grep -qi "api.*key"; then
            test_warn "Email generation requires ANTHROPIC_API_KEY"
        else
            test_fail "Email generation failed: $ERROR"
        fi
    else
        test_fail "Email generation API returned unexpected response"
        echo "  Response: $RESPONSE"
    fi
}

# Test rate limiting
test_rate_limiting() {
    print_test "Testing Rate Limiting"
    
    # Make multiple rapid requests
    COUNT=0
    for i in {1..5}; do
        RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/analytics?userId=test")
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        
        if [ "$HTTP_CODE" = "429" ]; then
            COUNT=$((COUNT + 1))
        fi
    done
    
    if [ $COUNT -gt 0 ]; then
        test_pass "Rate limiting is working ($COUNT/5 requests rate limited)"
    else
        test_warn "Rate limiting may not be active (all requests succeeded)"
    fi
}

# Test error handling
test_error_handling() {
    print_test "Testing Error Handling"
    
    # Test invalid request
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/analytics" \
        -H "Content-Type: application/json" \
        -d '{"invalid":"data"}')
    
    if echo "$RESPONSE" | grep -q '"error"'; then
        test_pass "Error handling working (invalid request rejected)"
    else
        test_warn "Error handling may need improvement"
    fi
    
    # Test missing content type
    RESPONSE=$(curl -s -X POST "${BASE_URL}/api/analytics" \
        -d '{"eventType":"test"}')
    
    if echo "$RESPONSE" | grep -qi "content.*type\|json"; then
        test_pass "Content-Type validation working"
    else
        test_warn "Content-Type validation may need improvement"
    fi
}

# Test performance
test_performance() {
    print_test "Testing API Performance"
    
    echo "  Testing response times..."
    
    TIMES=()
    for i in {1..10}; do
        START=$(date +%s%N)
        curl -s "${BASE_URL}/api/db/health" > /dev/null
        END=$(date +%s%N)
        DURATION=$(( (END - START) / 1000000 ))
        TIMES+=($DURATION)
    done
    
    # Calculate statistics
    TOTAL=0
    for time in "${TIMES[@]}"; do
        TOTAL=$((TOTAL + time))
    done
    AVG=$((TOTAL / ${#TIMES[@]}))
    
    MIN=${TIMES[0]}
    MAX=${TIMES[0]}
    for time in "${TIMES[@]}"; do
        if [ $time -lt $MIN ]; then MIN=$time; fi
        if [ $time -gt $MAX ]; then MAX=$time; fi
    done
    
    echo "  Average: ${AVG}ms"
    echo "  Min: ${MIN}ms"
    echo "  Max: ${MAX}ms"
    
    if [ $AVG -lt 500 ]; then
        test_pass "API performance is good (avg ${AVG}ms)"
    elif [ $AVG -lt 1000 ]; then
        test_warn "API performance is acceptable (avg ${AVG}ms)"
    else
        test_fail "API performance is slow (avg ${AVG}ms)"
    fi
}

# Run all tests
run_all_tests() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Backend Testing Suite - Starting Tests          ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
    
    if ! check_server; then
        echo -e "\n${RED}❌ Cannot proceed without running server${NC}"
        exit 1
    fi
    
    test_database
    test_analytics
    test_company_enrichment
    test_email_generation
    test_rate_limiting
    test_error_handling
    test_performance
    
    # Print summary
    echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    Test Summary                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
    echo -e "${RED}❌ Failed: $FAILED${NC}"
    
    TOTAL=$((PASSED + WARNINGS + FAILED))
    if [ $FAILED -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All critical tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Main execution
run_all_tests

