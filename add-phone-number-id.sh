#!/bin/bash

# Helper script to add Vapi Phone Number ID

echo "📞 Vapi Phone Number ID Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

echo "To get your phoneNumberId:"
echo "1. Go to https://dashboard.vapi.ai/phone-numbers"
echo "2. Click on a phone number (or create one)"
echo "3. Copy the ID"
echo ""
read -p "Enter your VAPI_PHONE_NUMBER_ID: " phone_number_id

if [ -z "$phone_number_id" ]; then
    echo "❌ No phone number ID provided. Exiting."
    exit 1
fi

# Add to .env.local
echo ""
echo "📝 Adding to .env.local..."

# Remove existing VAPI_PHONE_NUMBER_ID if present
sed -i.bak '/^VAPI_PHONE_NUMBER_ID=/d' .env.local 2>/dev/null || true

# Add new ID
echo "VAPI_PHONE_NUMBER_ID=$phone_number_id" >> .env.local

echo "✅ Added to .env.local"
echo ""

# Ask if they want to add to Vercel
read -p "Do you want to add this to Vercel production? (y/n): " add_to_vercel

if [ "$add_to_vercel" = "y" ] || [ "$add_to_vercel" = "Y" ]; then
    echo ""
    echo "📤 Adding to Vercel..."
    
    if command -v vercel &> /dev/null || command -v npx &> /dev/null; then
        echo "$phone_number_id" | npx vercel env add VAPI_PHONE_NUMBER_ID production
        echo "$phone_number_id" | npx vercel env add VAPI_PHONE_NUMBER_ID preview
        echo "$phone_number_id" | npx vercel env add VAPI_PHONE_NUMBER_ID development
        
        echo ""
        echo "✅ Added to Vercel (all environments)"
        echo ""
        echo "⚠️  Don't forget to redeploy:"
        echo "   npx vercel --prod"
    else
        echo "❌ Vercel CLI not found. Please add manually:"
        echo "   1. Go to https://vercel.com/dashboard"
        echo "   2. Select project: cursor-gtm-training"
        echo "   3. Settings → Environment Variables"
        echo "   4. Add VAPI_PHONE_NUMBER_ID = $phone_number_id"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Test locally: http://localhost:3000/sales-training"
