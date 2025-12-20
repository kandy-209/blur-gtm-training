#!/usr/bin/env node
/**
 * Direct check of tables using Supabase REST API
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Try both project IDs
const SUPABASE_URL_1 = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\n/g, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()?.replace(/\n/g, '');

// Also try the project ID we found in browser
const SUPABASE_URL_2 = SUPABASE_URL_1?.replace(/dxgjaznmtsgvxnfnzhbn/, 'kjzoqieqrknhnehpufks');

console.log('🔍 Checking Supabase Tables\n');

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function checkTables(url, projectId) {
  console.log(`\n📡 Trying project: ${projectId || 'unknown'}\n`);
  
  const supabase = createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const tables = [
    'prospect_intelligence',
    'user_interactions',
    'account_signals',
    'accounts',
    'prospect_intelligence_runs'
  ];

  const results = {};

  for (const tableName of tables) {
    try {
      // Try to query the table with limit 0 (just checks if it exists)
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116') {
          results[tableName] = { exists: false, error: 'Table does not exist' };
        } else {
          results[tableName] = { exists: false, error: error.message };
        }
      } else {
        results[tableName] = { exists: true, rowCount: count || 0 };
      }
    } catch (err) {
      results[tableName] = { exists: false, error: err.message };
    }
  }

  return results;
}

async function main() {
  let results1 = null;
  let results2 = null;

  if (SUPABASE_URL_1) {
    try {
      results1 = await checkTables(SUPABASE_URL_1, 'dxgjaznmtsgvxnfnzhbn');
    } catch (err) {
      console.log(`⚠️  First URL failed: ${err.message}`);
    }
  }

  if (SUPABASE_URL_2) {
    try {
      results2 = await checkTables(SUPABASE_URL_2, 'kjzoqieqrknhnehpufks');
    } catch (err) {
      console.log(`⚠️  Second URL failed: ${err.message}`);
    }
  }

  // Use whichever one worked
  const results = results2 || results1;

  if (!results) {
    console.error('\n❌ Could not connect to either Supabase project');
    console.log('\n💡 Please check:');
    console.log('   1. Your internet connection');
    console.log('   2. Your SUPABASE_SERVICE_ROLE_KEY is correct');
    console.log('   3. Your NEXT_PUBLIC_SUPABASE_URL is correct');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Table Verification Results\n');

  let allExist = true;
  let existingCount = 0;

  for (const [tableName, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`   ✅ ${tableName.padEnd(35)} (${result.rowCount || 0} rows)`);
      existingCount++;
    } else {
      console.log(`   ❌ ${tableName.padEnd(35)} ${result.error}`);
      allExist = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Summary: ${existingCount}/5 tables found\n`);

  if (allExist && existingCount === 5) {
    console.log('✅ SUCCESS! All migrations are working!\n');
    console.log('✨ Phase 1 is fully operational:');
    console.log('   • All 5 tables created');
    console.log('   • Ready to collect ML training data');
    console.log('   • System is ready for prospect research\n');
  } else {
    console.log('⚠️  Some tables are missing\n');
    console.log('💡 Next steps:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/kjzoqieqrknhnehpufks/sql/new');
    console.log('   2. Open: supabase/migrations/ALL_MIGRATIONS_SAFE.sql');
    console.log('   3. Copy and paste the entire SQL file');
    console.log('   4. Click "Run" (or press Cmd+Enter)');
    console.log('   5. Run this script again to verify\n');
  }
}

main().catch(console.error);
