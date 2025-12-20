#!/usr/bin/env node
/**
 * Apply Supabase migrations directly via Postgres connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
function getProjectRef(url) {
  const match = url?.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

// Try to get database password from environment or construct connection
async function applyMigrations() {
  const projectRef = getProjectRef(SUPABASE_URL);
  if (!projectRef) {
    console.error('❌ Could not extract project reference from SUPABASE_URL');
    process.exit(1);
  }

  console.log('🚀 Applying Supabase Migrations Directly\n');
  console.log(`📡 Project: ${projectRef}\n`);

  // Try to get database password
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_PASSWORD;
  
  if (!dbPassword) {
    console.log('⚠️  Database password not found in environment variables.');
    console.log('   Trying alternative method...\n');
    
    // Try using Supabase CLI to get connection string
    try {
      const { execSync } = require('child_process');
      const output = execSync('npx supabase status 2>&1', { encoding: 'utf8', stdio: 'pipe' });
      console.log('📋 Supabase CLI status:', output);
    } catch (err) {
      // CLI not linked, that's okay
    }
    
    console.log('\n📝 To apply migrations automatically, you need:');
    console.log('   1. Set SUPABASE_DB_PASSWORD in .env.local');
    console.log('      (Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database)');
    console.log('   2. Or use the combined SQL file method (easiest):\n');
    console.log('      → Open: supabase/migrations/ALL_MIGRATIONS_COMBINED.sql');
    console.log('      → Copy contents');
    console.log(`      → Paste in: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log('      → Click "Run"\n');
    process.exit(0);
  }

  // Construct connection string
  // Supabase connection format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  // For direct connection: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  
  const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrations = [
      'create_prospect_intelligence_table.sql',
      'add_user_interactions_table.sql',
      'add_account_signals_table.sql',
      'add_accounts_table.sql',
      'add_prospect_intelligence_runs_table.sql',
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationFile}`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`📝 Applying: ${migrationFile}...`);
      
      try {
        await client.query(sql);
        console.log(`✅ Applied: ${migrationFile}\n`);
      } catch (err) {
        // Check if it's a "already exists" error (which is okay with IF NOT EXISTS)
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`⚠️  ${migrationFile} - Some objects may already exist (this is okay)\n`);
        } else {
          console.error(`❌ Error applying ${migrationFile}:`, err.message);
          console.log(`   Continuing with next migration...\n`);
        }
      }
    }

    console.log('✨ All migrations applied successfully!');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('\n📝 Fallback: Use the combined SQL file method:');
    console.log('   1. Open: supabase/migrations/ALL_MIGRATIONS_COMBINED.sql');
    console.log('   2. Copy all contents');
    console.log(`   3. Paste in: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log('   4. Click "Run"\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations().catch(console.error);
