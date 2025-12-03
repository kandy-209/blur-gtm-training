#!/bin/bash

API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
ZONE_ID="9f4d9c373158101c337560c078c73081"

echo "🔍 Checking API Token Permissions"
echo "================================="
echo ""

# Verify token
echo "1️⃣  Verifying token..."
VERIFY_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $API_TOKEN")

if echo "$VERIFY_RESPONSE" | grep -q '"status":"active"'; then
    echo "✅ Token is valid and active"
    
    # Get token details
    STATUS=$(echo "$VERIFY_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    ID=$(echo "$VERIFY_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    echo "   Token ID: $ID"
    echo "   Status: $STATUS"
    
    # Check permissions
    PERMISSIONS=$(echo "$VERIFY_RESPONSE" | grep -o '"permissions":{[^}]*')
    
    if echo "$PERMISSIONS" | grep -q "dns_records.*edit"; then
        echo "✅ Has DNS edit permissions"
    else
        echo "❌ Missing DNS edit permissions"
        echo ""
        echo "⚠️  TOKEN NEEDS PERMISSIONS:"
        echo "   The token needs 'DNS:Edit' permission for zone $ZONE_ID"
        echo ""
        echo "📝 To fix:"
        echo "   1. Go to: https://dash.cloudflare.com/profile/api-tokens"
        echo "   2. Edit this token (ID: $ID)"
        echo "   3. Add permission: Zone → DNS → Edit"
        echo "   4. Select zone: cursorsalestrainer.com"
        echo "   5. Save"
    fi
else
    echo "❌ Token verification failed"
    ERROR=$(echo "$VERIFY_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Error: $ERROR"
fi

echo ""
echo "📋 Current DNS Records"
echo "====================="

# List current DNS records
DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN")

if echo "$DNS_LIST" | grep -q '"success":true'; then
    echo "✅ Can read DNS records"
    
    # Count records
    COUNT=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | wc -l | tr -d ' ')
    echo "   Found $COUNT DNS records"
    
    # Show www CNAME if exists
    if echo "$DNS_LIST" | grep -q '"name":"www'; then
        WWW_TARGET=$(echo "$DNS_LIST" | grep -A 10 '"name":"www' | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ www CNAME exists: www → $WWW_TARGET"
    else
        echo "   ❌ www CNAME not found"
    fi
    
    # Show root A record if exists
    if echo "$DNS_LIST" | grep -q '"name":"'"$DOMAIN"'",' || echo "$DNS_LIST" | grep -q '"name":"@",'; then
        ROOT_IP=$(echo "$DNS_LIST" | grep -A 10 '"name":"@' | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ Root A record exists: @ → $ROOT_IP"
    else
        echo "   ❌ Root A record not found"
    fi
else
    echo "❌ Cannot read DNS records"
    ERROR=$(echo "$DNS_LIST" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Error: $ERROR"
fi

echo ""
echo "💡 Solution:"
echo "   Since automated setup isn't working, add records manually:"
echo "   https://dash.cloudflare.com → $DOMAIN → DNS → Add record"

