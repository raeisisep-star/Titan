/**
 * k6 Smoke Test
 * 
 * Purpose: Quick validation that critical endpoints work under minimal load
 * Duration: 1 minute
 * VUs: 10 concurrent users
 * RPS: ~10 requests/second
 * 
 * Usage:
 *   k6 run ops/loadtest/k6-smoke.js
 *   BASE_URL=https://www.zala.ir k6 run ops/loadtest/k6-smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const healthCheckDuration = new Trend('health_check_duration');

// Test configuration
export const options = {
  vus: 10,
  duration: '1m',
  
  thresholds: {
    // Less than 1% of requests should fail
    'http_req_failed': ['rate<0.01'],
    
    // 95% of requests should complete in < 800ms
    'http_req_duration': ['p(95)<800', 'p(99)<1500'],
    
    // Custom error rate threshold
    'errors': ['rate<0.01'],
    
    // Health check specific threshold
    'health_check_duration': ['p(95)<500'],
  },
  
  // Graceful ramp down
  stages: [
    { duration: '10s', target: 10 },  // Ramp up
    { duration: '40s', target: 10 },  // Stay at 10 VUs
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = __ENV.BASE_URL || 'https://www.zala.ir';

// Setup function (runs once before test)
export function setup() {
  console.log(`🚀 Starting k6 smoke test against: ${BASE_URL}`);
  console.log(`⏱️  Duration: 1 minute`);
  console.log(`👥 VUs: 10 concurrent users`);
  
  // Verify the service is reachable
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error(`Service not reachable: ${res.status}`);
  }
  
  return { startTime: Date.now() };
}

// Main test scenario
export default function (data) {
  // Test 1: Health endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  
  const healthCheck = check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health has success flag': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
    'health response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Record metrics
  errorRate.add(!healthCheck);
  healthCheckDuration.add(healthRes.timings.duration);
  
  // Test 2: Check security headers (from Phase 5)
  const headerCheck = check(healthRes, {
    'has HSTS header': (r) => r.headers['Strict-Transport-Security'] !== undefined,
    'has X-Frame-Options': (r) => r.headers['X-Frame-Options'] !== undefined,
    'has CSP header': (r) => r.headers['Content-Security-Policy'] !== undefined,
  });
  
  if (!headerCheck) {
    console.warn('⚠️  Security headers missing or incomplete');
  }
  
  // Test 3: Rate limiting headers (from Phase 5)
  const rateLimitCheck = check(healthRes, {
    'has rate limit headers': (r) => 
      r.headers['X-Ratelimit-Remaining'] !== undefined ||
      r.headers['X-RateLimit-Remaining'] !== undefined,
  });
  
  // Small delay between requests (realistic user behavior)
  sleep(1);
}

// Teardown function (runs once after test)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n✅ Smoke test completed in ${duration.toFixed(1)}s`);
  console.log(`📊 Check detailed results above`);
}

// Handle test abort
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n' + indent + '📊 k6 Smoke Test Summary\n';
  summary += indent + '═'.repeat(50) + '\n\n';
  
  // Request stats
  const requests = data.metrics.http_reqs?.values?.count || 0;
  const failures = data.metrics.http_req_failed?.values?.rate || 0;
  const duration = data.metrics.http_req_duration?.values || {};
  
  summary += indent + `Total Requests: ${requests}\n`;
  summary += indent + `Failed Requests: ${(failures * 100).toFixed(2)}%\n`;
  summary += indent + `Request Duration (p95): ${duration['p(95)']?.toFixed(2) || 0}ms\n`;
  summary += indent + `Request Duration (p99): ${duration['p(99)']?.toFixed(2) || 0}ms\n`;
  
  // Pass/Fail status
  const passed = data.metrics.http_req_failed?.thresholds?.['rate<0.01']?.ok || false;
  summary += indent + `\nResult: ${passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  
  return summary;
}
