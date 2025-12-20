#!/usr/bin/env node
/**
 * Final attempt to apply migrations - tries all available methods
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const PROJECT_REF = 'dxgjaznmtsgvxnfnzhbn';
const combinedFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');

console.log('🚀 Final Migration Application Attempt\n');

// Method 1: Try with database password if available
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (dbPassword) {
  console.log('🔑 Database password found, attempting direct Postgres connection...\n');
  try {
    execSync(`node scripts/apply-migrations-direct.js`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('\n✅ Migrations applied successfully!');
    process.exit(0);
  } catch (err) {
    console.log('\n⚠️  Direct connection failed, trying next method...\n');
  }
}

// Method 2: Try Supabase CLI if linked
console.log('📋 Attempting Supabase CLI method...\n');
try {
  execSync('npx supabase db push', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN || '' },
  });
  console.log('\n✅ Migrations applied via CLI!');
  process.exit(0);
} catch (err) {
  console.log('⚠️  CLI method not available (project not linked)\n');
}

// Method 3: Provide the easiest manual solution
console.log('='.repeat(70));
console.log('📋 EASIEST METHOD: Copy-Paste in Supabase Dashboard\n');
console.log('   1. Open this file:');
console.log(`      ${combinedFile}\n`);
console.log('   2. Copy ALL contents (Cmd+A, Cmd+C)\n');
console.log('   3. Open this URL:');
console.log(`      https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new\n`);
console.log('   4. Paste the SQL (Cmd+V)\n');
console.log('   5. Click the green "Run" button\n');
console.log('✨ Done! All migrations will be applied.\n');
console.log('='.repeat(70));

// Also try to open the file in the default editor
if (process.platform === 'darwin') {
  try {
    execSync(`open "${combinedFile}"`, { stdio: 'ignore' });
    console.log('📂 Opened the SQL file in your default editor\n');
  } catch (err) {
    // Ignore
  }
}

console.log('\n💡 Tip: To automate this in the future, add to .env.local:');
console.log('   SUPABASE_DB_PASSWORD=your-database-password');
console.log('   (Get it from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/database)\n');
