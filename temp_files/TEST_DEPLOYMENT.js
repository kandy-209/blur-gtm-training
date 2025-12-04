/**
 * Test deployment without hanging
 * Run: node TEST_DEPLOYMENT.js
 */

const https = require('https');

const DEPLOYMENT_URL = process.env.VERCEL_URL || 'https://cursor-gtm-training.vercel.app';

const tests = [
  {
    name: 'Health Check',
    path: '/api/cache/health',
  },
  {
    name: 'Cache Metrics',
    path: '/api/cache/metrics',
  },
  {
    name: 'Root Page',
    path: '/',
  },
];

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${DEPLOYMENT_URL}${path}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          path,
        });
      });
    }).on('error', (error) => {
      reject({ error: error.message, path });
    });
  });
}

async function runTests() {
  console.log('Testing deployment:', DEPLOYMENT_URL);
  console.log('---\n');
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await testEndpoint(test.path);
      results.push({ ...test, ...result });
      console.log(`✅ ${test.name}: ${result.status} ${result.success ? 'OK' : 'FAIL'}`);
    } catch (error) {
      results.push({ ...test, error: error.error });
      console.log(`❌ ${test.name}: ${error.error}`);
    }
  }
  
  console.log('\n---');
  const successCount = results.filter(r => r.success).length;
  console.log(`Results: ${successCount}/${results.length} passed`);
  
  if (successCount === results.length) {
    console.log('✅ Deployment verified!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check deployment.');
    process.exit(1);
  }
}

runTests();


