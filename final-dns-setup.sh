#!/bin/bash

# Configuration
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
GLOBAL_KEY="d643ee4dee7ad53f91744d0da86b83ad15891"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_IP="216.150.1.1"  # Vercel's IP from their instructions

echo "🚀 Final DNS Setup for Vercel"
echo "=============================="
echo ""

# Try to add DNS record with API token
echo "1️⃣  Attempting to add DNS record via API..."
CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    RECORD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   ✅ DNS record created successfully!"
    echo "   Record ID: $RECORD_ID"
    echo "   $DOMAIN → $VERCEL_IP"
    DNS_CREATED=true
else
    ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
    ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ "$ERROR_CODE" = "81057" ]; then
        echo "   ℹ️  Record may already exist, checking..."
        DNS_CREATED=false
    else
        echo "   ❌ API creation failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        DNS_CREATED=false
    fi
fi
echo ""

# Check existing records
echo "2️⃣  Checking existing DNS records..."
DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

EXISTING_COUNT=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | wc -l | tr -d ' ')

if [ "$EXISTING_COUNT" -gt 0 ]; then
    echo "   ✅ Found $EXISTING_COUNT DNS record(s)"
    EXISTING_IP=$(echo "$DNS_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Current IP: $EXISTING_IP"
    
    if [ "$EXISTING_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Already points to correct Vercel IP!"
        DNS_OK=true
    else
        echo "   ⚠️  Points to different IP"
        RECORD_ID=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   → Will try to update record $RECORD_ID"
        
        # Try to update
        UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
          -H "Authorization: Bearer $API_TOKEN" \
          -H "Content-Type: application/json" \
          --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
        
        if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
            echo "   ✅ DNS record updated successfully!"
            DNS_OK=true
        else
            UPDATE_ERROR=$(echo "$UPDATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
            echo "   ❌ Update failed: $UPDATE_ERROR"
            DNS_OK=false
        fi
    fi
else
    echo "   ℹ️  No existing A records found"
    DNS_OK=false
fi
echo ""

# Summary
echo "📋 Final Status"
echo "==============="
echo ""

if [ "$DNS_OK" = true ] || [ "$DNS_CREATED" = true ]; then
    echo "✅ DNS Record Configured!"
    echo "   $DOMAIN → $VERCEL_IP"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Add domain in Vercel Dashboard:"
    echo "      https://vercel.com/dashboard"
    echo "      → Project → Settings → Domains"
    echo "      → Add: $DOMAIN"
    echo ""
    echo "   2. Wait 15-30 minutes for DNS propagation"
    echo ""
    echo "   3. Domain will be live at: https://$DOMAIN"
    echo ""
    echo "🎉 DNS setup complete!"
else
    echo "⚠️  Could not configure DNS via API"
    echo ""
    echo "Manual Setup Required:"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Click: $DOMAIN"
    echo "   3. Go to: DNS section"
    echo "   4. Add A record:"
    echo "      Type: A"
    echo "      Name: @"
    echo "      IPv4: $VERCEL_IP"
    echo "      Proxy: OFF (gray cloud)"
    echo "   5. Save"
    echo ""
    echo "Then add domain in Vercel Dashboard"
fi

echo ""
echo "🌐 Target: https://$DOMAIN"
echo ""

