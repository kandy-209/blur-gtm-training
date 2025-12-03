#!/bin/bash

DOMAIN="cursorsalestrainer.com"
VERCEL_IP="76.76.21.21"

echo "🚀 Completing Cloudflare + Vercel Setup"
echo "========================================"
echo ""

# Check DNS resolution
echo "1️⃣  Checking DNS Resolution..."
DNS_RESULT=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)

if [ -z "$DNS_RESULT" ] || [ "$DNS_RESULT" = ";; connection timed out" ]; then
    echo "   ⏳ DNS not resolving yet (may still be propagating)"
    echo "   → Action: Wait 15-30 minutes for DNS propagation"
    DNS_OK=false
else
    echo "   ✅ DNS resolving to: $DNS_RESULT"
    if [ "$DNS_RESULT" = "$VERCEL_IP" ]; then
        echo "   ✅ Correct IP address!"
        DNS_OK=true
    else
        echo "   ⚠️  IP doesn't match Vercel IP ($VERCEL_IP)"
        echo "   → Action: Check DNS records in Cloudflare"
        DNS_OK=false
    fi
fi
echo ""

# Check HTTP connectivity
echo "2️⃣  Checking HTTP/HTTPS Connectivity..."
HTTP_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN 2>&1)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ] || [ "$HTTP_STATUS" = "307" ]; then
    echo "   ✅ Domain is LIVE! (HTTP $HTTP_STATUS)"
    HTTP_OK=true
elif [ "$HTTP_STATUS" = "000" ] || [ -z "$HTTP_STATUS" ]; then
    echo "   ⏳ Cannot connect (DNS may still be propagating)"
    HTTP_OK=false
else
    echo "   ⚠️  Domain responding but with status: $HTTP_STATUS"
    HTTP_OK=false
fi
echo ""

# Check nameservers
echo "3️⃣  Checking Nameservers..."
NS_RESULT=$(dig +short NS $DOMAIN @8.8.8.8 2>&1 | grep -i cloudflare | head -2)

if echo "$NS_RESULT" | grep -qi "cloudflare"; then
    echo "   ✅ Using Cloudflare nameservers:"
    echo "$NS_RESULT" | while read ns; do
        echo "      - $ns"
    done
    NS_OK=true
else
    echo "   ⚠️  Not using Cloudflare nameservers yet"
    echo "   → Action: Update nameservers at your registrar"
    NS_OK=false
fi
echo ""

# Summary and next steps
echo "📋 Setup Status Summary"
echo "======================="
echo ""

if [ "$DNS_OK" = true ] && [ "$HTTP_OK" = true ]; then
    echo "🎉 SUCCESS! Your domain is LIVE!"
    echo ""
    echo "✅ Domain: https://$DOMAIN"
    echo "✅ DNS: Configured correctly"
    echo "✅ SSL: Should be working"
    echo ""
    echo "Next steps:"
    echo "1. Visit: https://$DOMAIN"
    echo "2. Test all features"
    echo "3. Share your domain!"
elif [ "$DNS_OK" = true ] && [ "$HTTP_OK" = false ]; then
    echo "⏳ Almost there! DNS is configured but domain not fully live yet."
    echo ""
    echo "Remaining steps:"
    echo "1. ✅ DNS configured"
    echo "2. ⏳ Wait for DNS propagation (15-30 min)"
    echo "3. ⏳ Vercel will auto-provision SSL (5-10 min)"
    echo "4. ⏳ Check Vercel Dashboard → Settings → Domains"
    echo ""
    echo "Run this script again in 15 minutes to check status."
elif [ "$NS_OK" = false ]; then
    echo "⚠️  Nameservers need to be configured first."
    echo ""
    echo "Steps to complete:"
    echo "1. Go to your domain registrar"
    echo "2. Update nameservers to:"
    echo "   - emma.ns.cloudflare.com"
    echo "   - henry.ns.cloudflare.com"
    echo "3. Wait 15-30 minutes"
    echo "4. Run this script again"
else
    echo "⏳ Setup in progress..."
    echo ""
    echo "Current status:"
    [ "$DNS_OK" = true ] && echo "✅ DNS resolving" || echo "⏳ DNS not resolving yet"
    [ "$HTTP_OK" = true ] && echo "✅ Domain accessible" || echo "⏳ Domain not accessible yet"
    [ "$NS_OK" = true ] && echo "✅ Nameservers configured" || echo "⏳ Nameservers need setup"
    echo ""
    echo "Next steps:"
    echo "1. Ensure DNS records are added in Cloudflare:"
    echo "   - Type: A"
    echo "   - Name: @"
    echo "   - Value: $VERCEL_IP"
    echo "   - Proxy: OFF (gray cloud)"
    echo ""
    echo "2. Add domain in Vercel Dashboard:"
    echo "   - Settings → Domains → Add Domain"
    echo "   - Enter: $DOMAIN"
    echo ""
    echo "3. Wait 15-30 minutes for propagation"
    echo "4. Run this script again to check status"
fi

echo ""
echo "📚 For detailed instructions, see:"
echo "   - CLOUDFLARE_SETUP_GUIDE.md"
echo "   - DNS_CONFIGURATION_GUIDE.md"
echo ""

