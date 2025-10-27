/**
 * Health Check Endpoint Tests
 * Tests for /healthz/deps endpoint
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🧪 Testing Health Check Endpoints...\n');
  
  const tests = [
    {
      name: 'Basic Health Check',
      endpoint: '/health',
      expectedStatus: 200,
    },
    {
      name: 'Comprehensive Health Check',
      endpoint: '/api/health',
      expectedStatus: 200,
    },
    {
      name: 'Dependency Health Check',
      endpoint: '/healthz/deps',
      expectedStatus: [200, 503], // Can be degraded
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
        validateStatus: () => true // Don't throw on any status
      });
      
      const statusMatch = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus.includes(response.status)
        : response.status === test.expectedStatus;
      
      if (statusMatch) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

// Test dependency status interpretation
async function testDependencyChecks() {
  console.log('🔍 Testing Dependency Checks Detail...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/healthz/deps`, {
      validateStatus: () => true
    });
    
    const { status, checks } = response.data;
    
    console.log(`Overall Status: ${status}`);
    console.log(`\nDatabase:`);
    console.log(`  Status: ${checks.database.status}`);
    console.log(`  Latency: ${checks.database.latency}ms`);
    if (checks.database.error) {
      console.log(`  Error: ${checks.database.error}`);
    }
    
    console.log(`\nRedis:`);
    console.log(`  Status: ${checks.redis.status}`);
    console.log(`  Latency: ${checks.redis.latency}ms`);
    if (checks.redis.error) {
      console.log(`  Error: ${checks.redis.error}`);
    }
    
    // Validation
    if (checks.database.status === 'healthy' && checks.redis.status === 'healthy') {
      console.log('\n✅ All dependencies are healthy');
      return true;
    } else if (status === 'degraded') {
      console.log('\n⚠️  System is degraded (some dependencies unhealthy)');
      return true;
    } else {
      console.log('\n❌ Unexpected health status');
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to check dependencies: ${error.message}`);
    return false;
  }
}

// Run tests
(async () => {
  await testHealthEndpoint();
  await testDependencyChecks();
})();
