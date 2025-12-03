#!/bin/bash

# Simple DNS Record Addition Script
ZONE_ID="9f4d9c373158101c337560c078c73081"
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
GLOBAL_KEY="d643ee4dee7ad53f91744d0da86b83ad15891"
DOMAIN="cursorsalestrainer.com"
VERCEL_VERIFICATION="dd76a87b2c0ea9f7.vercel-dns-017.com"
VERCEL_IP="216.150.1.1"

echo "🔧 Adding DNS Records for $DOMAIN"
echo "=================================="
echo ""

# Method 1: Try API Token
echo "📡 Method 1: Using API Token..."
CNAME_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"$VERCEL_VERIFICATION\",\"ttl\":1,\"proxied\":false}")

if echo "$CNAME_RESPONSE" | grep -q '"success":true'; then
    echo "✅ www CNAME added successfully!"
    CNAME_ADDED=true
else
    ERROR_MSG=$(echo "$CNAME_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    ERROR_CODE=$(echo "$CNAME_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
    echo "❌ Failed: $ERROR_MSG (Code: $ERROR_CODE)"
    CNAME_ADDED=false
fi
echo ""

# Method 2: Try Global Key (requires email)
if [ "$CNAME_ADDED" = false ]; then
    echo "📡 Method 2: Getting email for Global Key..."
    EMAIL_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user" \
      -H "Authorization: Bearer $API_TOKEN")
    
    EMAIL=$(echo "$EMAIL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('result', {}).get('email', ''))" 2>/dev/null)
    
    if [ -z "$EMAIL" ]; then
        EMAIL=$(echo "$EMAIL_RESPONSE" | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -n "$EMAIL" ] && [ "$EMAIL" != "null" ]; then
        echo "✅ Found email: $EMAIL"
        echo "📡 Trying Global Key method..."
        
        CNAME_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
          -H "X-Auth-Email: $EMAIL" \
          -H "X-Auth-Key: $GLOBAL_KEY" \
          -H "Content-Type: application/json" \
          --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"$VERCEL_VERIFICATION\",\"ttl\":1,\"proxied\":false}")
        
        if echo "$CNAME_RESPONSE" | grep -q '"success":true'; then
            echo "✅ www CNAME added successfully with Global Key!"
            CNAME_ADDED=true
        else
            ERROR_MSG=$(echo "$CNAME_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
            echo "❌ Global Key method failed: $ERROR_MSG"
        fi
    else
        echo "❌ Could not retrieve email"
    fi
    echo ""
fi

# Add A record if CNAME succeeded
if [ "$CNAME_ADDED" = true ]; then
    echo "📡 Adding root A record..."
    
    if [ -n "$EMAIL" ] && [ "$EMAIL" != "null" ]; then
        A_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
          -H "X-Auth-Email: $EMAIL" \
          -H "X-Auth-Key: $GLOBAL_KEY" \
          -H "Content-Type: application/json" \
          --data "{\"type\":\"A\",\"name\":\"@\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    else
        A_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
          -H "Authorization: Bearer $API_TOKEN" \
          -H "Content-Type: application/json" \
          --data "{\"type\":\"A\",\"name\":\"@\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    fi
    
    if echo "$A_RESPONSE" | grep -q '"success":true'; then
        echo "✅ Root A record added successfully!"
        A_ADDED=true
    else
        ERROR_MSG=$(echo "$A_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "⚠️  A record not added: $ERROR_MSG"
        A_ADDED=false
    fi
    echo ""
fi

# Summary
echo "📋 Final Status"
echo "==============="
if [ "$CNAME_ADDED" = true ]; then
    echo "✅ www CNAME: Added"
    echo "   www.$DOMAIN → $VERCEL_VERIFICATION"
else
    echo "❌ www CNAME: Failed - Manual setup required"
fi

if [ "$A_ADDED" = true ]; then
    echo "✅ Root A Record: Added"
    echo "   $DOMAIN → $VERCEL_IP"
elif [ "$CNAME_ADDED" = true ]; then
    echo "⚠️  Root A Record: Failed (optional but recommended)"
else
    echo "⏸️  Root A Record: Skipped (CNAME failed)"
fi
echo ""

if [ "$CNAME_ADDED" = false ]; then
    echo "⚠️  MANUAL SETUP REQUIRED"
    echo "========================"
    echo ""
    echo "Go to: https://dash.cloudflare.com"
    echo "1. Click: $DOMAIN"
    echo "2. Go to: DNS → Records"
    echo "3. Click: Add record"
    echo ""
    echo "Record 1 (Required):"
    echo "  Type: CNAME"
    echo "  Name: www"
    echo "  Target: $VERCEL_VERIFICATION"
    echo "  Proxy: OFF (gray cloud)"
    echo ""
    echo "Record 2 (Recommended):"
    echo "  Type: A"
    echo "  Name: @"
    echo "  IPv4: $VERCEL_IP"
    echo "  Proxy: OFF (gray cloud)"
    echo ""
fi

echo "➡️  Next: Wait 5-10 minutes, then check Vercel Dashboard"

