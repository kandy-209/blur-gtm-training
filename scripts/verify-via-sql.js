#!/usr/bin/env node
/**
 * Verify tables by querying information_schema directly
 */

const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Try to get connection string from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()?.replace(/\n/g, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()?.replace(/\n/g, '');

if (!SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Could not extract project ref from URL');
  process.exit(1);
}

console.log(`🔍 Checking tables for project: ${projectRef}\n`);

// Try direct connection (requires DB password which we might not have)
// Instead, let's use the Supabase REST API to query information_schema
// Actually, we can't query information_schema via REST API easily
// Let's just try to query each table directly

const { createClient } = require('@supabase/supabase-js');

// Try both project IDs
const urls = [
  SUPABASE_URL,
  SUPABASE_URL.replace(/dxgjaznmtsgvxnfnzhbn/, 'kjzoqieqrknhnehpufks'),
];

async function checkTable(url, tableName) {
  const supabase = createClient(url, SUPABASE_SERVICE_ROLE_KEY || 'dummy', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return { exists: false, error: 'Table does not exist' };
      }
      return { exists: false, error: error.message };
    }
    return { exists: true, rowCount: count || 0 };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function main() {
  const tables = [
    'prospect_intelligence',
    'user_interactions',
    'account_signals',
    'accounts',
    'prospect_intelligence_runs'
  ];

  console.log('Checking tables...\n');

  for (const url of urls) {
    const projectId = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    console.log(`\n📡 Project: ${projectId}\n`);

    let foundCount = 0;
    for (const tableName of tables) {
      const result = await checkTable(url, tableName);
      if (result.exists) {
        console.log(`   ✅ ${tableName.padEnd(35)} (${result.rowCount || 0} rows)`);
        foundCount++;
      } else {
        console.log(`   ❌ ${tableName.padEnd(35)} ${result.error || 'Not found'}`);
      }
    }

    if (foundCount === 5) {
      console.log(`\n✅ SUCCESS! All 5 tables exist in project ${projectId}!`);
      console.log('\n✨ Phase 1 is fully operational!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  Only ${foundCount}/5 tables found in project ${projectId}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 If tables show as missing, they may need a moment to propagate.');
  console.log('   Or check the SQL Editor results for any errors.\n');
}

main().catch(console.error);
