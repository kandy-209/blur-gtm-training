#!/usr/bin/env node
/**
 * Apply migrations directly via Postgres - final attempt
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const projectRef = SUPABASE_URL?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference');
  process.exit(1);
}

console.log('🚀 Applying Migrations Directly to Postgres\n');
console.log(`📡 Project: ${projectRef}\n`);

// Try to get database password from various sources
const dbPassword = process.env.SUPABASE_DB_PASSWORD 
  || process.env.DATABASE_PASSWORD
  || process.env.POSTGRES_PASSWORD;

if (!dbPassword) {
  console.error('❌ Database password required');
  console.log('\n📋 To get your database password:');
  console.log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/settings/database`);
  console.log('   2. Click "Reset database password" or copy existing password');
  console.log('   3. Add to .env.local: SUPABASE_DB_PASSWORD=your-password');
  console.log('   4. Run this script again\n');
  process.exit(1);
}

// Construct connection string
// Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function applyMigrations() {
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    const combinedFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');
    const sql = fs.readFileSync(combinedFile, 'utf8');

    console.log('📝 Executing migrations...\n');
    
    // Execute the entire SQL file
    await client.query(sql);
    
    console.log('✅ All migrations applied successfully!\n');
    console.log('✨ Phase 1 data collection is now active!');
    console.log('   Every research run will now populate:');
    console.log('   - prospect_intelligence');
    console.log('   - accounts');
    console.log('   - account_signals');
    console.log('   - prospect_intelligence_runs');
    console.log('   - user_interactions (from UI)\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.log('\n💡 The database password is incorrect.');
      console.log('   Get it from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database\n');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection failed. Check your network connection.\n');
    } else {
      console.log('\n💡 Error details:', err.message);
      console.log('   Some migrations may have partially applied.\n');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations().catch(console.error);
