#!/bin/bash

DOMAIN="cursorsalestrainer.com"

echo "🔍 Checking domain status for: $DOMAIN"
echo ""

# Check DNS resolution
echo "1️⃣  DNS Resolution Check:"
DNS_RESULT=$(dig +short $DOMAIN 2>&1)
if [ -z "$DNS_RESULT" ]; then
    echo "   ❌ Domain not resolving (DNS not configured or not propagated)"
    echo "   → Action: Configure DNS records at your domain registrar"
else
    echo "   ✅ DNS resolving to: $DNS_RESULT"
fi
echo ""

# Check HTTP/HTTPS connectivity
echo "2️⃣  HTTP/HTTPS Connectivity Check:"
HTTP_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN 2>&1)
if [ "$HTTP_STATUS" = "000" ] || [ -z "$HTTP_STATUS" ]; then
    echo "   ❌ Cannot connect to domain (DNS not configured or not propagated)"
    echo "   → Action: Wait for DNS propagation (can take 15 min - 48 hours)"
else
    echo "   ✅ Domain responding with HTTP $HTTP_STATUS"
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        echo "   ✅ Domain is LIVE!"
    fi
fi
echo ""

# Check www subdomain
echo "3️⃣  WWW Subdomain Check:"
WWW_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 10 https://www.$DOMAIN 2>&1)
if [ "$WWW_STATUS" = "000" ] || [ -z "$WWW_STATUS" ]; then
    echo "   ❌ www.$DOMAIN not accessible"
else
    echo "   ✅ www.$DOMAIN responding with HTTP $WWW_STATUS"
fi
echo ""

# Summary
echo "📋 Summary:"
if [ -z "$DNS_RESULT" ]; then
    echo "   ⚠️  Domain is NOT live yet"
    echo ""
    echo "   Next steps:"
    echo "   1. Go to Vercel Dashboard → Your Project → Settings → Domains"
    echo "   2. Add domain: $DOMAIN"
    echo "   3. Configure DNS records at your domain registrar:"
    echo "      - Type: A record"
    echo "      - Name: @ (or root)"
    echo "      - Value: 76.76.21.21"
    echo "   4. Wait for DNS propagation (15 min - 48 hours)"
    echo "   5. Run this script again to check status"
else
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        echo "   ✅ Domain is LIVE and accessible!"
        echo "   🌐 Visit: https://$DOMAIN"
    else
        echo "   ⏳ DNS configured but domain not fully live yet"
        echo "   → Wait a few more minutes for SSL certificate provisioning"
    fi
fi
echo ""

