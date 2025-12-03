#!/bin/bash

DOMAIN="cursorsalestrainer.com"
VERCEL_VERIFICATION="dd76a87b2c0ea9f7.vercel-dns-017.com"
VERCEL_IP="216.150.1.1"

echo "🔍 Checking DNS Status for $DOMAIN"
echo "===================================="
echo ""

# Check www CNAME
echo "1️⃣  Checking www CNAME record..."
WWW_CNAME=$(dig +short www.$DOMAIN CNAME 2>/dev/null | head -1)
if [ -n "$WWW_CNAME" ]; then
    echo "   ✅ www CNAME found: $WWW_CNAME"
    if echo "$WWW_CNAME" | grep -q "$VERCEL_VERIFICATION"; then
        echo "   ✅ Points to correct Vercel verification target!"
        WWW_OK=true
    else
        echo "   ⚠️  Points to different target (expected: $VERCEL_VERIFICATION)"
        WWW_OK=false
    fi
else
    echo "   ❌ www CNAME not found"
    WWW_OK=false
fi
echo ""

# Check root A record
echo "2️⃣  Checking root A record..."
ROOT_A=$(dig +short $DOMAIN A 2>/dev/null | head -1)
if [ -n "$ROOT_A" ]; then
    echo "   ✅ Root A record found: $ROOT_A"
    if [ "$ROOT_A" = "$VERCEL_IP" ]; then
        echo "   ✅ Points to correct Vercel IP!"
        ROOT_OK=true
    else
        echo "   ⚠️  Points to different IP (expected: $VERCEL_IP)"
        ROOT_OK=false
    fi
else
    echo "   ❌ Root A record not found"
    ROOT_OK=false
fi
echo ""

# Check HTTP/HTTPS
echo "3️⃣  Checking HTTP/HTTPS connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://$DOMAIN" 2>/dev/null)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$DOMAIN" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTPS_CODE" = "200" ]; then
    echo "   ✅ Domain is accessible!"
    ACCESSIBLE=true
elif [ "$HTTP_CODE" = "000" ] && [ "$HTTPS_CODE" = "000" ]; then
    echo "   ⏳ Domain not accessible yet (DNS may still be propagating)"
    ACCESSIBLE=false
else
    echo "   ⚠️  HTTP: $HTTP_CODE, HTTPS: $HTTPS_CODE"
    ACCESSIBLE=false
fi
echo ""

# Summary
echo "📋 Status Summary"
echo "================="
if [ "$WWW_OK" = true ]; then
    echo "✅ www CNAME: Configured correctly"
else
    echo "❌ www CNAME: Not configured or incorrect"
fi

if [ "$ROOT_OK" = true ]; then
    echo "✅ Root A Record: Configured correctly"
else
    echo "⚠️  Root A Record: Not configured (optional but recommended)"
fi

if [ "$ACCESSIBLE" = true ]; then
    echo "✅ Domain: Accessible and live!"
    echo ""
    echo "🎉 SUCCESS! Your domain is live:"
    echo "   → https://$DOMAIN"
    echo "   → https://www.$DOMAIN"
elif [ "$WWW_OK" = true ]; then
    echo "⏳ Domain: DNS configured, waiting for propagation..."
    echo ""
    echo "💡 Next steps:"
    echo "   1. Wait 5-10 more minutes"
    echo "   2. Check Vercel Dashboard → Domains"
    echo "   3. Run this script again: ./check-status.sh"
else
    echo "❌ Domain: Not configured yet"
    echo ""
    echo "📝 Action required:"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Add DNS records (see QUICK_SETUP_GUIDE.md)"
    echo "   3. Wait 5-10 minutes"
    echo "   4. Run this script again: ./check-status.sh"
fi

echo ""

