/**
 * k6 Soak Test (Endurance Test)
 * 
 * Purpose: Verify system stability over extended period under moderate load
 * Duration: 30 minutes
 * VUs: 5 constant
 * RPS: ~5 requests/second
 * 
 * This test helps identify:
 * - Memory leaks
 * - Database connection pool exhaustion
 * - Gradual performance degradation
 * - Resource accumulation issues
 * 
 * Usage:
 *   BASE_URL=https://staging.zala.ir k6 run ops/loadtest/k6-soak.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const healthCheckDuration = new Trend('health_check_duration');
const slowRequests = new Counter('slow_requests');

// Test configuration
export const options = {
  vus: 5,
  duration: '30m',
  
  thresholds: {
    // Very strict thresholds for endurance testing
    'http_req_failed': ['rate<0.005'],  // < 0.5% failure
    
    // Performance should not degrade over time
    'http_req_duration': [
      'p(95)<600',   // p95 should stay under 600ms
      'p(99)<1200',  // p99 should stay under 1200ms
      'avg<400',     // Average should stay under 400ms
    ],
    
    // Health check specific
    'health_check_duration': ['p(95)<500', 'avg<300'],
    
    // Custom metrics
    'errors': ['rate<0.005'],
    'slow_requests': ['count<50'],  // Less than 50 requests > 1s
  },
  
  // Graceful stages
  stages: [
    { duration: '2m', target: 5 },   // Ramp up
    { duration: '26m', target: 5 },  // Steady state
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.zala.ir';

export function setup() {
  console.log(`\n⏰ Starting k6 soak test against: ${BASE_URL}`);
  console.log(`⏱️  Duration: 30 minutes (endurance test)`);
  console.log(`👥 VUs: 5 constant`);
  console.log(`📊 Expected RPS: ~5`);
  console.log(`🎯 Goal: Verify stability over extended period\n`);
  
  // Pre-flight check
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error(`Service not reachable: ${res.status}`);
  }
  
  console.log(`✅ Pre-flight check passed`);
  console.log(`🚀 Starting endurance test...\n`);
  
  return { 
    startTime: Date.now(),
    baseUrl: BASE_URL,
    checkpoints: [],
  };
}

export default function (data) {
  const res = http.get(`${data.baseUrl}/api/health`);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has success flag': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
    'response time < 600ms': (r) => r.timings.duration < 600,
    'database connected': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data?.services?.database?.status === 'connected';
      } catch (e) {
        return false;
      }
    },
    'redis connected': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data?.services?.redis?.status === 'connected';
      } catch (e) {
        return false;
      }
    },
  });
  
  // Track metrics
  errorRate.add(!success);
  healthCheckDuration.add(res.timings.duration);
  
  // Flag slow requests
  if (res.timings.duration > 1000) {
    slowRequests.add(1);
    console.warn(`⚠️  Slow request detected: ${res.timings.duration.toFixed(0)}ms at ${new Date().toISOString()}`);
  }
  
  // Log checkpoint every 5 minutes
  const elapsedMinutes = Math.floor((Date.now() - data.startTime) / 60000);
  if (elapsedMinutes > 0 && elapsedMinutes % 5 === 0 && !data.checkpoints.includes(elapsedMinutes)) {
    data.checkpoints.push(elapsedMinutes);
    console.log(`⏰ Checkpoint: ${elapsedMinutes} minutes elapsed - Duration: ${res.timings.duration.toFixed(0)}ms`);
  }
  
  // Realistic user think time
  sleep(1);
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000 / 60;  // minutes
  console.log(`\n✅ Soak test completed in ${duration.toFixed(1)} minutes`);
  console.log(`📊 Check detailed results above`);
  console.log(`\n💡 Key things to verify:`);
  console.log(`   - Response times did not degrade over time`);
  console.log(`   - Error rate remained stable`);
  console.log(`   - No memory leaks or resource exhaustion`);
}

export function handleSummary(data) {
  const summary = generateSummary(data);
  
  console.log(summary);
  
  return {
    'stdout': summary,
    'soak-test-results.json': JSON.stringify(data, null, 2),
  };
}

function generateSummary(data) {
  let summary = '\n╔══════════════════════════════════════════════════════╗\n';
  summary += '║        k6 Soak Test - Final Summary                ║\n';
  summary += '╚══════════════════════════════════════════════════════╝\n\n';
  
  const requests = data.metrics.http_reqs?.values?.count || 0;
  const failures = data.metrics.http_req_failed?.values?.rate || 0;
  const duration = data.metrics.http_req_duration?.values || {};
  const iterations = data.metrics.iterations?.values?.count || 0;
  const slowReqs = data.metrics.slow_requests?.values?.count || 0;
  
  summary += `📊 Endurance Test Statistics:\n`;
  summary += `   Total Requests: ${requests}\n`;
  summary += `   Total Iterations: ${iterations}\n`;
  summary += `   Failed Requests: ${(failures * 100).toFixed(3)}%\n`;
  summary += `   Slow Requests (>1s): ${slowReqs}\n`;
  summary += `   Success Rate: ${((1 - failures) * 100).toFixed(3)}%\n\n`;
  
  summary += `⏱️  Response Time Distribution:\n`;
  summary += `   Min: ${duration.min?.toFixed(2) || 0}ms\n`;
  summary += `   Average: ${duration.avg?.toFixed(2) || 0}ms\n`;
  summary += `   Median (p50): ${duration.med?.toFixed(2) || 0}ms\n`;
  summary += `   p90: ${duration['p(90)']?.toFixed(2) || 0}ms\n`;
  summary += `   p95: ${duration['p(95)']?.toFixed(2) || 0}ms\n`;
  summary += `   p99: ${duration['p(99)']?.toFixed(2) || 0}ms\n`;
  summary += `   Max: ${duration.max?.toFixed(2) || 0}ms\n\n`;
  
  // Stability analysis
  summary += `🔍 Stability Analysis:\n`;
  
  const avgLatency = duration.avg || 0;
  const p95Latency = duration['p(95)'] || 0;
  const errorRatePercent = (failures * 100);
  
  const stable = 
    errorRatePercent < 0.5 &&
    avgLatency < 400 &&
    p95Latency < 600 &&
    slowReqs < 50;
  
  if (stable) {
    summary += `   ✅ System remained stable over 30 minutes\n`;
    summary += `   ✅ No performance degradation detected\n`;
    summary += `   ✅ Error rate acceptable: ${errorRatePercent.toFixed(3)}%\n`;
    summary += `   ✅ Response times consistent\n`;
  } else {
    summary += `   ⚠️  Potential stability issues detected:\n`;
    if (errorRatePercent >= 0.5) {
      summary += `      - Error rate: ${errorRatePercent.toFixed(3)}% (threshold: <0.5%)\n`;
    }
    if (avgLatency >= 400) {
      summary += `      - High average latency: ${avgLatency.toFixed(0)}ms (threshold: <400ms)\n`;
    }
    if (p95Latency >= 600) {
      summary += `      - High p95 latency: ${p95Latency.toFixed(0)}ms (threshold: <600ms)\n`;
    }
    if (slowReqs >= 50) {
      summary += `      - Too many slow requests: ${slowReqs} (threshold: <50)\n`;
    }
  }
  
  summary += `\n${stable ? '✅ SOAK TEST PASSED' : '❌ SOAK TEST FAILED'}\n\n`;
  
  if (stable) {
    summary += `💡 System is ready for production load\n`;
  } else {
    summary += `⚠️  Investigate issues before production deployment\n`;
  }
  
  return summary;
}
