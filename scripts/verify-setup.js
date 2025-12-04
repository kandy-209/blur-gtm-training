/**
 * Verification Script
 * Checks that all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Voice Coaching Setup...\n');

const checks = [];
let allPassed = true;

// Check 1: Core library files
console.log('1️⃣ Checking core library files...');
const coreFiles = [
  'src/lib/voice-coaching/types.ts',
  'src/lib/voice-coaching/audio-analyzer.ts',
  'src/lib/voice-coaching/pace-tracker.ts',
  'src/lib/voice-coaching/pitch-detector.ts',
  'src/lib/voice-coaching/volume-meter.ts',
  'src/lib/voice-coaching/pause-detector.ts',
  'src/lib/voice-coaching/coaching-engine.ts',
  'src/lib/voice-coaching/index.ts'
];

coreFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({ file, exists });
  if (exists) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allPassed = false;
  }
});

// Check 2: API endpoints
console.log('\n2️⃣ Checking API endpoints...');
const apiFiles = [
  'src/app/api/voice-coaching/metrics/route.ts',
  'src/app/api/voice-coaching/feedback/route.ts'
];

apiFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({ file, exists });
  if (exists) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allPassed = false;
  }
});

// Check 3: Test page
console.log('\n3️⃣ Checking test page...');
const testFile = 'src/app/test/voice-coaching/page.tsx';
const testExists = fs.existsSync(testFile);
checks.push({ file: testFile, exists: testExists });
if (testExists) {
  console.log(`   ✅ ${testFile}`);
} else {
  console.log(`   ❌ ${testFile} - MISSING`);
  allPassed = false;
}

// Check 4: Database migration script
console.log('\n4️⃣ Checking database migration script...');
const migrationFile = 'scripts/create-elevenlabs-advanced-features-tables.sql';
const migrationExists = fs.existsSync(migrationFile);
checks.push({ file: migrationFile, exists: migrationExists });
if (migrationExists) {
  console.log(`   ✅ ${migrationFile}`);
} else {
  console.log(`   ❌ ${migrationFile} - MISSING`);
  allPassed = false;
}

// Check 5: Environment variables (check .env.example or .env.local)
console.log('\n5️⃣ Checking environment variables...');
const envFiles = ['.env.local', '.env', '.env.example'];
let envFound = false;
let envContent = '';

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    envFound = true;
    envContent = fs.readFileSync(envFile, 'utf8');
    console.log(`   ✅ Found ${envFile}`);
  }
});

if (envFound) {
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY') || 
                         envContent.includes('SUPABASE_KEY');
  
  if (hasSupabaseUrl) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL found');
  } else {
    console.log('   ⚠️  NEXT_PUBLIC_SUPABASE_URL not found');
  }
  
  if (hasSupabaseKey) {
    console.log('   ✅ Supabase key found');
  } else {
    console.log('   ⚠️  Supabase key not found');
  }
} else {
  console.log('   ⚠️  No .env file found - make sure environment variables are set');
}

// Check 6: Documentation files
console.log('\n6️⃣ Checking documentation...');
const docs = [
  'ELEVENLABS_ADVANCED_FEATURES_PLAN.md',
  'ELEVENLABS_FEATURES_SUMMARY.md',
  'QUICK_TEST_START.md',
  'TESTING_GUIDE.md',
  'IMPLEMENTATION_STATUS.md'
];

docs.forEach(doc => {
  const exists = fs.existsSync(doc);
  if (exists) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ⚠️  ${doc} - Optional`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All required files are in place!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Run database migration in Supabase SQL Editor');
  console.log('   2. Start dev server: npm run dev');
  console.log('   3. Open: http://localhost:3000/test/voice-coaching');
  console.log('   4. Click "Start Analysis" and test!');
} else {
  console.log('❌ Some files are missing. Please check the errors above.');
}
console.log('='.repeat(50) + '\n');

process.exit(allPassed ? 0 : 1);

