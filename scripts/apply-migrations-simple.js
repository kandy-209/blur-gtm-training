#!/usr/bin/env node
/**
 * Simple script to apply Supabase migrations
 * Uses Supabase Management API or provides manual instructions
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Optional: for Management API

// Migration files in order
const migrations = [
  'create_prospect_intelligence_table.sql',
  'add_user_interactions_table.sql',
  'add_account_signals_table.sql',
  'add_accounts_table.sql',
  'add_prospect_intelligence_runs_table.sql',
];

function extractProjectRef(url) {
  try {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function applyViaManagementAPI(projectRef, sql) {
  if (!SUPABASE_ACCESS_TOKEN) {
    return { error: 'SUPABASE_ACCESS_TOKEN not set' };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
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

async function main() {
  console.log('🚀 Supabase Migration Applicator\n');
  
  const projectRef = extractProjectRef(SUPABASE_URL || '');
  if (!projectRef) {
    console.error('❌ Could not extract project reference from SUPABASE_URL');
    process.exit(1);
  }

  console.log(`📡 Project: ${projectRef}`);
  console.log(`🔗 Dashboard: https://supabase.com/dashboard/project/${projectRef}\n`);

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const results = [];

  for (const migrationFile of migrations) {
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      results.push({ file: migrationFile, status: 'missing' });
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📝 Processing: ${migrationFile}...`);
    
    // Try Management API if token is available
    if (SUPABASE_ACCESS_TOKEN) {
      const result = await applyViaManagementAPI(projectRef, sql);
      if (result.success) {
        console.log(`✅ Applied via Management API: ${migrationFile}\n`);
        results.push({ file: migrationFile, status: 'applied' });
        continue;
      } else {
        console.log(`⚠️  Management API failed: ${result.error}`);
        console.log(`   → Will provide manual instructions\n`);
      }
    }

    // Fallback: provide manual instructions
    results.push({ file: migrationFile, status: 'manual', sql });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Migration Summary\n');
  
  const applied = results.filter(r => r.status === 'applied').length;
  const manual = results.filter(r => r.status === 'manual').length;
  const missing = results.filter(r => r.status === 'missing').length;

  if (applied > 0) {
    console.log(`✅ ${applied} migration(s) applied automatically`);
  }
  
  if (manual > 0 || missing > 0) {
    console.log(`\n📝 Manual steps required:\n`);
    console.log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log(`   2. Run each migration file in order:\n`);
    
    results.forEach((r, idx) => {
      if (r.status === 'manual' || r.status === 'missing') {
        console.log(`   ${idx + 1}. ${r.file}`);
        if (r.status === 'missing') {
          console.log(`      ⚠️  File not found in supabase/migrations/`);
        }
      }
    });
    
    console.log(`\n   Or use Supabase CLI:`);
    console.log(`   npx supabase login`);
    console.log(`   npx supabase link --project-ref ${projectRef}`);
    console.log(`   npx supabase db push`);
  }

  if (applied === migrations.length) {
    console.log(`\n✨ All migrations applied successfully!`);
  }
}

main().catch(console.error);
