#!/bin/bash
# Open Supabase SQL Editor and copy SQL to clipboard

echo "🚀 Opening Supabase SQL Editor..."
open "https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn/sql/new"

sleep 2

echo "📋 Copying SQL to clipboard..."
cat "$(dirname "$0")/../supabase/migrations/ALL_MIGRATIONS_SAFE.sql" | pbcopy

echo "✅ Done!"
echo ""
echo "📝 Next steps:"
echo "   1. Wait for the SQL Editor to load in your browser"
echo "   2. Click in the editor text area"
echo "   3. Paste (Cmd+V) - SQL is already in your clipboard"
echo "   4. Click the green 'Run' button"
echo ""
