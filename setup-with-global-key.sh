#!/bin/bash

# Cloudflare Global API Key (more permissions)
GLOBAL_API_KEY="d643ee4dee7ad53f91744d0da86b83ad15891"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_IP="216.150.1.1"  # Vercel's IP from their instructions

# Need email for Global API Key authentication
# Will try to get from token verification
echo "🔑 Setting up with Cloudflare Global API Key"
echo "============================================="
echo ""

# Get email from token
echo "1️⃣  Getting account email..."
EMAIL_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS")

EMAIL=$(echo "$EMAIL_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)

if [ -z "$EMAIL" ]; then
    echo "   ⚠️  Could not get email automatically"
    echo "   → Please provide your Cloudflare account email"
    echo "   → Or we can use API token method instead"
    EMAIL=""
else
    echo "   ✅ Found email: $EMAIL"
fi
echo ""

# Check existing DNS records
echo "2️⃣  Checking existing DNS records..."
if [ -n "$EMAIL" ]; then
    DNS_LIST=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "X-Auth-Email: $EMAIL" \
      -H "X-Auth-Key: $GLOBAL_API_KEY" \
      -H "Content-Type: application/json")
else
    # Try with API token instead
    DNS_LIST=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
      -H "Authorization: Bearer qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS" \
      -H "Content-Type: application/json")
fi

EXISTING_ID=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
EXISTING_IP=$(echo "$DNS_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_ID" ]; then
    echo "   ℹ️  Found existing A record (ID: $EXISTING_ID)"
    echo "   Current IP: $EXISTING_IP"
    
    if [ "$EXISTING_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Already points to Vercel IP!"
        DNS_OK=true
    else
        echo "   ⚠️  Points to different IP, will update"
        DNS_OK=false
        UPDATE_NEEDED=true
    fi
else
    echo "   ℹ️  No existing A record found, will create"
    DNS_OK=false
fi
echo ""

# Create or update DNS record
if [ "$UPDATE_NEEDED" = true ] && [ -n "$EMAIL" ]; then
    echo "3️⃣  Updating DNS record to point to Vercel..."
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
    echo "3️⃣  Creating DNS record pointing to Vercel..."
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
        DNS_OK=false
    fi
elif [ -z "$EMAIL" ]; then
    echo "3️⃣  Cannot proceed without email"
    echo "   → Will use API token method instead"
    DNS_OK=false
else
    echo "3️⃣  DNS record already correct, skipping"
fi
echo ""

# Verify DNS
echo "4️⃣  Verifying DNS configuration..."
sleep 2
DNS_CHECK=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)

if [ "$DNS_CHECK" = "$VERCEL_IP" ]; then
    echo "   ✅ DNS is resolving correctly!"
    echo "   $DOMAIN → $VERCEL_IP"
    VERIFY_OK=true
else
    echo "   ⏳ DNS not yet propagated"
    echo "   Current: $DNS_CHECK"
    echo "   Expected: $VERCEL_IP"
    echo "   → Wait 15-30 minutes"
    VERIFY_OK=false
fi
echo ""

# Summary
echo "📋 Setup Summary"
echo "================"
echo ""

if [ "$DNS_OK" = true ]; then
    echo "✅ DNS Record: Configured"
    echo "   $DOMAIN → $VERCEL_IP"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Add domain in Vercel Dashboard:"
    echo "      - Go to: https://vercel.com/dashboard"
    echo "      - Project → Settings → Domains"
    echo "      - Add: $DOMAIN"
    echo ""
    echo "   2. Wait 15-30 minutes for DNS propagation"
    echo ""
    echo "   3. Domain will be live at: https://$DOMAIN"
else
    echo "⚠️  DNS Record: Needs manual setup"
    echo ""
    echo "Manual Steps:"
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
echo "🌐 Your domain will be: https://$DOMAIN"
echo ""

