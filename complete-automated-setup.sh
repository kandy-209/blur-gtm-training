#!/bin/bash

# Configuration
API_TOKEN="qKctr2XpurNBdN2EPjfN706GmiJJ9BuepMMqGSUS"
ZONE_ID="9f4d9c373158101c337560c078c73081"
DOMAIN="cursorsalestrainer.com"
VERCEL_IP="76.76.21.21"

echo "🚀 Complete Automated Setup"
echo "============================"
echo ""

# Step 1: Verify API Token
echo "1️⃣  Verifying API Token..."
VERIFY=$(curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $API_TOKEN")

if echo "$VERIFY" | grep -q '"success":true'; then
    echo "   ✅ API Token is valid"
else
    echo "   ❌ API Token invalid"
    exit 1
fi
echo ""

# Step 2: Check Zone Access
echo "2️⃣  Checking Zone Access..."
ZONE_INFO=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

if echo "$ZONE_INFO" | grep -q '"success":true'; then
    ZONE_NAME=$(echo "$ZONE_INFO" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   ✅ Zone access confirmed: $ZONE_NAME"
else
    echo "   ⚠️  Cannot access zone (may need zone-specific token)"
    echo "   → Will provide manual instructions"
    ZONE_ACCESS=false
fi
echo ""

# Step 3: Check Existing DNS Records
echo "3️⃣  Checking Existing DNS Records..."
DNS_LIST=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=A&name=$DOMAIN" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

EXISTING_ID=$(echo "$DNS_LIST" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
EXISTING_IP=$(echo "$DNS_LIST" | grep -o '"content":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EXISTING_ID" ]; then
    echo "   ℹ️  Found existing A record"
    echo "   Record ID: $EXISTING_ID"
    echo "   Current IP: $EXISTING_IP"
    
    if [ "$EXISTING_IP" = "$VERCEL_IP" ]; then
        echo "   ✅ Already points to correct IP!"
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

# Step 4: Create or Update DNS Record
if [ "$UPDATE_NEEDED" = true ]; then
    echo "4️⃣  Updating DNS Record..."
    UPDATE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$EXISTING_ID" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ DNS record updated!"
        DNS_OK=true
    else
        ERROR=$(echo "$UPDATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ❌ Update failed: $ERROR"
        echo "   → Manual setup required (see instructions below)"
    fi
elif [ "$DNS_OK" = false ]; then
    echo "4️⃣  Creating DNS Record..."
    CREATE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    
    if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
        NEW_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   ✅ DNS record created! (ID: $NEW_ID)"
        DNS_OK=true
    else
        ERROR=$(echo "$CREATE_RESPONSE" | grep -o '"message":"[^"]*' | head -1 | cut -d'"' -f4)
        ERROR_CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | head -1 | cut -d':' -f2)
        echo "   ❌ Creation failed"
        echo "   Error Code: $ERROR_CODE"
        echo "   Error: $ERROR"
        echo "   → Manual setup required (see instructions below)"
    fi
else
    echo "4️⃣  DNS record already correct, skipping"
fi
echo ""

# Step 5: Check DNSSEC
echo "5️⃣  Checking DNSSEC Status..."
DNSSEC_STATUS=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dnssec" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

DNSSEC_STATE=$(echo "$DNSSEC_STATUS" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$DNSSEC_STATE" = "active" ]; then
    echo "   ⚠️  DNSSEC is enabled (should be disabled for Vercel)"
    echo "   → Please disable manually: DNS → DNSSEC → Disable"
    DNSSEC_OK=false
else
    echo "   ✅ DNSSEC is disabled (correct)"
    DNSSEC_OK=true
fi
echo ""

# Step 6: Verify DNS Propagation
echo "6️⃣  Verifying DNS Propagation..."
sleep 3
DNS_CHECK=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)

if [ "$DNS_CHECK" = "$VERCEL_IP" ]; then
    echo "   ✅ DNS is propagating correctly!"
    echo "   $DOMAIN → $VERCEL_IP"
    PROPAGATION_OK=true
else
    echo "   ⏳ DNS not yet propagated (this is normal)"
    echo "   Current: $DNS_CHECK"
    echo "   Expected: $VERCEL_IP"
    echo "   → Wait 15-30 minutes"
    PROPAGATION_OK=false
fi
echo ""

# Summary
echo "📋 Setup Summary"
echo "================"
echo ""

if [ "$DNS_OK" = true ]; then
    echo "✅ DNS Record: Configured"
    echo "   $DOMAIN → $VERCEL_IP"
else
    echo "❌ DNS Record: Needs manual setup"
    echo "   See manual instructions below"
fi

if [ "$DNSSEC_OK" = true ]; then
    echo "✅ DNSSEC: Disabled (correct)"
else
    echo "⚠️  DNSSEC: Enabled (should disable manually)"
fi

if [ "$PROPAGATION_OK" = true ]; then
    echo "✅ DNS Propagation: Complete"
else
    echo "⏳ DNS Propagation: In progress (wait 15-30 min)"
fi

echo ""
echo "📝 Next Steps:"
echo ""

if [ "$DNS_OK" = false ]; then
    echo "⚠️  MANUAL ACTION REQUIRED:"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Click: $DOMAIN"
    echo "   3. Go to: DNS section"
    echo "   4. Add A record:"
    echo "      Type: A"
    echo "      Name: @"
    echo "      IPv4: $VERCEL_IP"
    echo "      Proxy: OFF"
    echo "   5. Save"
    echo ""
fi

if [ "$DNSSEC_OK" = false ]; then
    echo "⚠️  MANUAL ACTION REQUIRED:"
    echo "   1. In Cloudflare DNS section"
    echo "   2. Scroll to DNSSEC"
    echo "   3. Click Disable"
    echo ""
fi

echo "➡️  Add Domain in Vercel:"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Project → Settings → Domains"
echo "   3. Add: $DOMAIN"
echo "   4. Wait for verification (15-30 min)"
echo ""

if [ "$DNS_OK" = true ] && [ "$PROPAGATION_OK" = true ]; then
    echo "🎉 Almost done! Just add domain in Vercel and wait!"
else
    echo "⏳ Complete manual steps above, then wait for propagation"
fi

echo ""
echo "🌐 Your domain will be: https://$DOMAIN"
echo ""

