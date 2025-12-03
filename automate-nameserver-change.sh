#!/bin/bash

# Cloudflare API Configuration
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"

# Vercel Nameservers
VERCEL_NS1="ns1.vercel-dns.com"
VERCEL_NS2="ns2.vercel-dns.com"

echo "🚀 Attempting to Change Nameservers to Vercel"
echo "=============================================="
echo ""

# Check if domain is registered with Cloudflare Registrar
echo "1️⃣  Checking if domain is registered with Cloudflare..."
REGISTRAR_CHECK=$(curl -s "https://api.cloudflare.com/client/v4/registrar/domains/$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

if echo "$REGISTRAR_CHECK" | grep -q '"success":true'; then
    echo "   ✅ Domain is registered with Cloudflare Registrar"
    IS_REGISTRAR=true
else
    echo "   ⚠️  Domain may not be registered with Cloudflare"
    echo "   → Nameservers need to be changed at your registrar"
    IS_REGISTRAR=false
fi
echo ""

# Try to get current nameservers
echo "2️⃣  Getting current nameservers..."
ZONE_INFO=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

CURRENT_NS=$(echo "$ZONE_INFO" | grep -o '"name_servers":\[[^]]*\]' | head -1)
echo "   Current nameservers: $CURRENT_NS"
echo ""

# Try to update nameservers via Registrar API
if [ "$IS_REGISTRAR" = true ]; then
    echo "3️⃣  Attempting to update nameservers via Registrar API..."
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/registrar/domains/$DOMAIN/nameservers" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"nameservers\":[\"$VERCEL_NS1\",\"$VERCEL_NS2\"]}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ Nameservers updated successfully!"
        echo "   Changed to: $VERCEL_NS1, $VERCEL_NS2"
        SUCCESS=true
    else
        ERROR=$(echo "$UPDATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$UPDATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ API update failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        SUCCESS=false
    fi
else
    echo "3️⃣  Cannot update via API (domain not registered with Cloudflare)"
    SUCCESS=false
fi
echo ""

# Summary
echo "📋 Summary"
echo "=========="
echo ""

if [ "$SUCCESS" = true ]; then
    echo "🎉 SUCCESS! Nameservers changed to Vercel!"
    echo ""
    echo "Next steps:"
    echo "1. Add domain in Vercel Dashboard"
    echo "2. Wait 15-30 minutes for propagation"
    echo "3. Domain will be live!"
else
    echo "⚠️  Automated update not possible"
    echo ""
    echo "You need to change nameservers manually:"
    echo ""
    echo "Option A: If Cloudflare is your registrar"
    echo "  1. Go to: https://dash.cloudflare.com/registrar"
    echo "  2. Click: $DOMAIN"
    echo "  3. Find: Nameservers section"
    echo "  4. Change to:"
    echo "     - $VERCEL_NS1"
    echo "     - $VERCEL_NS2"
    echo "  5. Save"
    echo ""
    echo "Option B: If domain is registered elsewhere"
    echo "  1. Go to your registrar (where you bought domain)"
    echo "  2. Find: Nameservers/DNS Settings"
    echo "  3. Change to:"
    echo "     - $VERCEL_NS1"
    echo "     - $VERCEL_NS2"
    echo "  4. Save"
    echo ""
    echo "After changing nameservers:"
    echo "  1. Add domain in Vercel Dashboard"
    echo "  2. Wait 15-30 minutes"
    echo "  3. Domain will be live!"
fi

echo ""
echo "🌐 Your domain will be: https://$DOMAIN"
echo ""

