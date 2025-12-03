#!/bin/bash

# Cloudflare API Configuration
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_IP="76.76.21.21"

echo "🚀 Automated Cloudflare DNS Setup"
echo "=================================="
echo ""

# Verify token
echo "1️⃣  Verifying API Token..."
VERIFY_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $API_TOKEN")

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ API Token is valid"
    USER_EMAIL=$(echo "$VERIFY_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Authenticated as: $USER_EMAIL"
else
    echo "   ❌ API Token verification failed"
    echo "   Response: $VERIFY_RESPONSE"
    exit 1
fi
echo ""

# Check existing DNS records
echo "2️⃣  Checking existing DNS records..."
DNS_RECORDS=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

EXISTING_RECORD=$(echo "$DNS_RECORDS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_RECORD" ]; then
    echo "   ℹ️  Found existing A record (ID: $EXISTING_RECORD)"
    CURRENT_IP=$(echo "$DNS_RECORDS" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Current IP: $CURRENT_IP"
    
    if [ "$CURRENT_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Record already points to correct IP ($VERCEL_IP)"
        RECORD_EXISTS=true
        RECORD_ID="$EXISTING_RECORD"
    else
        echo "   ⚠️  Record points to different IP, will update"
        RECORD_EXISTS=true
        RECORD_ID="$EXISTING_RECORD"
        NEEDS_UPDATE=true
    fi
else
    echo "   ℹ️  No existing A record found, will create new one"
    RECORD_EXISTS=false
fi
echo ""

# Create or update DNS record
if [ "$RECORD_EXISTS" = true ] && [ "$NEEDS_UPDATE" = true ]; then
    echo "3️⃣  Updating DNS A record..."
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ DNS record updated successfully"
        echo "   Record: $DOMAIN → $VERCEL_IP"
    else
        echo "   ❌ Failed to update DNS record"
        echo "   Response: $UPDATE_RESPONSE"
        exit 1
    fi
elif [ "$RECORD_EXISTS" = false ]; then
    echo "3️⃣  Creating DNS A record..."
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ DNS record created successfully"
        echo "   Record: $DOMAIN → $VERCEL_IP"
        RECORD_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    else
        echo "   ❌ Failed to create DNS record"
        echo "   Response: $CREATE_RESPONSE"
        exit 1
    fi
else
    echo "3️⃣  DNS record already correct, skipping update"
fi
echo ""

# Check DNSSEC status
echo "4️⃣  Checking DNSSEC status..."
DNSSEC_STATUS=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dnssec" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

DNSSEC_ENABLED=$(echo "$DNSSEC_STATUS" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$DNSSEC_ENABLED" = "active" ]; then
    echo "   ⚠️  DNSSEC is enabled (should be disabled for Vercel)"
    echo "   → Note: DNSSEC cannot be disabled via API"
    echo "   → Please disable manually in Cloudflare Dashboard:"
    echo "     DNS section → DNSSEC → Disable"
else
    echo "   ✅ DNSSEC is disabled (correct for Vercel)"
fi
echo ""

# Verify record
echo "5️⃣  Verifying DNS record..."
sleep 2
VERIFY_DNS=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)

if [ "$VERIFY_DNS" = "$VERCEL_IP" ]; then
    echo "   ✅ DNS record verified!"
    echo "   $DOMAIN resolves to $VERCEL_IP"
else
    echo "   ⏳ DNS not yet propagated (this is normal)"
    echo "   Current result: $VERIFY_DNS"
    echo "   Expected: $VERCEL_IP"
    echo "   → Wait 15-30 minutes for DNS propagation"
fi
echo ""

# Summary
echo "📋 Setup Summary"
echo "================"
echo ""
echo "✅ DNS A record configured:"
echo "   Domain: $DOMAIN"
echo "   IP: $VERCEL_IP"
echo "   Proxy: OFF (DNS only)"
echo ""

if [ "$DNSSEC_ENABLED" = "active" ]; then
    echo "⚠️  Action needed:"
    echo "   - Disable DNSSEC in Cloudflare Dashboard"
    echo "   - Go to: DNS → DNSSEC → Disable"
    echo ""
fi

echo "📝 Next Steps:"
echo "   1. ✅ DNS record added (done)"
if [ "$DNSSEC_ENABLED" = "active" ]; then
    echo "   2. ⚠️  Disable DNSSEC manually (if enabled)"
fi
echo "   3. ➡️  Add domain in Vercel Dashboard:"
echo "      - Go to: https://vercel.com/dashboard"
echo "      - Project → Settings → Domains"
echo "      - Add: $DOMAIN"
echo "   4. ⏳ Wait 15-30 minutes for DNS propagation"
echo "   5. ✅ Domain will be live!"
echo ""
echo "🌐 Your domain will be: https://$DOMAIN"
echo ""

