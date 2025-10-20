/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ PERFORMANCE MONITORING SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Real-time performance monitoring and optimization
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0
      },
      endpoints: new Map(),
      errors: [],
      systemHealth: {
        cpu: 0,
        memory: 0,
        uptime: 0
      }
    };
    
    // Start monitoring
    this.startMonitoring();
    
    console.log('⚡ Performance Monitor initialized');
  }
  
  /**
   * Track API request
   */
  trackRequest(endpoint, method, responseTime, success) {
    // Update total metrics
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }
    
    // Calculate rolling average response time
    const totalTime = this.metrics.requests.avgResponseTime * (this.metrics.requests.total - 1);
    this.metrics.requests.avgResponseTime = (totalTime + responseTime) / this.metrics.requests.total;
    
    // Track endpoint-specific metrics
    const key = `${method} ${endpoint}`;
    
    if (!this.metrics.endpoints.has(key)) {
      this.metrics.endpoints.set(key, {
        count: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        errors: 0
      });
    }
    
    const endpointMetrics = this.metrics.endpoints.get(key);
    endpointMetrics.count++;
    
    // Update endpoint response times
    const endpointTotalTime = endpointMetrics.avgResponseTime * (endpointMetrics.count - 1);
    endpointMetrics.avgResponseTime = (endpointTotalTime + responseTime) / endpointMetrics.count;
    endpointMetrics.maxResponseTime = Math.max(endpointMetrics.maxResponseTime, responseTime);
    endpointMetrics.minResponseTime = Math.min(endpointMetrics.minResponseTime, responseTime);
    
    if (!success) {
      endpointMetrics.errors++;
    }
  }
  
  /**
   * Track error
   */
  trackError(endpoint, error) {
    this.metrics.errors.push({
      endpoint,
      error: error.message,
      timestamp: new Date(),
      stack: error.stack
    });
    
    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.shift();
    }
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      requests: this.metrics.requests,
      endpoints: Array.from(this.metrics.endpoints.entries()).map(([key, metrics]) => ({
        endpoint: key,
        ...metrics
      })),
      recentErrors: this.metrics.errors.slice(-10),
      systemHealth: this.metrics.systemHealth
    };
  }
  
  /**
   * Get slow endpoints (response time > 1000ms)
   */
  getSlowEndpoints() {
    const slowEndpoints = [];
    
    for (const [key, metrics] of this.metrics.endpoints.entries()) {
      if (metrics.avgResponseTime > 1000) {
        slowEndpoints.push({
          endpoint: key,
          avgResponseTime: metrics.avgResponseTime.toFixed(2),
          count: metrics.count
        });
      }
    }
    
    return slowEndpoints.sort((a, b) => b.avgResponseTime - a.avgResponseTime);
  }
  
  /**
   * Get error-prone endpoints
   */
  getErrorProneEndpoints() {
    const errorEndpoints = [];
    
    for (const [key, metrics] of this.metrics.endpoints.entries()) {
      if (metrics.errors > 0) {
        const errorRate = (metrics.errors / metrics.count) * 100;
        errorEndpoints.push({
          endpoint: key,
          errorRate: errorRate.toFixed(2),
          totalErrors: metrics.errors,
          totalRequests: metrics.count
        });
      }
    }
    
    return errorEndpoints.sort((a, b) => b.errorRate - a.errorRate);
  }
  
  /**
   * Start system monitoring
   */
  startMonitoring() {
    // Update system metrics every 10 seconds
    setInterval(() => {
      const usage = process.memoryUsage();
      
      this.metrics.systemHealth = {
        cpu: process.cpuUsage(),
        memory: {
          heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          rss: (usage.rss / 1024 / 1024).toFixed(2) + ' MB',
          external: (usage.external / 1024 / 1024).toFixed(2) + ' MB'
        },
        uptime: process.uptime()
      };
    }, 10000);
  }
  
  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0
      },
      endpoints: new Map(),
      errors: [],
      systemHealth: this.metrics.systemHealth
    };
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getMetrics();
    const slowEndpoints = this.getSlowEndpoints();
    const errorEndpoints = this.getErrorProneEndpoints();
    
    return {
      summary: {
        totalRequests: metrics.requests.total,
        successRate: metrics.requests.total > 0 
          ? ((metrics.requests.successful / metrics.requests.total) * 100).toFixed(2) + '%'
          : '0%',
        avgResponseTime: metrics.requests.avgResponseTime.toFixed(2) + ' ms',
        totalEndpoints: metrics.endpoints.length
      },
      slowEndpoints: slowEndpoints.slice(0, 10),
      errorProneEndpoints: errorEndpoints.slice(0, 10),
      recentErrors: metrics.recentErrors,
      systemHealth: metrics.systemHealth,
      generatedAt: new Date().toISOString()
    };
  }
}

// Singleton instance
let performanceMonitor;

function getPerformanceMonitor() {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

module.exports = { PerformanceMonitor, getPerformanceMonitor };
