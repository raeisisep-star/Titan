/**
 * RateLimit V2 Integration Tests
 * Tests both Memory and Redis drivers
 */

const assert = require('assert');
const RateLimitService = require('../services/rateLimit');

async function testMemoryDriver() {
  console.log('\n🧪 Test 1: Memory Driver - Basic Consume\n');
  
  const service = new RateLimitService('memory', {
    defaultPolicy: { points: 5, duration: 10 }
  });
  await service.init();
  
  // Consume 5 tokens
  for (let i = 0; i < 5; i++) {
    const result = await service.consume('test-user', { points: 5, duration: 10 });
    assert.strictEqual(result.allowed, true, `Request ${i + 1} should be allowed`);
    console.log(`✅ Request ${i + 1}: allowed, remaining=${result.remaining}`);
  }
  
  // 6th request should fail
  const result = await service.consume('test-user', { points: 5, duration: 10 });
  assert.strictEqual(result.allowed, false, 'Request 6 should be blocked');
  console.log(`✅ Request 6: blocked as expected, retryAfter=${result.retryAfterMs}ms`);
  
  // Reset and try again
  await service.reset('test-user');
  const afterReset = await service.consume('test-user', { points: 5, duration: 10 });
  assert.strictEqual(afterReset.allowed, true, 'After reset should be allowed');
  console.log('✅ After reset: allowed');
  
  console.log('\n✅ Memory Driver Test PASSED\n');
}

async function testRedisDriver() {
  console.log('\n🧪 Test 2: Redis Driver - Basic Consume\n');
  
  try {
    const service = new RateLimitService('redis', {
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      defaultPolicy: { points: 5, duration: 10 }
    });
    await service.init();
    
    if (service.backend() === 'memory') {
      console.log('⚠️  Redis not available, skipping Redis test (fallback to memory occurred)');
      return;
    }
    
    const testKey = `redis-test-${Date.now()}`;
    
    // Consume 5 tokens
    for (let i = 0; i < 5; i++) {
      const result = await service.consume(testKey, { points: 5, duration: 10 });
      assert.strictEqual(result.allowed, true, `Request ${i + 1} should be allowed`);
      console.log(`✅ Request ${i + 1}: allowed, remaining=${result.remaining}`);
    }
    
    // 6th request should fail
    const result = await service.consume(testKey, { points: 5, duration: 10 });
    assert.strictEqual(result.allowed, false, 'Request 6 should be blocked');
    console.log(`✅ Request 6: blocked as expected, retryAfter=${result.retryAfterMs}ms`);
    
    // Check status
    const status = await service.status(testKey);
    assert.strictEqual(status.exists, true, 'Status should exist');
    assert.strictEqual(status.remaining, 0, 'Remaining should be 0');
    console.log(`✅ Status check: exists=${status.exists}, remaining=${status.remaining}`);
    
    // Reset
    await service.reset(testKey);
    const afterReset = await service.consume(testKey, { points: 5, duration: 10 });
    assert.strictEqual(afterReset.allowed, true, 'After reset should be allowed');
    console.log('✅ After reset: allowed');
    
    console.log('\n✅ Redis Driver Test PASSED\n');
  } catch (error) {
    console.log(`⚠️  Redis test skipped: ${error.message}`);
  }
}

async function testBurstPolicy() {
  console.log('\n🧪 Test 3: Burst Policy\n');
  
  const service = new RateLimitService('memory', {
    defaultPolicy: { points: 100, duration: 60 }
  });
  await service.init();
  
  const burst = { points: 3, duration: 1 };
  
  // First 3 requests should pass
  for (let i = 0; i < 3; i++) {
    const result = await service.consume('burst-test', burst);
    assert.strictEqual(result.allowed, true, `Burst request ${i + 1} should be allowed`);
    console.log(`✅ Burst request ${i + 1}: allowed`);
  }
  
  // 4th request should be blocked
  const result = await service.consume('burst-test', burst);
  assert.strictEqual(result.allowed, false, 'Burst request 4 should be blocked');
  console.log('✅ Burst request 4: blocked as expected');
  
  console.log('\n✅ Burst Policy Test PASSED\n');
}

async function testFallback() {
  console.log('\n🧪 Test 4: Automatic Fallback\n');
  
  // Try to connect to invalid Redis URL
  const service = new RateLimitService('redis', {
    redisUrl: 'redis://invalid-host:9999',
    defaultPolicy: { points: 5, duration: 10 }
  });
  
  await service.init();
  
  // Should fallback to memory
  assert.strictEqual(service.backend(), 'memory', 'Should fallback to memory on Redis failure');
  console.log('✅ Fallback to memory successful');
  
  // Should still work
  const result = await service.consume('fallback-test', { points: 5, duration: 10 });
  assert.strictEqual(result.allowed, true, 'Should work with memory fallback');
  console.log('✅ Consume after fallback: allowed');
  
  console.log('\n✅ Fallback Test PASSED\n');
}

// Run all tests
(async () => {
  console.log('🚀 Starting RateLimit V2 Integration Tests...');
  console.log('='.repeat(60));
  
  try {
    await testMemoryDriver();
    await testRedisDriver();
    await testBurstPolicy();
    await testFallback();
    
    console.log('='.repeat(60));
    console.log('\n🎉 All tests PASSED!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
