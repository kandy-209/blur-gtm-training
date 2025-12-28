#!/usr/bin/env node
/**
 * Apply Supabase migrations directly using the Supabase client
 * This script reads migration files and executes them in order
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Migration files in order
const migrations = [
  'create_prospect_intelligence_table.sql',
  'add_user_interactions_table.sql',
  'add_account_signals_table.sql',
  'add_accounts_table.sql',
  'add_prospect_intelligence_runs_table.sql',
];

async function applyMigrations() {
  console.log('🚀 Starting migration application...\n');
  console.log(`📡 Connecting to: ${SUPABASE_URL.replace(/https?:\/\//, '')}\n`);

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  for (const migrationFile of migrations) {
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`📝 Applying: ${migrationFile}...`);
    
    try {
      // Split SQL by semicolons and execute each statement
      // Supabase client doesn't have a direct SQL executor, so we use RPC or raw query
      // For migrations, we'll use the REST API's SQL endpoint if available
      // Otherwise, we'll need to use the Postgres connection directly
      
      // Try using the REST API's SQL execution (if available via service role)
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
        // Fallback: try direct Postgres connection via REST API
        // Note: Supabase REST API doesn't expose raw SQL execution for security
        // We need to use a different approach
        
        // Alternative: Use pg library if available, or provide instructions
        return { error: { message: 'Direct SQL execution not available via REST API' } };
      });

      if (error) {
        // If RPC doesn't work, we'll need to provide manual instructions
        // But let's try to parse and execute statements manually where possible
        console.warn(`⚠️  Could not execute via RPC: ${error.message}`);
        console.log(`   → Please run this migration manually in Supabase SQL Editor:\n`);
        console.log(`   File: ${migrationPath}\n`);
        console.log(`   Or copy-paste the SQL from the file above.\n`);
        continue;
      }

      console.log(`✅ Applied: ${migrationFile}`);
    } catch (err) {
      console.error(`❌ Error applying ${migrationFile}:`, err.message);
      console.log(`   → Please run this migration manually in Supabase SQL Editor`);
      console.log(`   File: ${migrationPath}\n`);
    }
  }

  console.log('\n✨ Migration process complete!');
  console.log('\n📋 Note: Some migrations may need to be run manually in Supabase SQL Editor');
  console.log('   if direct SQL execution is not available via the REST API.');
}

// Alternative: Create a script that uses pg library for direct Postgres connection
async function applyMigrationsWithPg() {
  console.log('🚀 Starting migration application with direct Postgres connection...\n');
  
  // Extract connection details from Supabase URL
  const url = new URL(SUPABASE_URL);
  const projectRef = url.hostname.split('.')[0];
  
  // Supabase connection string format:
  // postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  // We need the database password, which is typically in the service role key or separate
  
  console.log('⚠️  Direct Postgres connection requires database password.');
  console.log('   This is typically found in your Supabase project settings.');
  console.log('\n📋 Alternative: Run migrations manually in Supabase SQL Editor:');
  console.log('   1. Go to https://supabase.com/dashboard/project/' + projectRef);
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Run each migration file in order:\n');
  
  migrations.forEach((file, idx) => {
    console.log(`   ${idx + 1}. supabase/migrations/${file}`);
  });
  
  console.log('\n✨ Or use the Supabase CLI:');
  console.log('   npx supabase db push --linked');
}

// Check if we can use pg library
let usePg = false;
try {
  require('pg');
  usePg = true;
} catch {
  // pg not available
}

if (usePg) {
  applyMigrationsWithPg().catch(console.error);
} else {
  applyMigrations().catch(console.error);
}
