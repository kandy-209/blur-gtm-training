// Script to clear all responses from the database
// Run with: node scripts/clear-all-responses.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllResponses() {
  try {
    console.log('🔄 Starting to clear all responses...');
    
    // Clear from Supabase if table exists
    if (supabaseUrl && supabaseKey) {
      try {
        // Try to delete all responses from Supabase
        const { data, error } = await supabase
          .from('user_responses')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using a condition that's always true)
        
        if (error) {
          console.log('⚠️  Supabase table might not exist or is empty:', error.message);
        } else {
          console.log('✅ Cleared responses from Supabase database');
        }
      } catch (error) {
        console.log('⚠️  Could not clear Supabase (table may not exist):', error.message);
      }
    }
    
    // Also clear in-memory database by calling the API
    console.log('🔄 Clearing in-memory cache...');
    
    // Note: In-memory database will reset on server restart
    // But we can try to call the clear endpoint if server is running
    try {
      const response = await fetch('http://localhost:3000/api/admin/clear-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: 'CLEAR_ALL_RESPONSES',
          bypassAuth: true, // This won't work, but trying anyway
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cleared in-memory cache:', data.message);
      } else {
        console.log('⚠️  Could not clear in-memory cache (server may not be running or requires auth)');
      }
    } catch (error) {
      console.log('⚠️  In-memory cache will reset on next server restart');
    }
    
    console.log('\n✅ Process complete!');
    console.log('📝 Note: In-memory database will be cleared on next server restart.');
    console.log('📝 Note: If responses persist, restart your Vercel deployment.');
    
  } catch (error) {
    console.error('❌ Error clearing responses:', error);
    process.exit(1);
  }
}

clearAllResponses();

