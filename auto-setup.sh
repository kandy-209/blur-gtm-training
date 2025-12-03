#!/bin/bash

DOMAIN="cursorsalestrainer.com"
VERCEL_IP="76.76.21.21"
CLOUDFLARE_ZONE_ID="9f4d9c373158101c337560c078c73081"
CLOUDFLARE_ACCOUNT_ID="79f0e13e07f30225fb62e1b3dc0d0c53"

echo "🚀 Automated Setup Check for $DOMAIN"
echo "======================================"
echo ""

# Check if Cloudflare API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "ℹ️  Cloudflare API Token not set"
    echo "   To enable automated DNS management, set CLOUDFLARE_API_TOKEN"
    echo "   Get token from: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    echo "   Then run: export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
fi

# Check DNS resolution
echo "1️⃣  Checking DNS Resolution..."
DNS_RESULT=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)

if [ -z "$DNS_RESULT" ] || [ "$DNS_RESULT" = ";; connection timed out" ]; then
    echo "   ❌ DNS not resolving"
    echo "   → Action needed: Add A record in Cloudflare"
    DNS_OK=false
else
    echo "   ✅ DNS resolving to: $DNS_RESULT"
    if [ "$DNS_RESULT" = "$VERCEL_IP" ]; then
        echo "   ✅ Correct IP address!"
        DNS_OK=true
    else
        echo "   ⚠️  IP doesn't match Vercel IP ($VERCEL_IP)"
        echo "   Current IP: $DNS_RESULT"
        DNS_OK=false
    fi
fi
echo ""

# Check nameservers
echo "2️⃣  Checking Nameservers..."
NS_RESULT=$(dig +short NS $DOMAIN @8.8.8.8 2>&1 | grep -i cloudflare | head -2)

if echo "$NS_RESULT" | grep -qi "cloudflare"; then
    echo "   ✅ Using Cloudflare nameservers"
    echo "$NS_RESULT" | while read ns; do
        echo "      - $ns"
    done
    NS_OK=true
else
    echo "   ⚠️  Not using Cloudflare nameservers"
    NS_OK=false
fi
echo ""

# Check HTTP connectivity
echo "3️⃣  Checking HTTP/HTTPS..."
HTTP_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN 2>&1)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ] || [ "$HTTP_STATUS" = "307" ]; then
    echo "   ✅ Domain is LIVE! (HTTP $HTTP_STATUS)"
    echo "   🌐 Visit: https://$DOMAIN"
    HTTP_OK=true
elif [ "$HTTP_STATUS" = "000" ] || [ -z "$HTTP_STATUS" ]; then
    echo "   ⏳ Cannot connect (DNS may still be propagating)"
    HTTP_OK=false
else
    echo "   ⚠️  Domain responding with status: $HTTP_STATUS"
    HTTP_OK=false
fi
echo ""

# Summary
echo "📋 Current Status"
echo "================="
echo ""

if [ "$DNS_OK" = true ] && [ "$HTTP_OK" = true ]; then
    echo "🎉 SUCCESS! Domain is LIVE!"
    echo ""
    echo "✅ DNS: Configured correctly"
    echo "✅ Domain: https://$DOMAIN"
    echo "✅ SSL: Should be working"
    echo ""
    echo "Your site is ready to use!"
elif [ "$DNS_OK" = true ] && [ "$HTTP_OK" = false ]; then
    echo "⏳ Almost there!"
    echo ""
    echo "✅ DNS is configured"
    echo "⏳ Waiting for Vercel to provision SSL (5-10 min)"
    echo ""
    echo "Next steps:"
    echo "1. Make sure domain is added in Vercel Dashboard"
    echo "2. Wait 5-10 minutes"
    echo "3. Run this script again"
elif [ "$NS_OK" = false ]; then
    echo "⚠️  Nameservers need configuration"
    echo ""
    echo "Action needed:"
    echo "1. Update nameservers at your registrar to:"
    echo "   - emma.ns.cloudflare.com"
    echo "   - henry.ns.cloudflare.com"
    echo "2. Wait 15-30 minutes"
    echo "3. Run this script again"
else
    echo "⏳ Setup in progress..."
    echo ""
    echo "Remaining steps:"
    echo ""
    echo "1. Add DNS A record in Cloudflare:"
    echo "   - Go to: https://dash.cloudflare.com"
    echo "   - Click on: $DOMAIN"
    echo "   - Go to: DNS section"
    echo "   - Add record:"
    echo "     Type: A"
    echo "     Name: @"
    echo "     IPv4: $VERCEL_IP"
    echo "     Proxy: OFF (gray cloud)"
    echo ""
    echo "2. Disable DNSSEC in Cloudflare:"
    echo "   - DNS section → DNSSEC → Disable"
    echo ""
    echo "3. Add domain in Vercel:"
    echo "   - Go to: https://vercel.com/dashboard"
    echo "   - Project → Settings → Domains"
    echo "   - Add: $DOMAIN"
    echo ""
    echo "4. Wait 15-30 minutes for propagation"
    echo "5. Run this script again to verify"
fi

echo ""
echo "📚 Detailed guides:"
echo "   - CURSORSALESTRAINER_SETUP.md"
echo "   - CLOUDFLARE_SETUP_GUIDE.md"
echo ""

