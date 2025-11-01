/**
 * k6 Stress Test
 * 
 * Purpose: Gradually increase load to find breaking points
 * Duration: 10 minutes
 * VUs: 0 → 50 (gradual ramp)
 * RPS: 0 → 50 requests/second
 * 
 * Stages:
 * 1. Ramp up to 10 VUs (2 min)
 * 2. Stay at 10 VUs (2 min)
 * 3. Ramp up to 30 VUs (2 min)
 * 4. Stay at 30 VUs (2 min)
 * 5. Ramp up to 50 VUs (1 min)
 * 6. Ramp down to 0 (1 min)
 * 
 * Usage:
 *   BASE_URL=https://staging.zala.ir k6 run ops/loadtest/k6-stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const healthCheckDuration = new Trend('health_check_duration');
const totalRequests = new Counter('total_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 VUs
    { duration: '2m', target: 10 },   // Stay at 10 VUs
    { duration: '2m', target: 30 },   // Ramp up to 30 VUs
    { duration: '2m', target: 30 },   // Stay at 30 VUs
    { duration: '1m', target: 50 },   // Spike to 50 VUs
    { duration: '1m', target: 0 },    // Ramp down
  ],
  
  thresholds: {
    // Allow 2% failure rate under stress
    'http_req_failed': ['rate<0.02'],
    
    // 95th percentile should stay under 1000ms
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    
    // Average response time should stay under 500ms
    'http_req_duration': ['avg<500'],
    
    // Custom error rate
    'errors': ['rate<0.02'],
    
    // Health check specific (more lenient under stress)
    'health_check_duration': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.zala.ir';

export function setup() {
  console.log(`\n🔥 Starting k6 stress test against: ${BASE_URL}`);
  console.log(`⏱️  Duration: 10 minutes (gradual ramp)`);
  console.log(`👥 VUs: 0 → 10 → 30 → 50 → 0`);
  console.log(`📊 Expected RPS: ~0 → 50\n`);
  
  // Pre-flight check
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error(`Service not reachable: ${res.status} ${res.body}`);
  }
  
  console.log(`✅ Pre-flight check passed\n`);
  
  return { 
    startTime: Date.now(),
    baseUrl: BASE_URL,
  };
}

export default function (data) {
  totalRequests.add(1);
  
  // Scenario 1: Health check (80% of traffic)
  if (Math.random() < 0.8) {
    const res = http.get(`${data.baseUrl}/api/health`);
    
    const success = check(res, {
      'health status is 200': (r) => r.status === 200,
      'health has success flag': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
      'health response < 800ms': (r) => r.timings.duration < 800,
      'has database status': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data?.services?.database !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
    
    errorRate.add(!success);
    successRate.add(success);
    healthCheckDuration.add(res.timings.duration);
    
    // Log slow requests
    if (res.timings.duration > 1000) {
      console.warn(`⚠️  Slow health check: ${res.timings.duration.toFixed(0)}ms`);
    }
  } 
  // Scenario 2: Other endpoints (20% of traffic)
  else {
    // You can add other endpoint tests here
    // For now, just test health again
    const res = http.get(`${data.baseUrl}/api/health`);
    const success = check(res, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    });
    
    errorRate.add(!success);
    successRate.add(success);
  }
  
  // Variable think time (0.5-1.5 seconds) to simulate realistic users
  sleep(0.5 + Math.random());
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\n✅ Stress test completed in ${duration.toFixed(1)}s`);
  console.log(`📊 Check detailed results above`);
  console.log(`\n💡 Tip: Compare p95/p99 latencies across different load stages`);
}

export function handleSummary(data) {
  const summary = generateSummary(data);
  
  // Output to console
  console.log(summary);
  
  // Return JSON for CI/CD artifacts
  return {
    'stdout': summary,
    'stress-test-results.json': JSON.stringify(data, null, 2),
  };
}

function generateSummary(data) {
  let summary = '\n╔══════════════════════════════════════════════════════╗\n';
  summary += '║        k6 Stress Test - Final Summary              ║\n';
  summary += '╚══════════════════════════════════════════════════════╝\n\n';
  
  const requests = data.metrics.http_reqs?.values?.count || 0;
  const failures = data.metrics.http_req_failed?.values?.rate || 0;
  const duration = data.metrics.http_req_duration?.values || {};
  const iterations = data.metrics.iterations?.values?.count || 0;
  
  summary += `📊 Request Statistics:\n`;
  summary += `   Total Requests: ${requests}\n`;
  summary += `   Total Iterations: ${iterations}\n`;
  summary += `   Failed Requests: ${(failures * 100).toFixed(2)}%\n`;
  summary += `   Success Rate: ${((1 - failures) * 100).toFixed(2)}%\n\n`;
  
  summary += `⏱️  Response Time Distribution:\n`;
  summary += `   Average: ${duration.avg?.toFixed(2) || 0}ms\n`;
  summary += `   Median (p50): ${duration.med?.toFixed(2) || 0}ms\n`;
  summary += `   p90: ${duration['p(90)']?.toFixed(2) || 0}ms\n`;
  summary += `   p95: ${duration['p(95)']?.toFixed(2) || 0}ms\n`;
  summary += `   p99: ${duration['p(99)']?.toFixed(2) || 0}ms\n`;
  summary += `   Max: ${duration.max?.toFixed(2) || 0}ms\n\n`;
  
  // Threshold checks
  const thresholds = data.root_group?.checks || [];
  const passedChecks = thresholds.filter(t => t.passes > 0).length;
  const totalChecks = thresholds.length;
  
  summary += `✅ Checks Passed: ${passedChecks}/${totalChecks}\n\n`;
  
  // Overall result
  const passed = 
    failures < 0.02 && 
    duration['p(95)'] < 1000 &&
    duration.avg < 500;
  
  summary += `${passed ? '✅ STRESS TEST PASSED' : '❌ STRESS TEST FAILED'}\n\n`;
  
  if (!passed) {
    summary += `⚠️  Issues detected:\n`;
    if (failures >= 0.02) summary += `   - High error rate: ${(failures * 100).toFixed(2)}%\n`;
    if (duration['p(95)'] >= 1000) summary += `   - High p95 latency: ${duration['p(95)'].toFixed(0)}ms\n`;
    if (duration.avg >= 500) summary += `   - High average latency: ${duration.avg.toFixed(0)}ms\n`;
  }
  
  return summary;
}
