#!/usr/bin/env node
/**
 * Apply migrations directly using Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Could not extract project reference');
  process.exit(1);
}

console.log('🚀 Applying Migrations Directly to Supabase\n');
console.log(`📡 Project: ${projectRef}`);
console.log(`🔗 URL: ${SUPABASE_URL}\n`);

// Read the combined SQL file
const combinedFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');
const sql = fs.readFileSync(combinedFile, 'utf8');

// Method 1: Try Supabase Management API
async function applyViaManagementAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          resolve({ error: `HTTP ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

// Method 2: Try using Supabase client with RPC
async function applyViaClient() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments and empty statements
    if (statement.trim().length <= 1 || statement.trim().startsWith('--')) {
      continue;
    }

    try {
      // Try using RPC to execute SQL (if such a function exists)
      // Most Supabase projects don't have this, so we'll try the Management API instead
      console.log(`   Statement ${i + 1}/${statements.length}...`);
    } catch (err) {
      console.log(`   ⚠️  Statement ${i + 1} skipped (RPC not available)`);
    }
  }

  return { error: 'RPC method not available' };
}

// Method 3: Direct Postgres connection (if we can get the password)
async function applyViaPostgres() {
  const { Client } = require('pg');
  
  // Try to get database password from environment
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!dbPassword) {
    return { error: 'Database password not found' };
  }

  const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Postgres\n');
    
    // Execute the entire SQL file
    await client.query(sql);
    
    await client.end();
    return { success: true };
  } catch (err) {
    await client.end().catch(() => {});
    return { error: err.message };
  }
}

// Main execution
async function main() {
  // Try Management API first
  console.log('📡 Attempting Management API...\n');
  const result1 = await applyViaManagementAPI();
  if (result1.success) {
    console.log('✅ Migrations applied successfully via Management API!\n');
    process.exit(0);
  }
  console.log(`⚠️  Management API: ${result1.error}\n`);

  // Try Postgres connection
  console.log('📡 Attempting direct Postgres connection...\n');
  const result2 = await applyViaPostgres();
  if (result2.success) {
    console.log('✅ Migrations applied successfully via Postgres!\n');
    process.exit(0);
  }
  console.log(`⚠️  Postgres: ${result2.error}\n`);

  // Fallback: Provide instructions
  console.log('='.repeat(70));
  console.log('📋 Manual Application Required\n');
  console.log('   The automated methods require additional credentials.\n');
  console.log('   Quickest method:\n');
  console.log(`   1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`   2. Copy contents of: ${combinedFile}`);
  console.log('   3. Paste and click "Run"\n');
  console.log('   Or add to .env.local for automation:');
  console.log('   SUPABASE_DB_PASSWORD=your-db-password');
  console.log('   (Get from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database)\n');
  console.log('='.repeat(70));
}

main().catch(console.error);
