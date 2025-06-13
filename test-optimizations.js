// Quick test script to verify optimization improvements
const fetch = require('node-fetch').default;

async function testApiPerformance() {
  console.log('🚀 Testing API Performance...\n');

  const tests = [
    { name: 'Stats API', url: 'http://localhost:3001/api/stats' },
    { name: 'Profile API (unauthenticated)', url: 'http://localhost:3001/api/profile' },
  ];

  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    
    try {
      // First request (should be slow - cache miss)
      const start1 = Date.now();
      const response1 = await fetch(test.url);
      const end1 = Date.now();
      const duration1 = end1 - start1;
      
      console.log(`  First request: ${duration1}ms`);
      
      // Second request (should be fast - cache hit)
      const start2 = Date.now();
      const response2 = await fetch(test.url);
      const end2 = Date.now();
      const duration2 = end2 - start2;
      
      console.log(`  Second request: ${duration2}ms`);
      console.log(`  Improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%`);
      console.log(`  Cache Status: ${response2.headers.get('X-Cache-Status') || 'No header'}\n`);
      
    } catch (error) {
      console.log(`  Error: ${error.message}\n`);
    }
  }
}

// Run test if Node.js environment
if (typeof window === 'undefined') {
  testApiPerformance().catch(console.error);
} 