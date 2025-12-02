// Script to clear all responses from Supabase
// Run with: node scripts/clear-supabase-responses.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjzoqieqrknhnehpufks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqem9xaWVxcmtuaG5laHB1ZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzYyMTEsImV4cCI6MjA4MDE1MjIxMX0.wmg2MRvL778o4r9G6-iYfj-gM-ufJD3tsIEnpkG4Q';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllResponses() {
  try {
    console.log('🔄 Clearing all responses from Supabase...');
    
    // Delete all responses
    const { data, error } = await supabase
      .from('user_responses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Table "user_responses" does not exist. Responses may be stored in-memory only.');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      const deletedCount = Array.isArray(data) ? data.length : 0;
      console.log(`✅ Successfully deleted ${deletedCount} response(s) from Supabase`);
    }
    
    console.log('\n✅ Process complete!');
    console.log('📝 Note: In-memory database resets automatically on each serverless function invocation.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAllResponses();

