#!/usr/bin/env node
/**
 * Test Supabase connection and verify tables
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('🔍 Testing Supabase Connection\n');
console.log(`URL: ${SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'MISSING'}`);
console.log(`Key: ${SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'MISSING'}\n`);

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

async function testConnection() {
  console.log('📡 Testing connection...\n');

  // Test 1: Simple query to auth.users (always exists)
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.log(`⚠️  Auth test: ${error.message}`);
    } else {
      console.log('✅ Supabase connection working');
    }
  } catch (err) {
    console.log(`⚠️  Auth test failed: ${err.message}`);
  }

  // Test 2: Check each table
  const tables = [
    'prospect_intelligence',
    'user_interactions', 
    'account_signals',
    'accounts',
    'prospect_intelligence_runs'
  ];

  console.log('\n📊 Checking tables:\n');

  for (const tableName of tables) {
    try {
      // Try a simple select with limit 0 (just checks if table exists)
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ ${tableName} - Table does not exist`);
        } else if (error.code === 'PGRST116') {
          console.log(`   ❌ ${tableName} - Table not found (PGRST116)`);
        } else {
          console.log(`   ⚠️  ${tableName} - ${error.message} (code: ${error.code})`);
        }
      } else {
        console.log(`   ✅ ${tableName} - Exists and accessible`);
      }
    } catch (err) {
      console.log(`   ❌ ${tableName} - ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 If tables show errors, the SQL may not have executed successfully.');
  console.log('   Check the Supabase SQL Editor for any error messages.\n');
}

testConnection().catch(console.error);
