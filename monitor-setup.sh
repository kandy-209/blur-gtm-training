#!/bin/bash

DOMAIN="cursorsalestrainer.com"
VERCEL_IP="76.76.21.21"

echo "🔍 Monitoring Setup Progress..."
echo "==============================="
echo ""

while true; do
    clear
    echo "🔍 Monitoring: $DOMAIN"
    echo "======================"
    echo ""
    echo "Checking at: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Check DNS
    DNS_RESULT=$(dig +short $DOMAIN @8.8.8.8 2>&1 | head -1)
    
    if [ "$DNS_RESULT" = "$VERCEL_IP" ]; then
        echo "✅ DNS: Resolved correctly ($DNS_RESULT)"
        DNS_OK=true
    elif [ -n "$DNS_RESULT" ] && [ "$DNS_RESULT" != ";; connection timed out" ]; then
        echo "⚠️  DNS: Resolved to $DNS_RESULT (expected $VERCEL_IP)"
        DNS_OK=false
    else
        echo "⏳ DNS: Not yet resolved"
        DNS_OK=false
    fi
    
    # Check HTTP
    HTTP_STATUS=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 5 https://$DOMAIN 2>&1)
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ] || [ "$HTTP_STATUS" = "307" ]; then
        echo "✅ HTTP: Domain is LIVE! (Status: $HTTP_STATUS)"
        HTTP_OK=true
    elif [ "$HTTP_STATUS" = "000" ] || [ -z "$HTTP_STATUS" ]; then
        echo "⏳ HTTP: Not accessible yet"
        HTTP_OK=false
    else
        echo "⚠️  HTTP: Responding with status $HTTP_STATUS"
        HTTP_OK=false
    fi
    
    echo ""
    
    if [ "$DNS_OK" = true ] && [ "$HTTP_OK" = true ]; then
        echo "🎉 SUCCESS! Domain is LIVE!"
        echo ""
        echo "✅ Visit: https://$DOMAIN"
        echo ""
        echo "Setup complete! Press Ctrl+C to exit monitoring."
    else
        echo "⏳ Still waiting for setup to complete..."
        echo ""
        echo "Next check in 30 seconds..."
        echo "(Press Ctrl+C to stop monitoring)"
    fi
    
    sleep 30
done

