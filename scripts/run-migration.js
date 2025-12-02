#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * This script helps you run the database migration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Supabase Database Migration Helper\n');

const sqlFile = path.join(process.cwd(), 'scripts', 'create-supabase-tables.sql');

if (!fs.existsSync(sqlFile)) {
  console.error('❌ Migration file not found:', sqlFile);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('✅ Migration SQL file loaded');
console.log(`📊 Contains: ${sql.split('CREATE TABLE').length - 1} tables`);
console.log(`🔒 Contains: ${sql.split('CREATE POLICY').length - 1} security policies\n`);

console.log('📋 To run this migration:\n');
console.log('1. Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/kjzoqieqrknhnehpufks/sql/new\n');
console.log('2. Copy the SQL below (or from scripts/create-supabase-tables.sql)\n');
console.log('3. Paste into SQL Editor and click "Run"\n');
console.log('─'.repeat(60));
console.log('\n📄 SQL Migration (first 500 chars):\n');
console.log(sql.substring(0, 500) + '...\n');
console.log('─'.repeat(60));
console.log('\n💡 Full SQL is in: scripts/create-supabase-tables.sql');
console.log('💡 Or copy from the file that should be open in your editor!\n');

