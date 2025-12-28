#!/bin/bash

# Script to run Prospect Intelligence database migration
# This will attempt to run the migration using Supabase CLI if available
# Otherwise, it will provide instructions for manual setup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$PROJECT_DIR/supabase/migrations/create_prospect_intelligence_table.sql"

echo "🚀 Prospect Intelligence Database Migration"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    
    # Check if we're in a Supabase project
    if [ -f "$PROJECT_DIR/supabase/config.toml" ]; then
        echo "✅ Supabase project detected"
        echo ""
        echo "Running migration with Supabase CLI..."
        echo ""
        
        cd "$PROJECT_DIR"
        
        # Try to run the migration
        if supabase db push --file "$MIGRATION_FILE" 2>/dev/null; then
            echo ""
            echo "✅ Migration completed successfully!"
            echo ""
            echo "Your database is now ready to use."
            exit 0
        else
            echo "⚠️  Could not run migration automatically."
            echo "   This might be because:"
            echo "   - You're not linked to a Supabase project"
            echo "   - You need to run 'supabase link' first"
            echo ""
        fi
    else
        echo "⚠️  No Supabase project detected in this directory"
        echo ""
    fi
else
    echo "ℹ️  Supabase CLI not found"
    echo ""
fi

# Fallback: Manual instructions
echo "📋 Manual Setup Instructions:"
echo ""
echo "1. Go to your Supabase Dashboard: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Click 'New Query'"
echo "5. Copy and paste the SQL from: $MIGRATION_FILE"
echo "6. Click 'Run' to execute"
echo ""
echo "Or run the interactive setup script:"
echo "   npm run setup:prospect-db"
echo ""

# Try to open the migration file or copy it
if [ -f "$MIGRATION_FILE" ]; then
    echo "📄 Migration file location: $MIGRATION_FILE"
    echo ""
    
    # On macOS, try to open the file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        read -p "Would you like to open the migration file? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$MIGRATION_FILE"
        fi
    fi
fi

exit 0
