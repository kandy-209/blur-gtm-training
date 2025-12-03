#!/bin/bash

# Configuration
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
GLOBAL_KEY="d643ee4dee7ad53f91744d0da86b83ad15891"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_VERIFICATION="dd76a87b2c0ea9f7.vercel-dns-017.com"
VERCEL_IP="216.150.1.1"

echo "🚀 Adding Vercel Verification Records"
echo "======================================"
echo ""

# Try to get email
echo "1️⃣  Getting account email..."
EMAIL_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user" \
  -H "Authorization: Bearer $API_TOKEN")

EMAIL=$(echo "$EMAIL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('result', {}).get('email', ''))" 2>/dev/null)

if [ -z "$EMAIL" ]; then
    EMAIL=$(echo "$EMAIL_RESPONSE" | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -n "$EMAIL" ]; then
    echo "   ✅ Found email: $EMAIL"
    USE_EMAIL=true
else
    echo "   ⚠️  Could not get email, will try API token"
    USE_EMAIL=false
fi
echo ""

# Check existing www CNAME
echo "2️⃣  Checking existing www CNAME record..."
if [ "$USE_EMAIL" = true ]; then
    DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=CNAME&name=www.$DOMAIN" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_KEY" \
      -H "Content-Type: application/json")
else
    DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=CNAME&name=www.$DOMAIN" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json")
fi

EXISTING_CNAME_ID=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
EXISTING_CNAME_TARGET=$(echo "$DNS_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_CNAME_ID" ]; then
    echo "   ℹ️  Found existing www CNAME"
    echo "   Current target: $EXISTING_CNAME_TARGET"
    
    if [ "$EXISTING_CNAME_TARGET" = "$VERCEL_VERIFICATION" ]; then
        echo "   ✅ Already points to correct verification target!"
        CNAME_OK=true
    else
        echo "   ⚠️  Points to different target, updating..."
        CNAME_OK=false
        UPDATE_CNAME=true
    fi
else
    echo "   ℹ️  No existing www CNAME found, will create"
    CNAME_OK=false
fi
echo ""

# Create or update www CNAME
if [ "$UPDATE_CNAME" = true ] && [ "$USE_EMAIL" = true ]; then
    echo "3️⃣  Updating www CNAME record..."
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$EXISTING_CNAME_ID" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_KEY" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"$VERCEL_VERIFICATION\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ www CNAME updated successfully!"
        echo "   www.$DOMAIN → $VERCEL_VERIFICATION"
        CNAME_OK=true
    else
        ERROR=$(echo "$UPDATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ❌ Update failed: $ERROR"
        CNAME_OK=false
    fi
elif [ "$CNAME_OK" = false ] && [ "$USE_EMAIL" = true ]; then
    echo "3️⃣  Creating www CNAME record..."
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_KEY" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"$VERCEL_VERIFICATION\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ www CNAME created successfully!"
        echo "   Record ID: $NEW_ID"
        echo "   www.$DOMAIN → $VERCEL_VERIFICATION"
        CNAME_OK=true
    else
        ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ Creation failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        CNAME_OK=false
    fi
elif [ "$USE_EMAIL" = false ]; then
    echo "3️⃣  Trying with API token..."
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"$VERCEL_VERIFICATION\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ www CNAME created successfully via API token!"
        echo "   Record ID: $NEW_ID"
        echo "   www.$DOMAIN → $VERCEL_VERIFICATION"
        CNAME_OK=true
    else
        ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ API token method failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        CNAME_OK=false
    fi
else
    echo "3️⃣  www CNAME already correct, skipping"
fi
echo ""

# Check for root A record
echo "4️⃣  Checking root A record..."
if [ "$USE_EMAIL" = true ]; then
    A_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_KEY" \
      -H "Content-Type: application/json")
else
    A_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json")
fi

EXISTING_A_ID=$(echo "$A_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
EXISTING_A_IP=$(echo "$A_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_A_ID" ]; then
    echo "   ℹ️  Found root A record"
    echo "   Current IP: $EXISTING_A_IP"
    
    if [ "$EXISTING_A_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Already points to correct Vercel IP!"
        A_OK=true
    else
        echo "   ⚠️  Points to different IP"
        A_OK=false
    fi
else
    echo "   ℹ️  No root A record found"
    A_OK=false
fi
echo ""

# Summary
echo "📋 Setup Summary"
echo "================"
echo ""

if [ "$CNAME_OK" = true ]; then
    echo "✅ www CNAME: Configured"
    echo "   www.$DOMAIN → $VERCEL_VERIFICATION"
else
    echo "❌ www CNAME: Needs manual setup"
fi

if [ "$A_OK" = true ]; then
    echo "✅ Root A Record: Configured"
    echo "   $DOMAIN → $VERCEL_IP"
else
    echo "⚠️  Root A Record: Not configured (optional but recommended)"
fi

echo ""
echo "📝 Next Steps:"
echo ""

if [ "$CNAME_OK" = false ]; then
    echo "⚠️  MANUAL ACTION REQUIRED:"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Click: $DOMAIN"
    echo "   3. Go to: DNS section"
    echo "   4. Add CNAME record:"
    echo "      Type: CNAME"
    echo "      Name: www"
    echo "      Target: $VERCEL_VERIFICATION"
    echo "      Proxy: OFF (gray cloud)"
    echo "   5. Save"
    echo ""
fi

if [ "$A_OK" = false ]; then
    echo "💡 RECOMMENDED: Add root A record"
    echo "   1. In Cloudflare DNS section"
    echo "   2. Add A record:"
    echo "      Type: A"
    echo "      Name: @"
    echo "      IPv4: $VERCEL_IP"
    echo "      Proxy: OFF"
    echo "   3. Save"
    echo ""
fi

echo "➡️  After adding records:"
echo "   1. Wait 5-10 minutes for DNS propagation"
echo "   2. Go to Vercel Dashboard → Domains"
echo "   3. Vercel will verify automatically"
echo "   4. Status should change to ✅ Valid"
echo ""

if [ "$CNAME_OK" = true ] && [ "$A_OK" = true ]; then
    echo "🎉 All DNS records configured!"
    echo "   → Wait 5-10 minutes, then check Vercel Dashboard"
elif [ "$CNAME_OK" = true ]; then
    echo "✅ Verification record added!"
    echo "   → Consider adding root A record for better routing"
fi

echo ""
echo "🌐 Your domain will be: https://$DOMAIN and https://www.$DOMAIN"
echo ""

