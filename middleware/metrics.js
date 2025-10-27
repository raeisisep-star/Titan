/**
 * Metrics Middleware
 * Collects basic metrics (log-based) for monitoring
 */

const { logger } = require('../utils/logMasking');

// Metrics storage (in-memory for log-based approach)
const metrics = {
  requests: {
    total: 0,
    by_status: {},
    by_endpoint: {},
  },
  response_times: [],
  rate_limits: {
    total_429: 0,
    by_endpoint: {},
  },
  errors: {
    total: 0,
    by_type: {},
  }
};

// Flush metrics to logs every N seconds
let metricsFlushInterval = null;

/**
 * Start metrics collection and logging
 * @param {number} intervalSeconds - How often to flush metrics to logs
 */
function startMetricsCollection(intervalSeconds = 60) {
  if (metricsFlushInterval) {
    clearInterval(metricsFlushInterval);
  }
  
  metricsFlushInterval = setInterval(() => {
    flushMetricsToLog();
  }, intervalSeconds * 1000);
  
  console.log(`[Metrics] Started collection (flush every ${intervalSeconds}s)`);
}

/**
 * Stop metrics collection
 */
function stopMetricsCollection() {
  if (metricsFlushInterval) {
    clearInterval(metricsFlushInterval);
    metricsFlushInterval = null;
    console.log('[Metrics] Stopped collection');
  }
}

/**
 * Flush current metrics to logs
 */
function flushMetricsToLog() {
  const summary = {
    timestamp: new Date().toISOString(),
    window: '60s',
    requests: {
      total: metrics.requests.total,
      by_status: metrics.requests.by_status,
      top_endpoints: getTopEndpoints(5),
    },
    performance: {
      avg_response_time: calculateAvgResponseTime(),
      p95_response_time: calculatePercentile(95),
      p99_response_time: calculatePercentile(99),
    },
    rate_limiting: {
      total_429: metrics.rate_limits.total_429,
      by_endpoint: metrics.rate_limits.by_endpoint,
    },
    errors: {
      total: metrics.errors.total,
      by_type: metrics.errors.by_type,
    }
  };
  
  logger.info('[METRICS]', summary);
  
  // Reset counters for next window
  resetMetrics();
}

/**
 * Reset metrics counters
 */
function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.by_status = {};
  metrics.requests.by_endpoint = {};
  metrics.response_times = [];
  metrics.rate_limits.total_429 = 0;
  metrics.rate_limits.by_endpoint = {};
  metrics.errors.total = 0;
  metrics.errors.by_type = {};
}

/**
 * Get top N endpoints by request count
 * @param {number} n - Number of top endpoints
 * @returns {Array} - Top endpoints
 */
function getTopEndpoints(n = 5) {
  const sorted = Object.entries(metrics.requests.by_endpoint)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
  
  return Object.fromEntries(sorted);
}

/**
 * Calculate average response time
 * @returns {number} - Average in milliseconds
 */
function calculateAvgResponseTime() {
  if (metrics.response_times.length === 0) return 0;
  
  const sum = metrics.response_times.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / metrics.response_times.length);
}

/**
 * Calculate percentile of response times
 * @param {number} percentile - Percentile to calculate (e.g., 95, 99)
 * @returns {number} - Percentile value in milliseconds
 */
function calculatePercentile(percentile) {
  if (metrics.response_times.length === 0) return 0;
  
  const sorted = [...metrics.response_times].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[index] || 0;
}

/**
 * Metrics middleware for Hono
 * @returns {Function} - Hono middleware
 */
function metricsMiddleware() {
  return async (c, next) => {
    const startTime = Date.now();
    const endpoint = c.req.path;
    const method = c.req.method;
    
    // Track request
    metrics.requests.total++;
    
    // Track by endpoint
    const endpointKey = `${method} ${endpoint}`;
    metrics.requests.by_endpoint[endpointKey] = 
      (metrics.requests.by_endpoint[endpointKey] || 0) + 1;
    
    await next();
    
    // Track response
    const responseTime = Date.now() - startTime;
    const status = c.res.status || 200;
    
    // Store response time
    metrics.response_times.push(responseTime);
    
    // Track by status
    metrics.requests.by_status[status] = 
      (metrics.requests.by_status[status] || 0) + 1;
    
    // Track 429 rate limits
    if (status === 429) {
      metrics.rate_limits.total_429++;
      metrics.rate_limits.by_endpoint[endpointKey] = 
        (metrics.rate_limits.by_endpoint[endpointKey] || 0) + 1;
    }
    
    // Track errors (5xx)
    if (status >= 500) {
      metrics.errors.total++;
      const errorType = `${status}_error`;
      metrics.errors.by_type[errorType] = 
        (metrics.errors.by_type[errorType] || 0) + 1;
    }
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      logger.warn('[SLOW_REQUEST]', {
        endpoint: endpointKey,
        response_time: responseTime,
        status
      });
    }
  };
}

/**
 * Get current metrics snapshot
 * @returns {Object} - Current metrics
 */
function getMetricsSnapshot() {
  return {
    timestamp: new Date().toISOString(),
    requests: {
      total: metrics.requests.total,
      by_status: metrics.requests.by_status,
      by_endpoint: metrics.requests.by_endpoint,
    },
    performance: {
      avg_response_time: calculateAvgResponseTime(),
      p95_response_time: calculatePercentile(95),
      p99_response_time: calculatePercentile(99),
      samples: metrics.response_times.length,
    },
    rate_limiting: {
      total_429: metrics.rate_limits.total_429,
      by_endpoint: metrics.rate_limits.by_endpoint,
    },
    errors: {
      total: metrics.errors.total,
      by_type: metrics.errors.by_type,
    }
  };
}

module.exports = {
  metricsMiddleware,
  startMetricsCollection,
  stopMetricsCollection,
  getMetricsSnapshot,
  flushMetricsToLog
};
