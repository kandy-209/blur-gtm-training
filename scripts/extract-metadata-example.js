#!/usr/bin/env node

/**
 * Extract and display actual metadata that will be rendered
 */

const fs = require('fs');
const path = require('path');

console.log('📄 ACTUAL METADATA THAT WILL BE RENDERED\n');
console.log('='.repeat(70));

const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Extract business info
const businessInfoMatch = layoutContent.match(/const businessInfo = \{[\s\S]*?\};/);
if (businessInfoMatch) {
  console.log('\n🏢 BUSINESS INFORMATION:\n');
  console.log(businessInfoMatch[0]);
}

// Extract Organization schema
const orgSchemaMatch = layoutContent.match(/@type": "Organization"[\s\S]*?\}\s*\)\s*\}\s*\/>/);
if (orgSchemaMatch) {
  console.log('\n\n📊 ORGANIZATION SCHEMA (First 500 chars):\n');
  console.log(orgSchemaMatch[0].substring(0, 500) + '...');
}

// Extract SoftwareApplication schema
const appSchemaMatch = layoutContent.match(/@type": "SoftwareApplication"[\s\S]*?\}\s*\)\s*\}\s*\/>/);
if (appSchemaMatch) {
  console.log('\n\n💻 SOFTWARE APPLICATION SCHEMA (First 500 chars):\n');
  console.log(appSchemaMatch[0].substring(0, 500) + '...');
}

// Count structured data scripts
const schemaCount = (layoutContent.match(/@type":/g) || []).length;
console.log(`\n\n📈 TOTAL STRUCTURED DATA SCHEMAS: ${schemaCount}`);

// Extract meta tags
const metaTags = [
  'author',
  'copyright',
  'geo.region',
  'contact',
  'product:category',
  'product:target_audience',
  'product:use_case',
  'business:contact_data:email',
  'business:contact_data:phone_number',
  'og:business:price_range',
];

console.log('\n\n🏷️  PROFESSIONAL META TAGS FOUND:\n');
metaTags.forEach(tag => {
  if (layoutContent.includes(`name="${tag}"`) || layoutContent.includes(`property="${tag}"`)) {
    console.log(`   ✅ ${tag}`);
  } else {
    console.log(`   ❌ ${tag} (missing)`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n✅ Metadata extraction complete!\n');

