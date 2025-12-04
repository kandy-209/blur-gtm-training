#!/bin/bash
# Bash script to check for dependency updates
# Run daily to check for outdated packages and security vulnerabilities

echo "🔍 Checking for dependency updates..."
echo ""

# Check for outdated packages
echo "📦 Checking outdated packages..."
OUTDATED=$(npm outdated --json 2>/dev/null)

if [ -n "$OUTDATED" ] && [ "$OUTDATED" != "{}" ]; then
    echo "⚠️  Found outdated packages:"
    echo "$OUTDATED" | jq -r 'to_entries[] | "  • \(.key)\n    Current: \(.value.current) → Wanted: \(.value.wanted) → Latest: \(.value.latest)"'
else
    echo "✅ All packages are up to date!"
fi

echo ""

# Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
AUDIT=$(npm audit --json 2>/dev/null)

if [ -n "$AUDIT" ]; then
    VULN_COUNT=$(echo "$AUDIT" | jq '.vulnerabilities | length' 2>/dev/null || echo "0")
    
    if [ "$VULN_COUNT" -gt 0 ]; then
        echo "⚠️  Found $VULN_COUNT vulnerabilities:"
        
        CRITICAL=$(echo "$AUDIT" | jq '[.vulnerabilities[] | select(.severity == "critical")] | length' 2>/dev/null || echo "0")
        HIGH=$(echo "$AUDIT" | jq '[.vulnerabilities[] | select(.severity == "high")] | length' 2>/dev/null || echo "0")
        MODERATE=$(echo "$AUDIT" | jq '[.vulnerabilities[] | select(.severity == "moderate")] | length' 2>/dev/null || echo "0")
        LOW=$(echo "$AUDIT" | jq '[.vulnerabilities[] | select(.severity == "low")] | length' 2>/dev/null || echo "0")
        
        echo "  Critical: $CRITICAL"
        echo "  High: $HIGH"
        echo "  Moderate: $MODERATE"
        echo "  Low: $LOW"
        echo ""
        echo "💡 Run 'npm audit fix' to automatically fix vulnerabilities"
    else
        echo "✅ No security vulnerabilities found!"
    fi
else
    echo "✅ No security vulnerabilities found!"
fi

echo ""

# Check for deprecated packages
echo "📋 Checking for deprecated packages..."
DEPRECATED=$(npm list --json 2>/dev/null | jq -r 'paths(scalars) as $p | {($p | join(" > ")): getpath($p)} | select(.[] | type == "string" and contains("deprecated"))' 2>/dev/null)

if [ -n "$DEPRECATED" ] && [ "$DEPRECATED" != "{}" ]; then
    echo "⚠️  Found deprecated packages:"
    echo "$DEPRECATED" | jq -r 'to_entries[] | "  • \(.key)\n    \(.value)"'
else
    echo "✅ No deprecated packages found!"
fi

echo ""
echo "✅ Dependency check complete!"

