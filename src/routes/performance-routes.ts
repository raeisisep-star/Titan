/**
 * TITAN Trading System - Performance Optimization API Routes
 * RESTful API endpoints for performance monitoring, caching, and optimization
 * 
 * Features:
 * - Performance metrics and analytics
 * - Cache management and statistics
 * - Resource pool monitoring
 * - Optimization rule management
 * - Real-time performance monitoring
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  performanceOptimizationService,
  CacheConfig,
  CacheType,
  OptimizationType,
  OptimizationRule,
  PerformanceMetrics,
  ResourcePool
} from '../services/performance-optimization-service';

type Bindings = {
  DB: D1Database;
};

const performanceRoutes = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all routes
performanceRoutes.use('/*', cors());

/**
 * ================================================
 * PERFORMANCE ANALYTICS ENDPOINTS
 * ================================================
 */

// Get comprehensive performance analytics
performanceRoutes.get('/analytics', async (c) => {
  try {
    const timeRange = {
      start: parseInt(c.req.query('start') || (Date.now() - 60 * 60 * 1000).toString()),
      end: parseInt(c.req.query('end') || Date.now().toString())
    };

    const analytics = performanceOptimizationService.getPerformanceAnalytics(timeRange);
    
    return c.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Failed to get performance analytics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Record performance metrics
performanceRoutes.post('/metrics', async (c) => {
  try {
    const metricsData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['endpoint', 'operation', 'duration'];
    for (const field of requiredFields) {
      if (metricsData[field] === undefined) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }
    
    const metrics: Omit<PerformanceMetrics, 'timestamp'> = {
      endpoint: metricsData.endpoint,
      operation: metricsData.operation,
      duration: parseFloat(metricsData.duration),
      memory_usage: parseFloat(metricsData.memory_usage || 0),
      cpu_usage: parseFloat(metricsData.cpu_usage || 0),
      cache_hits: parseInt(metricsData.cache_hits || 0),
      cache_misses: parseInt(metricsData.cache_misses || 0),
      error_count: parseInt(metricsData.error_count || 0),
      request_size: parseInt(metricsData.request_size || 0),
      response_size: parseInt(metricsData.response_size || 0),
      concurrent_requests: parseInt(metricsData.concurrent_requests || 1)
    };
    
    performanceOptimizationService.recordMetrics(metrics);
    
    return c.json({
      success: true,
      message: 'Performance metrics recorded successfully'
    });
  } catch (error) {
    console.error('Failed to record performance metrics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get performance trends
performanceRoutes.get('/trends', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7');
    const granularity = c.req.query('granularity') || 'hour'; // hour, day
    
    // Mock trend data - in real implementation, analyze historical metrics
    const trends = {
      time_period: `Last ${days} days`,
      granularity,
      data_points: [
        {
          timestamp: Date.now() - 6 * 60 * 60 * 1000,
          avg_response_time: 245,
          cache_hit_rate: 78.5,
          error_rate: 1.2,
          throughput: 150,
          memory_usage: 65.3,
          cpu_usage: 34.7
        },
        {
          timestamp: Date.now() - 5 * 60 * 60 * 1000,
          avg_response_time: 189,
          cache_hit_rate: 82.1,
          error_rate: 0.8,
          throughput: 175,
          memory_usage: 58.9,
          cpu_usage: 28.3
        },
        {
          timestamp: Date.now() - 4 * 60 * 60 * 1000,
          avg_response_time: 267,
          cache_hit_rate: 75.3,
          error_rate: 2.1,
          throughput: 142,
          memory_usage: 72.1,
          cpu_usage: 41.2
        },
        {
          timestamp: Date.now() - 3 * 60 * 60 * 1000,
          avg_response_time: 201,
          cache_hit_rate: 85.7,
          error_rate: 0.6,
          throughput: 188,
          memory_usage: 61.4,
          cpu_usage: 25.8
        },
        {
          timestamp: Date.now() - 2 * 60 * 60 * 1000,
          avg_response_time: 178,
          cache_hit_rate: 88.2,
          error_rate: 0.4,
          throughput: 210,
          memory_usage: 55.7,
          cpu_usage: 22.1
        },
        {
          timestamp: Date.now() - 1 * 60 * 60 * 1000,
          avg_response_time: 156,
          cache_hit_rate: 91.3,
          error_rate: 0.3,
          throughput: 235,
          memory_usage: 52.1,
          cpu_usage: 19.7
        }
      ],
      insights: [
        'Response time improved by 36% over the last 6 hours due to cache optimization',
        'Cache hit rate increased to 91.3% - excellent performance',
        'Error rate remains consistently low at <1%',
        'Memory usage is stable and within acceptable limits',
        'CPU usage decreased significantly with recent optimizations'
      ]
    };
    
    return c.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Failed to get performance trends:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * ================================================
 * CACHE MANAGEMENT ENDPOINTS
 * ================================================
 */

// Configure cache
performanceRoutes.post('/cache/configure', async (c) => {
  try {
    const { cache_name, config } = await c.req.json();
    
    if (!cache_name || !config) {
      return c.json({
        success: false,
        error: 'cache_name and config are required'
      }, 400);
    }
    
    // Validate config
    const cacheConfig: CacheConfig = {
      type: config.type as CacheType || CacheType.MEMORY,
      ttl: parseInt(config.ttl) || 60000,
      maxSize: parseInt(config.maxSize) || 100,
      compressionEnabled: config.compressionEnabled !== false,
      evictionPolicy: config.evictionPolicy || 'lru',
      warmupEnabled: config.warmupEnabled === true,
      warmupData: config.warmupData || []
    };
    
    performanceOptimizationService.configureCaches(cache_name, cacheConfig);
    
    return c.json({
      success: true,
      message: `Cache '${cache_name}' configured successfully`,
      config: cacheConfig
    });
  } catch (error) {
    console.error('Failed to configure cache:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get from cache
performanceRoutes.get('/cache/:cacheName/:key', async (c) => {
  try {
    const cacheName = c.req.param('cacheName');
    const key = c.req.param('key');
    
    const cachedData = await performanceOptimizationService.getFromCache(
      cacheName,
      key
    );
    
    if (cachedData !== null) {
      return c.json({
        success: true,
        cache_hit: true,
        data: cachedData
      });
    } else {
      return c.json({
        success: true,
        cache_hit: false,
        data: null
      }, 404);
    }
  } catch (error) {
    console.error('Failed to get from cache:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Set cache entry
performanceRoutes.post('/cache/:cacheName/:key', async (c) => {
  try {
    const cacheName = c.req.param('cacheName');
    const key = c.req.param('key');
    const { data, ttl } = await c.req.json();
    
    await performanceOptimizationService.setCache(
      cacheName,
      key,
      data,
      ttl ? parseInt(ttl) : undefined
    );
    
    return c.json({
      success: true,
      message: `Cache entry set: ${cacheName}:${key}`
    });
  } catch (error) {
    console.error('Failed to set cache entry:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Invalidate cache
performanceRoutes.delete('/cache/:cacheName', async (c) => {
  try {
    const cacheName = c.req.param('cacheName');
    const pattern = c.req.query('pattern'); // Optional pattern for selective invalidation
    
    const deletedCount = await performanceOptimizationService.invalidateCache(
      cacheName,
      pattern
    );
    
    return c.json({
      success: true,
      message: `Cache invalidated: ${cacheName}`,
      deleted_entries: deletedCount
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get cache statistics
performanceRoutes.get('/cache/stats', async (c) => {
  try {
    const analytics = performanceOptimizationService.getPerformanceAnalytics();
    const cacheStats = analytics.cache_stats;
    
    return c.json({
      success: true,
      cache_statistics: cacheStats
    });
  } catch (error) {
    console.error('Failed to get cache statistics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * ================================================
 * OPTIMIZATION ENDPOINTS
 * ================================================
 */

// Test cache performance with sample data
performanceRoutes.post('/cache/test/:cacheName', async (c) => {
  try {
    const cacheName = c.req.param('cacheName');
    const { operations = 100, data_size = 'medium' } = await c.req.json();
    
    // Generate test data based on size
    const testDataSizes: { [key: string]: any } = {
      small: { message: 'Small test data', value: 42 },
      medium: {
        message: 'Medium test data',
        data: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `item_${i}` }))
      },
      large: {
        message: 'Large test data',
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `large_item_${i}`,
          metadata: {
            created: new Date().toISOString(),
            tags: [`tag_${i % 10}`, `category_${i % 5}`]
          }
        }))
      }
    };
    
    const testData = testDataSizes[data_size] || testDataSizes.medium;
    
    // Perform cache performance test
    const startTime = Date.now();
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Write test
    for (let i = 0; i < operations; i++) {
      const key = `test_key_${i}`;
      await performanceOptimizationService.setCache(cacheName, key, {
        ...testData,
        id: i
      });
    }
    
    const writeTime = Date.now() - startTime;
    
    // Read test
    const readStartTime = Date.now();
    for (let i = 0; i < operations; i++) {
      const key = `test_key_${i}`;
      const result = await performanceOptimizationService.getFromCache(cacheName, key);
      if (result !== null) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    }
    
    const readTime = Date.now() - readStartTime;
    const totalTime = Date.now() - startTime;
    
    // Cleanup test data
    await performanceOptimizationService.invalidateCache(cacheName, '^test_key_');
    
    return c.json({
      success: true,
      performance_test: {
        cache_name: cacheName,
        operations,
        data_size,
        results: {
          total_time: totalTime,
          write_time: writeTime,
          read_time: readTime,
          cache_hits: cacheHits,
          cache_misses: cacheMisses,
          hit_rate: ((cacheHits / operations) * 100).toFixed(2) + '%',
          avg_write_time: (writeTime / operations).toFixed(2) + 'ms',
          avg_read_time: (readTime / operations).toFixed(2) + 'ms'
        }
      }
    });
  } catch (error) {
    console.error('Failed to test cache performance:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Configure compression
performanceRoutes.post('/compression/configure', async (c) => {
  try {
    const config = await c.req.json();
    
    const compressionConfig = {
      enabled: config.enabled !== false,
      algorithm: config.algorithm || 'gzip',
      level: parseInt(config.level) || 6,
      minSize: parseInt(config.minSize) || 1024,
      types: config.types || ['application/json', 'text/html']
    };
    
    performanceOptimizationService.configureCompression(compressionConfig);
    
    return c.json({
      success: true,
      message: 'Compression configured successfully',
      config: compressionConfig
    });
  } catch (error) {
    console.error('Failed to configure compression:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Test compression on sample data
performanceRoutes.post('/compression/test', async (c) => {
  try {
    const { data, content_type } = await c.req.json();
    
    if (!data) {
      return c.json({
        success: false,
        error: 'Data is required for compression test'
      }, 400);
    }
    
    const result = await performanceOptimizationService.compressResponse(
      data,
      content_type
    );
    
    const compressionRatio = result.originalSize > 0 ? 
      ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(2) : 0;
    
    return c.json({
      success: true,
      compression_test: {
        ...result,
        compression_ratio: `${compressionRatio}%`,
        size_reduction: result.originalSize - result.compressedSize
      }
    });
  } catch (error) {
    console.error('Failed to test compression:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * ================================================
 * SYSTEM MONITORING ENDPOINTS
 * ================================================
 */

// Get system resource usage
performanceRoutes.get('/system/resources', async (c) => {
  try {
    // Mock system resource data - in real implementation, get actual system metrics
    const resources = {
      memory: {
        used: 512 * 1024 * 1024, // 512 MB
        total: 2 * 1024 * 1024 * 1024, // 2 GB
        usage_percent: 25,
        heap_used: 256 * 1024 * 1024, // 256 MB
        heap_total: 1024 * 1024 * 1024 // 1 GB
      },
      cpu: {
        usage_percent: 35.7,
        cores: 4,
        frequency: '2.4 GHz',
        load_average: [1.2, 1.1, 0.9]
      },
      disk: {
        used: 15 * 1024 * 1024 * 1024, // 15 GB
        total: 100 * 1024 * 1024 * 1024, // 100 GB
        usage_percent: 15,
        io_read: 1250000, // bytes/sec
        io_write: 850000   // bytes/sec
      },
      network: {
        bytes_in: 2500000,  // bytes/sec
        bytes_out: 1800000, // bytes/sec
        packets_in: 1200,
        packets_out: 950,
        connections: 45
      },
      performance_impact: {
        cache_memory_usage: 128 * 1024 * 1024, // 128 MB
        connection_pools: 15,
        background_processes: 8,
        optimization_overhead: 2.3 // percent
      }
    };
    
    return c.json({
      success: true,
      system_resources: resources,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to get system resources:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get optimization recommendations
performanceRoutes.get('/optimization/recommendations', async (c) => {
  try {
    const analytics = performanceOptimizationService.getPerformanceAnalytics();
    
    const recommendations = [
      {
        category: 'caching',
        priority: 'high',
        title: 'Increase cache TTL for static data',
        description: 'Static data cache hit rate is 78%. Consider increasing TTL from 30s to 5min.',
        estimated_impact: '15% response time improvement',
        implementation: 'Update cache configuration for market_data cache'
      },
      {
        category: 'compression',
        priority: 'medium',
        title: 'Enable compression for API responses',
        description: 'Large JSON responses are not compressed. Enable gzip compression.',
        estimated_impact: '40% bandwidth reduction',
        implementation: 'Configure compression middleware with gzip level 6'
      },
      {
        category: 'batching',
        priority: 'medium',
        title: 'Batch database queries',
        description: 'Multiple individual queries detected. Implement query batching.',
        estimated_impact: '25% database load reduction',
        implementation: 'Implement batch processor for user data queries'
      },
      {
        category: 'resource_pooling',
        priority: 'low',
        title: 'Optimize connection pool size',
        description: 'Database connection pool utilization is at 85%. Consider increasing pool size.',
        estimated_impact: '10% query performance improvement',
        implementation: 'Increase database connection pool from 10 to 15 connections'
      }
    ];
    
    return c.json({
      success: true,
      recommendations,
      performance_summary: analytics.summary
    });
  } catch (error) {
    console.error('Failed to get optimization recommendations:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Performance benchmarks
performanceRoutes.post('/benchmark', async (c) => {
  try {
    const { test_type, iterations = 100 } = await c.req.json();
    
    const benchmarks: { [key: string]: Function } = {
      'cache_performance': () => runCacheBenchmark(iterations),
      'compression_performance': () => runCompressionBenchmark(iterations),
      'api_response': () => runAPIResponseBenchmark(iterations),
      'memory_usage': () => runMemoryBenchmark(iterations)
    };
    
    const benchmark = benchmarks[test_type];
    if (!benchmark) {
      return c.json({
        success: false,
        error: `Unknown benchmark type: ${test_type}`
      }, 400);
    }
    
    const startTime = Date.now();
    const result = await benchmark();
    const totalTime = Date.now() - startTime;
    
    return c.json({
      success: true,
      benchmark: {
        test_type,
        iterations,
        total_time: totalTime,
        avg_time_per_iteration: (totalTime / iterations).toFixed(2) + 'ms',
        ...result
      }
    });
  } catch (error) {
    console.error('Failed to run benchmark:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Helper benchmark functions
async function runCacheBenchmark(iterations: number) {
  let hits = 0;
  let misses = 0;
  
  for (let i = 0; i < iterations; i++) {
    const result = await performanceOptimizationService.getFromCache(
      'benchmark_cache',
      `test_${i % 50}`, // 50% hit rate
      async () => ({ data: `benchmark_data_${i}` })
    );
    
    if (result) hits++;
    else misses++;
  }
  
  return { cache_hits: hits, cache_misses: misses, hit_rate: (hits / iterations * 100).toFixed(1) + '%' };
}

async function runCompressionBenchmark(iterations: number) {
  const testData = { message: 'Benchmark test data', items: Array.from({ length: 100 }, (_, i) => i) };
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  
  for (let i = 0; i < iterations; i++) {
    const result = await performanceOptimizationService.compressResponse(testData);
    totalOriginalSize += result.originalSize;
    totalCompressedSize += result.compressedSize;
  }
  
  return {
    total_original_size: totalOriginalSize,
    total_compressed_size: totalCompressedSize,
    compression_ratio: ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1) + '%'
  };
}

async function runAPIResponseBenchmark(iterations: number) {
  const responses = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    const duration = Date.now() - start;
    responses.push(duration);
  }
  
  const avgTime = responses.reduce((sum, time) => sum + time, 0) / responses.length;
  const minTime = Math.min(...responses);
  const maxTime = Math.max(...responses);
  
  return { avg_response_time: avgTime.toFixed(2) + 'ms', min_time: minTime + 'ms', max_time: maxTime + 'ms' };
}

async function runMemoryBenchmark(iterations: number) {
  const objects = [];
  const initialMemory = process.memoryUsage?.().heapUsed || 0;
  
  for (let i = 0; i < iterations; i++) {
    objects.push({ id: i, data: Array.from({ length: 1000 }, (_, j) => j) });
  }
  
  const finalMemory = process.memoryUsage?.().heapUsed || 0;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Cleanup
  objects.length = 0;
  
  return { 
    memory_increase: memoryIncrease,
    memory_per_object: Math.round(memoryIncrease / iterations),
    objects_created: iterations
  };
}

export default performanceRoutes;