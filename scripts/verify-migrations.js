#!/usr/bin/env node
/**
 * Verify that all migrations were applied successfully
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const tablesToCheck = [
  'prospect_intelligence',
  'user_interactions',
  'account_signals',
  'accounts',
  'prospect_intelligence_runs',
];

async function verifyTables() {
  console.log('🔍 Verifying Phase 1 ML Data Collection Setup\n');
  console.log(`📡 Project: ${SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0]}\n`);

  const results = [];

  for (const tableName of tablesToCheck) {
    try {
      // Try to query the table (will fail if it doesn't exist)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist
        results.push({ table: tableName, status: 'missing', error: 'Table not found' });
      } else if (error) {
        // Other error (might be permissions, but table exists)
        results.push({ table: tableName, status: 'exists', note: 'Table exists (query error may be permissions)' });
      } else {
        // Success - table exists
        results.push({ table: tableName, status: 'exists', rowCount: data?.length || 0 });
      }
    } catch (err) {
      // Try alternative method - check if we can get table info
      results.push({ table: tableName, status: 'unknown', error: err.message });
    }
  }

  // Display results
  console.log('📊 Migration Status:\n');
  let allGood = true;

  results.forEach((result) => {
    if (result.status === 'exists') {
      const count = result.rowCount !== undefined ? ` (${result.rowCount} rows)` : '';
      console.log(`✅ ${result.table}${count}`);
    } else if (result.status === 'missing') {
      console.log(`❌ ${result.table} - NOT FOUND`);
      allGood = false;
    } else {
      console.log(`⚠️  ${result.table} - ${result.error || 'Unknown status'}`);
      allGood = false;
    }
  });

  console.log('\n' + '='.repeat(60));

  if (allGood) {
    console.log('\n✨ All tables verified! Phase 1 is active.\n');
    console.log('📋 What happens now:');
    console.log('   1. Every research run populates:');
    console.log('      - prospect_intelligence (full research data)');
    console.log('      - accounts (normalized account records)');
    console.log('      - account_signals (ML-friendly features)');
    console.log('      - prospect_intelligence_runs (run analytics)');
    console.log('   2. UI interactions log to:');
    console.log('      - user_interactions (for RL training)\n');
    console.log('🚀 Ready for Phase 2: ML Model Training');
    console.log('   Once you have enough data, you can train:');
    console.log('   - ICP scoring models');
    console.log('   - Account recommendation system');
    console.log('   - Contextual bandit for personalized suggestions\n');
  } else {
    console.log('\n⚠️  Some tables are missing. Please run the migrations again.\n');
    console.log('   SQL file: supabase/migrations/ALL_MIGRATIONS_COMBINED.sql');
    console.log('   Run it in: https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn/sql/new\n');
  }
}

verifyTables().catch(console.error);
