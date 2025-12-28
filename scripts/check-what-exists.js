#!/usr/bin/env node
/**
 * Check what actually exists in the database
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\n/g, '')?.replace(/dxgjaznmtsgvxnfnzhbn/, 'kjzoqieqrknhnehpufks');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()?.replace(/\n/g, '');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function checkDatabase() {
  console.log('🔍 Checking Database State\n');

  // Try to query information_schema via REST API
  // This is a workaround since we can't use raw SQL easily
  
  const tables = [
    'prospect_intelligence',
    'user_interactions',
    'account_signals',
    'accounts',
    'prospect_intelligence_runs'
  ];

  console.log('Checking tables via Supabase REST API:\n');

  for (const tableName of tables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116') {
          console.log(`   ❌ ${tableName} - Table does NOT exist`);
        } else {
          console.log(`   ⚠️  ${tableName} - Error: ${error.message} (code: ${error.code})`);
        }
      } else {
        console.log(`   ✅ ${tableName} - EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`   ❌ ${tableName} - ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 If all show "does NOT exist", the migrations need to be run.');
  console.log('   The SQL is ready in: supabase/migrations/ALL_MIGRATIONS_SAFE.sql\n');
}

checkDatabase().catch(console.error);
