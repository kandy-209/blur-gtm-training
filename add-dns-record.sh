#!/bin/bash

# Configuration
GLOBAL_API_KEY="d643ee4dee7ad53f91744d0da86b83ad15891"
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_IP="216.150.1.1"

echo "🚀 Adding DNS Record via Cloudflare API"
echo "========================================"
echo ""

# Try to get email
echo "1️⃣  Getting account email..."
EMAIL_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user" \
  -H "Authorization: Bearer $API_TOKEN")

EMAIL=$(echo "$EMAIL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('result', {}).get('email', ''))" 2>/dev/null)

if [ -z "$EMAIL" ]; then
    # Try alternative method
    EMAIL=$(echo "$EMAIL_RESPONSE" | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -n "$EMAIL" ]; then
    echo "   ✅ Found email: $EMAIL"
else
    echo "   ⚠️  Could not get email automatically"
    echo "   → Will try API token method instead"
fi
echo ""

# Check existing records
echo "2️⃣  Checking existing DNS records..."
if [ -n "$EMAIL" ]; then
    DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_API_KEY" \
      -H "Content-Type: application/json")
else
    DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json")
fi

EXISTING_ID=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
EXISTING_IP=$(echo "$DNS_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_ID" ]; then
    echo "   ℹ️  Found existing A record"
    echo "   Record ID: $EXISTING_ID"
    echo "   Current IP: $EXISTING_IP"
    
    if [ "$EXISTING_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Already points to correct Vercel IP!"
        DNS_OK=true
    else
        echo "   ⚠️  Points to different IP, updating..."
        DNS_OK=false
        UPDATE_NEEDED=true
    fi
else
    echo "   ℹ️  No existing A record found"
    DNS_OK=false
fi
echo ""

# Create or update record
if [ "$UPDATE_NEEDED" = true ] && [ -n "$EMAIL" ]; then
    echo "3️⃣  Updating DNS record..."
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$EXISTING_ID" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_API_KEY" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ DNS record updated successfully!"
        echo "   $DOMAIN → $VERCEL_IP"
        DNS_OK=true
    else
        ERROR=$(echo "$UPDATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ❌ Update failed: $ERROR"
        DNS_OK=false
    fi
elif [ "$DNS_OK" = false ] && [ -n "$EMAIL" ]; then
    echo "3️⃣  Creating DNS record..."
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_API_KEY" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ DNS record created successfully!"
        echo "   Record ID: $NEW_ID"
        echo "   $DOMAIN → $VERCEL_IP"
        DNS_OK=true
    else
        ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ Creation failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        echo "   Full response: $CREATE_RESPONSE"
        DNS_OK=false
    fi
elif [ -z "$EMAIL" ]; then
    echo "3️⃣  Cannot proceed without email for Global API Key"
    echo "   → Trying API token method..."
    
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ DNS record created successfully via API token!"
        echo "   Record ID: $NEW_ID"
        echo "   $DOMAIN → $VERCEL_IP"
        DNS_OK=true
    else
        ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ API token method also failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        DNS_OK=false
    fi
else
    echo "3️⃣  DNS record already correct, skipping"
fi
echo ""

# Summary
echo "📋 Summary"
echo "=========="
echo ""

if [ "$DNS_OK" = true ]; then
    echo "🎉 SUCCESS! DNS record configured!"
    echo ""
    echo "✅ DNS Record: $DOMAIN → $VERCEL_IP"
    echo "✅ Proxy: OFF (DNS only)"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Add domain in Vercel Dashboard:"
    echo "      https://vercel.com/dashboard"
    echo "      → Project → Settings → Domains"
    echo "      → Add: $DOMAIN"
    echo ""
    echo "   2. Wait for Cloudflare nameserver verification (1-4 hours)"
    echo "   3. Wait for DNS propagation (15-30 min after verification)"
    echo "   4. Domain will be live!"
else
    echo "⚠️  Could not add DNS record via API"
    echo ""
    echo "Manual Setup Required:"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Click: $DOMAIN"
    echo "   3. Go to: DNS section"
    echo "   4. Click: Add record"
    echo "   5. Fill in:"
    echo "      Type: A"
    echo "      Name: @"
    echo "      IPv4: $VERCEL_IP"
    echo "      Proxy: OFF (gray cloud)"
    echo "   6. Save"
fi

echo ""
echo "🌐 Target: https://$DOMAIN"
echo ""

