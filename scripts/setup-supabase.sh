#!/bin/bash

# Supabase Setup Script
# This script helps you set up Supabase for the Cursor GTM Training Platform

echo "🚀 Supabase Setup for Cursor GTM Training"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo ""
echo "📋 Please provide your Supabase credentials:"
echo "   (Get these from: https://supabase.com/dashboard → Settings → API)"
echo ""

# Get Supabase URL
read -p "Enter your Supabase Project URL: " SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Supabase URL is required!"
    exit 1
fi

# Get Anon Key
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase Anon Key is required!"
    exit 1
fi

# Get Service Role Key (optional)
read -p "Enter your Supabase Service Role Key (optional, press Enter to skip): " SUPABASE_SERVICE_KEY

# Create .env.local file
echo ""
echo "📝 Creating .env.local file..."

cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

if [ ! -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> .env.local
fi

echo "✅ .env.local file created!"
echo ""

# Check if database-migration.sql exists
if [ -f database-migration.sql ]; then
    echo "📄 Found database-migration.sql"
    echo ""
    echo "⚠️  IMPORTANT: You need to run the database migration manually:"
    echo ""
    echo "   1. Go to: https://supabase.com/dashboard → SQL Editor"
    echo "   2. Click 'New Query'"
    echo "   3. Copy contents of database-migration.sql"
    echo "   4. Paste and click 'Run'"
    echo ""
    read -p "Press Enter when you've completed the migration..."
else
    echo "⚠️  database-migration.sql not found!"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run database migration (see above)"
echo "  2. Enable Email auth in Supabase Dashboard → Authentication → Providers"
echo "  3. Restart your dev server: npm run dev"
echo "  4. Test at: http://localhost:3000/auth"
echo ""

