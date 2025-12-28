#!/usr/bin/env node

/**
 * SEO Metadata Validation Script
 * Extracts and validates all SEO improvements for sales enablement
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating SEO Metadata & Sales Enablement Improvements\n');
console.log('='.repeat(70));

// Read layout.tsx
const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Read SEOHead.tsx
const seoHeadPath = path.join(__dirname, '../src/components/SEOHead.tsx');
const seoHeadContent = fs.readFileSync(seoHeadPath, 'utf8');

// Read manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Read robots.txt
const robotsPath = path.join(__dirname, '../public/robots.txt');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

console.log('\n📋 1. BUSINESS INFORMATION METADATA\n');
check('Business info object defined', layoutContent.includes('const businessInfo = {'));
check('Business email configured', layoutContent.includes('NEXT_PUBLIC_BUSINESS_EMAIL'));
check('Business phone configured', layoutContent.includes('NEXT_PUBLIC_BUSINESS_PHONE'));
check('Business address fields', layoutContent.includes('NEXT_PUBLIC_BUSINESS_STREET'));
check('Business city configured', layoutContent.includes('NEXT_PUBLIC_BUSINESS_CITY'));
check('Business state configured', layoutContent.includes('NEXT_PUBLIC_BUSINESS_STATE'));
check('Business zip configured', layoutContent.includes('NEXT_PUBLIC_BUSINESS_ZIP'));

console.log('\n📋 2. STRUCTURED DATA (SCHEMA.ORG)\n');
check('Organization schema present', layoutContent.includes('@type": "Organization"'));
check('SoftwareApplication schema present', layoutContent.includes('@type": "SoftwareApplication"'));
check('LocalBusiness schema present', layoutContent.includes('@type": "LocalBusiness"'));
check('Course schema present', layoutContent.includes('@type": "Course"'));
check('FAQPage schema present', layoutContent.includes('@type": "FAQPage"'));
check('WebApplication schema present', layoutContent.includes('@type": "WebApplication"'));
check('BreadcrumbList schema present', layoutContent.includes('@type": "BreadcrumbList"'));

console.log('\n📋 3. OPEN GRAPH & SOCIAL MEDIA TAGS\n');
check('Open Graph emails configured', layoutContent.includes('emails: businessInfo.email'));
check('Open Graph phone numbers', layoutContent.includes('phoneNumbers: businessInfo.phone'));
check('Business contact data meta tags', layoutContent.includes('business:contact_data:email'));
check('Business contact data phone', layoutContent.includes('business:contact_data:phone_number'));
check('Business contact data address', layoutContent.includes('business:contact_data:street_address'));
check('Business price range', layoutContent.includes('og:business:price_range'));

console.log('\n📋 4. PROFESSIONAL META TAGS\n');
check('Author meta tag', layoutContent.includes('meta name="author"'));
check('Copyright meta tag', layoutContent.includes('meta name="copyright"'));
check('Geo region meta tag', layoutContent.includes('meta name="geo.region"'));
check('Contact meta tag', layoutContent.includes('meta name="contact"'));
check('Product category meta tag', layoutContent.includes('product:category'));
check('Target audience meta tag', layoutContent.includes('product:target_audience'));
check('Use case meta tag', layoutContent.includes('product:use_case'));

console.log('\n📋 5. ENHANCED SEOHEAD COMPONENT\n');
check('Dynamic route titles', seoHeadContent.includes('routeTitles'));
check('Dynamic route descriptions', seoHeadContent.includes('routeDescriptions'));
check('Open Graph tag updates', seoHeadContent.includes('og:title'));
check('Twitter Card tags', seoHeadContent.includes('twitter:card'));
check('Dynamic canonical URLs', seoHeadContent.includes('canonical'));
check('Structured data for roleplay pages', seoHeadContent.includes('data-dynamic-seo'));

console.log('\n📋 6. MANIFEST.JSON IMPROVEMENTS\n');
check('Professional name', manifest.name && manifest.name.includes('Professional'));
check('App shortcuts defined', manifest.shortcuts && manifest.shortcuts.length > 0);
check('Screenshots configured', manifest.screenshots && manifest.screenshots.length > 0);
check('Proper categories', manifest.categories && manifest.categories.includes('business'));
check('Theme color set', manifest.theme_color === '#000000');

console.log('\n📋 7. ROBOTS.TXT OPTIMIZATION\n');
check('Googlebot directives', robotsContent.includes('User-agent: Googlebot'));
check('Bingbot directives', robotsContent.includes('User-agent: Bingbot'));
check('LinkedIn crawler', robotsContent.includes('User-agent: LinkedInBot'));
check('Facebook crawler', robotsContent.includes('User-agent: facebookexternalhit'));
check('Twitter crawler', robotsContent.includes('User-agent: Twitterbot'));
check('Sitemap location', robotsContent.includes('Sitemap:'));
check('Correct domain in sitemap', robotsContent.includes('blursalestrainer.com'));

console.log('\n📋 8. CONTACT POINT SCHEMA\n');
check('Sales contact point', layoutContent.includes('contactType: \'Sales\''));
check('Customer support contact point', layoutContent.includes('contactType: \'Customer Support\''));
check('Contact email in schema', layoutContent.includes('email: businessInfo.email'));
check('Contact phone in schema', layoutContent.includes('telephone: businessInfo.phone'));

console.log('\n📋 9. AGGREGATE RATINGS\n');
check('Aggregate rating in Organization', layoutContent.includes('AggregateRating'));
check('Rating value configured', layoutContent.includes('ratingValue'));
check('Rating count configured', layoutContent.includes('ratingCount'));

console.log('\n📋 10. FEATURE LIST\n');
check('Feature list in SoftwareApplication', layoutContent.includes('featureList'));
check('Multiple features listed', (layoutContent.match(/AI-Powered Role-Play Training|Real-time Feedback|Analytics Dashboard/g) || []).length >= 3);

console.log('\n' + '='.repeat(70));
console.log(`\n📊 VALIDATION RESULTS:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (failed === 0) {
  console.log('🎉 ALL CHECKS PASSED! Your SEO metadata is fully configured for professional sales enablement.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the output above.\n');
  process.exit(1);
}

