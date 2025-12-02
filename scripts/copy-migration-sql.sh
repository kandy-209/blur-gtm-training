#!/bin/bash

# Copy Migration SQL to Clipboard
# This makes it easy to paste into Supabase SQL Editor

SQL_FILE="scripts/create-supabase-tables.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

# Detect OS and copy to clipboard
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    pbcopy < "$SQL_FILE"
    echo "✅ SQL copied to clipboard!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to: https://supabase.com/dashboard/project/kjzoqieqrknhnehpufks/sql/new"
    echo "   2. Sign in to Supabase"
    echo "   3. Paste (Cmd + V) into SQL Editor"
    echo "   4. Click 'Run'"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xclip &> /dev/null; then
        xclip -selection clipboard < "$SQL_FILE"
        echo "✅ SQL copied to clipboard!"
    elif command -v xsel &> /dev/null; then
        xsel --clipboard --input < "$SQL_FILE"
        echo "✅ SQL copied to clipboard!"
    else
        echo "⚠️  Install xclip or xsel to copy to clipboard"
        echo "   Or manually copy from: $SQL_FILE"
        exit 1
    fi
else
    echo "⚠️  Unsupported OS. Please manually copy from: $SQL_FILE"
    exit 1
fi

echo ""
echo "🔗 SQL Editor: https://supabase.com/dashboard/project/kjzoqieqrknhnehpufks/sql/new"

