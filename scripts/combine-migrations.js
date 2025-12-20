#!/usr/bin/env node
/**
 * Combine all migration files into a single SQL file for easy copy-paste
 */

const fs = require('fs');
const path = require('path');

const migrations = [
  'create_prospect_intelligence_table.sql',
  'add_user_interactions_table.sql',
  'add_account_signals_table.sql',
  'add_accounts_table.sql',
  'add_prospect_intelligence_runs_table.sql',
];

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const outputFile = path.join(__dirname, '..', 'supabase', 'migrations', 'ALL_MIGRATIONS_COMBINED.sql');

let combined = `-- Combined Supabase Migrations
-- Run this entire file in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- Generated: ${new Date().toISOString()}

`;

migrations.forEach((file, idx) => {
  const filePath = path.join(migrationsDir, file);
  if (fs.existsSync(filePath)) {
    combined += `\n-- ============================================================\n`;
    combined += `-- Migration ${idx + 1}/${migrations.length}: ${file}\n`;
    combined += `-- ============================================================\n\n`;
    combined += fs.readFileSync(filePath, 'utf8');
    combined += `\n\n`;
  } else {
    combined += `\n-- WARNING: ${file} not found!\n\n`;
  }
});

fs.writeFileSync(outputFile, combined, 'utf8');
console.log(`✅ Combined migrations written to: ${outputFile}`);
console.log(`\n📋 Next steps:`);
console.log(`   1. Open: https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn/sql/new`);
console.log(`   2. Copy the contents of: ${outputFile}`);
console.log(`   3. Paste into SQL Editor and click "Run"`);
