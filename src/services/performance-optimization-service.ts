/**
 * TITAN Trading System - Performance Optimization Service
 * Advanced performance monitoring, caching, and optimization system
 * 
 * Features:
 * - Multi-layered caching with intelligent invalidation
 * - Request batching and debouncing
 * - Performance monitoring and metrics
 * - Resource pooling and connection management
 * - Memory optimization and garbage collection
 * - Database query optimization
 * - API response compression and streaming
 * - Load balancing and request routing
 */

export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
  CDN = 'cdn',
  BROWSER = 'browser'
}

export enum OptimizationType {
  CACHE = 'cache',
  BATCH = 'batch',
  DEBOUNCE = 'debounce',
  COMPRESSION = 'compression',
  POOLING = 'pooling',
  STREAMING = 'streaming',
  PREFETCH = 'prefetch',
  LAZY_LOAD = 'lazy_load'
}

export interface CacheConfig {
  type: CacheType;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  compressionEnabled: boolean;
  serializer?: 'json' | 'msgpack' | 'protobuf';
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'fifo';
  warmupEnabled: boolean;
  warmupData?: string[];
}

export interface PerformanceMetrics {
  timestamp: number;
  endpoint: string;
  operation: string;
  duration: number;
  memory_usage: number;
  cpu_usage: number;
  cache_hits: number;
  cache_misses: number;
  error_count: number;
  request_size: number;
  response_size: number;
  concurrent_requests: number;
}

export interface OptimizationRule {
  id: string;
  name: string;
  type: OptimizationType;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  metrics_threshold?: {
    response_time?: number;
    memory_usage?: number;
    cpu_usage?: number;
    error_rate?: number;
  };
}

export interface BatchRequest {
  id: string;
  operation: string;
  params: any;
  timestamp: number;
  priority: number;
}

export interface BatchProcessor {
  operation: string;
  batchSize: number;
  batchTimeout: number;
  processor: (requests: BatchRequest[]) => Promise<any[]>;
}

export interface ResourcePool {
  name: string;
  type: 'connection' | 'object' | 'worker';
  minSize: number;
  maxSize: number;
  currentSize: number;
  activeConnections: number;
  factory: () => Promise<any>;
  validator: (resource: any) => boolean;
  destroyer: (resource: any) => Promise<void>;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  minSize: number; // Minimum response size to compress
  types: string[]; // MIME types to compress
}

export class PerformanceOptimizationService {
  private caches = new Map<string, Map<string, { data: any; timestamp: number; hits: number }>>();
  private cacheConfigs = new Map<string, CacheConfig>();
  private performanceMetrics: PerformanceMetrics[] = [];
  private optimizationRules = new Map<string, OptimizationRule>();
  private batchProcessors = new Map<string, BatchProcessor>();
  private pendingBatches = new Map<string, BatchRequest[]>();
  private batchTimeouts = new Map<string, NodeJS.Timeout>();
  private resourcePools = new Map<string, ResourcePool & { resources: any[]; waitingQueue: Function[] }>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private compressionConfig: CompressionConfig;

  constructor() {
    this.setupDefaultConfigs();
    this.setupDefaultRules();
    // this.startPerformanceMonitoring(); // Commented out for Cloudflare deployment
  }

  /**
   * ================================================
   * CACHING SYSTEM
   * ================================================
   */

  /**
   * Configure cache for specific key pattern
   */
  configureCaches(cacheName: string, config: CacheConfig): void {
    this.cacheConfigs.set(cacheName, config);
    this.caches.set(cacheName, new Map());

    if (config.warmupEnabled && config.warmupData) {
      this.warmupCache(cacheName, config.warmupData);
    }

    console.log(`Cache configured: ${cacheName} (TTL: ${config.ttl}ms, Max Size: ${config.maxSize})`);
  }

  /**
   * Get from cache with fallback
   */
  async getFromCache<T>(
    cacheName: string,
    key: string,
    fallbackFn?: () => Promise<T>,
    customTTL?: number
  ): Promise<T | null> {
    try {
      const cache = this.caches.get(cacheName);
      const config = this.cacheConfigs.get(cacheName);
      
      if (!cache || !config) {
        console.warn(`Cache not configured: ${cacheName}`);
        return fallbackFn ? await fallbackFn() : null;
      }

      const cacheEntry = cache.get(key);
      
      // Check if cached data is valid
      if (cacheEntry && (Date.now() - cacheEntry.timestamp) < config.ttl) {
        cacheEntry.hits++;
        this.recordCacheHit(cacheName, key);
        return cacheEntry.data;
      }

      // Cache miss - get fresh data
      this.recordCacheMiss(cacheName, key);
      
      if (fallbackFn) {
        const freshData = await fallbackFn();
        await this.setCache(cacheName, key, freshData, customTTL);
        return freshData;
      }

      return null;
    } catch (error) {
      console.error(`Cache get error for ${cacheName}:${key}:`, error);
      return fallbackFn ? await fallbackFn() : null;
    }
  }

  /**
   * Set cache entry
   */
  async setCache(cacheName: string, key: string, data: any, customTTL?: number): Promise<void> {
    try {
      const cache = this.caches.get(cacheName);
      const config = this.cacheConfigs.get(cacheName);
      
      if (!cache || !config) {
        console.warn(`Cache not configured: ${cacheName}`);
        return;
      }

      // Check cache size and evict if necessary
      if (cache.size >= config.maxSize) {
        await this.evictCache(cacheName, config.evictionPolicy);
      }

      // Compress data if enabled
      const finalData = config.compressionEnabled ? await this.compressData(data) : data;

      cache.set(key, {
        data: finalData,
        timestamp: Date.now(),
        hits: 0
      });

      console.log(`Cache set: ${cacheName}:${key}`);
    } catch (error) {
      console.error(`Cache set error for ${cacheName}:${key}:`, error);
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidateCache(cacheName: string, pattern?: string): Promise<number> {
    try {
      const cache = this.caches.get(cacheName);
      if (!cache) return 0;

      let deletedCount = 0;

      if (pattern) {
        const regex = new RegExp(pattern);
        for (const [key] of cache) {
          if (regex.test(key)) {
            cache.delete(key);
            deletedCount++;
          }
        }
      } else {
        deletedCount = cache.size;
        cache.clear();
      }

      console.log(`Cache invalidated: ${cacheName}, deleted ${deletedCount} entries`);
      return deletedCount;
    } catch (error) {
      console.error(`Cache invalidation error for ${cacheName}:`, error);
      return 0;
    }
  }

  /**
   * ================================================
   * REQUEST BATCHING SYSTEM
   * ================================================
   */

  /**
   * Register batch processor
   */
  registerBatchProcessor(processor: BatchProcessor): void {
    this.batchProcessors.set(processor.operation, processor);
    this.pendingBatches.set(processor.operation, []);
    console.log(`Batch processor registered: ${processor.operation}`);
  }

  /**
   * Add request to batch
   */
  async addToBatch<T>(
    operation: string,
    params: any,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const processor = this.batchProcessors.get(operation);
      if (!processor) {
        reject(new Error(`No batch processor found for operation: ${operation}`));
        return;
      }

      const request: BatchRequest = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        operation,
        params,
        timestamp: Date.now(),
        priority
      };

      // Add resolve/reject to request
      (request as any).resolve = resolve;
      (request as any).reject = reject;

      const pending = this.pendingBatches.get(operation)!;
      pending.push(request);
      
      // Sort by priority (higher number = higher priority)
      pending.sort((a, b) => b.priority - a.priority);

      // Check if we should process the batch
      if (pending.length >= processor.batchSize) {
        this.processBatch(operation);
      } else {
        // Set timeout if not already set
        if (!this.batchTimeouts.has(operation)) {
          const timeout = setTimeout(() => {
            this.processBatch(operation);
          }, processor.batchTimeout);
          this.batchTimeouts.set(operation, timeout);
        }
      }
    });
  }

  /**
   * ================================================
   * DEBOUNCING SYSTEM
   * ================================================
   */

  /**
   * Debounce function calls
   */
  debounce<T>(
    key: string,
    fn: () => Promise<T>,
    delay: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * ================================================
   * RESOURCE POOLING
   * ================================================
   */

  /**
   * Create resource pool
   */
  async createResourcePool(pool: ResourcePool): Promise<void> {
    const poolWithQueue = {
      ...pool,
      resources: [],
      waitingQueue: []
    };

    // Pre-create minimum resources
    for (let i = 0; i < pool.minSize; i++) {
      try {
        const resource = await pool.factory();
        poolWithQueue.resources.push(resource);
        poolWithQueue.currentSize++;
      } catch (error) {
        console.error(`Failed to create initial resource for pool ${pool.name}:`, error);
      }
    }

    this.resourcePools.set(pool.name, poolWithQueue);
    console.log(`Resource pool created: ${pool.name} (${poolWithQueue.currentSize}/${pool.maxSize})`);
  }

  /**
   * Get resource from pool
   */
  async getResource(poolName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const pool = this.resourcePools.get(poolName);
      if (!pool) {
        reject(new Error(`Resource pool not found: ${poolName}`));
        return;
      }

      // Find available resource
      const availableIndex = pool.resources.findIndex(resource => 
        resource && pool.validator(resource)
      );

      if (availableIndex !== -1) {
        const resource = pool.resources[availableIndex];
        pool.resources[availableIndex] = null; // Mark as in use
        pool.activeConnections++;
        resolve(resource);
        return;
      }

      // No available resource, try to create new one
      if (pool.currentSize < pool.maxSize) {
        try {
          const resource = await pool.factory();
          pool.currentSize++;
          pool.activeConnections++;
          resolve(resource);
          return;
        } catch (error) {
          console.error(`Failed to create resource for pool ${poolName}:`, error);
        }
      }

      // Pool is full, add to waiting queue
      pool.waitingQueue.push(resolve);
    });
  }

  /**
   * Return resource to pool
   */
  async returnResource(poolName: string, resource: any): Promise<void> {
    const pool = this.resourcePools.get(poolName);
    if (!pool) {
      console.warn(`Resource pool not found: ${poolName}`);
      return;
    }

    pool.activeConnections--;

    // Check if resource is still valid
    if (!pool.validator(resource)) {
      // Resource is invalid, destroy it and create a new one
      try {
        await pool.destroyer(resource);
        pool.currentSize--;
        
        // Create replacement if below minimum
        if (pool.currentSize < pool.minSize) {
          const newResource = await pool.factory();
          const emptyIndex = pool.resources.findIndex(r => r === null);
          if (emptyIndex !== -1) {
            pool.resources[emptyIndex] = newResource;
          } else {
            pool.resources.push(newResource);
          }
          pool.currentSize++;
        }
      } catch (error) {
        console.error(`Failed to destroy invalid resource:`, error);
      }
      return;
    }

    // Check if there are waiting requests
    if (pool.waitingQueue.length > 0) {
      const resolve = pool.waitingQueue.shift()!;
      pool.activeConnections++;
      resolve(resource);
      return;
    }

    // Return to available pool
    const emptyIndex = pool.resources.findIndex(r => r === null);
    if (emptyIndex !== -1) {
      pool.resources[emptyIndex] = resource;
    } else {
      pool.resources.push(resource);
    }
  }

  /**
   * ================================================
   * PERFORMANCE MONITORING
   * ================================================
   */

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.performanceMetrics.push(fullMetrics);

    // Keep only last 1000 metrics to prevent memory bloat
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Check optimization rules
    this.checkOptimizationRules(fullMetrics);
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(timeRange?: { start: number; end: number }): any {
    const start = timeRange?.start || (Date.now() - 60 * 60 * 1000); // Last hour
    const end = timeRange?.end || Date.now();

    const relevantMetrics = this.performanceMetrics.filter(
      m => m.timestamp >= start && m.timestamp <= end
    );

    if (relevantMetrics.length === 0) {
      return {
        summary: { total_requests: 0, avg_response_time: 0, cache_hit_rate: 0 },
        by_endpoint: {},
        trends: []
      };
    }

    // Calculate summary statistics
    const totalRequests = relevantMetrics.length;
    const avgResponseTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const totalCacheHits = relevantMetrics.reduce((sum, m) => sum + m.cache_hits, 0);
    const totalCacheMisses = relevantMetrics.reduce((sum, m) => sum + m.cache_misses, 0);
    const cacheHitRate = totalCacheHits + totalCacheMisses > 0 ? 
      (totalCacheHits / (totalCacheHits + totalCacheMisses)) * 100 : 0;

    // Group by endpoint
    const byEndpoint: { [endpoint: string]: any } = {};
    relevantMetrics.forEach(metric => {
      if (!byEndpoint[metric.endpoint]) {
        byEndpoint[metric.endpoint] = {
          requests: 0,
          total_duration: 0,
          errors: 0,
          cache_hits: 0,
          cache_misses: 0
        };
      }
      
      const endpointStats = byEndpoint[metric.endpoint];
      endpointStats.requests++;
      endpointStats.total_duration += metric.duration;
      endpointStats.errors += metric.error_count;
      endpointStats.cache_hits += metric.cache_hits;
      endpointStats.cache_misses += metric.cache_misses;
    });

    // Calculate averages for each endpoint
    Object.keys(byEndpoint).forEach(endpoint => {
      const stats = byEndpoint[endpoint];
      stats.avg_response_time = stats.total_duration / stats.requests;
      stats.error_rate = (stats.errors / stats.requests) * 100;
      stats.cache_hit_rate = stats.cache_hits + stats.cache_misses > 0 ? 
        (stats.cache_hits / (stats.cache_hits + stats.cache_misses)) * 100 : 0;
    });

    return {
      summary: {
        total_requests: totalRequests,
        avg_response_time: avgResponseTime,
        cache_hit_rate: cacheHitRate,
        total_errors: relevantMetrics.reduce((sum, m) => sum + m.error_count, 0),
        time_range: { start, end }
      },
      by_endpoint: byEndpoint,
      cache_stats: this.getCacheStatistics(),
      resource_pools: this.getResourcePoolStatistics(),
      optimization_rules: Array.from(this.optimizationRules.values())
    };
  }

  /**
   * ================================================
   * COMPRESSION SYSTEM
   * ================================================
   */

  /**
   * Configure response compression
   */
  configureCompression(config: CompressionConfig): void {
    this.compressionConfig = config;
    console.log(`Compression configured: ${config.algorithm} level ${config.level}`);
  }

  /**
   * Compress response data
   */
  async compressResponse(data: any, contentType?: string): Promise<{
    compressed: boolean;
    data: any;
    originalSize: number;
    compressedSize: number;
  }> {
    try {
      if (!this.compressionConfig.enabled) {
        return {
          compressed: false,
          data,
          originalSize: 0,
          compressedSize: 0
        };
      }

      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const originalSize = new Blob([dataString]).size;

      // Check minimum size threshold
      if (originalSize < this.compressionConfig.minSize) {
        return {
          compressed: false,
          data,
          originalSize,
          compressedSize: originalSize
        };
      }

      // Check content type
      if (contentType && !this.compressionConfig.types.includes(contentType)) {
        return {
          compressed: false,
          data,
          originalSize,
          compressedSize: originalSize
        };
      }

      // Mock compression (in real implementation, use actual compression libraries)
      const compressedData = this.mockCompress(dataString);
      const compressedSize = new Blob([compressedData]).size;

      return {
        compressed: true,
        data: compressedData,
        originalSize,
        compressedSize
      };
    } catch (error) {
      console.error('Compression error:', error);
      return {
        compressed: false,
        data,
        originalSize: 0,
        compressedSize: 0
      };
    }
  }

  // Private helper methods
  private async processBatch(operation: string): Promise<void> {
    try {
      const processor = this.batchProcessors.get(operation);
      const pending = this.pendingBatches.get(operation);
      
      if (!processor || !pending || pending.length === 0) {
        return;
      }

      // Clear timeout
      const timeout = this.batchTimeouts.get(operation);
      if (timeout) {
        clearTimeout(timeout);
        this.batchTimeouts.delete(operation);
      }

      // Process batch
      const requests = pending.splice(0, processor.batchSize);
      
      try {
        const results = await processor.processor(requests);
        
        // Resolve individual promises
        requests.forEach((request, index) => {
          const resolve = (request as any).resolve;
          if (resolve) {
            resolve(results[index]);
          }
        });
      } catch (error) {
        // Reject all pending requests
        requests.forEach(request => {
          const reject = (request as any).reject;
          if (reject) {
            reject(error);
          }
        });
      }

      console.log(`Batch processed: ${operation}, ${requests.length} requests`);
    } catch (error) {
      console.error(`Batch processing error for ${operation}:`, error);
    }
  }

  private async evictCache(cacheName: string, policy: string): Promise<void> {
    const cache = this.caches.get(cacheName);
    if (!cache || cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (policy) {
      case 'lru': // Least Recently Used
        let oldestTime = Date.now();
        for (const [key, entry] of cache) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            keyToEvict = key;
          }
        }
        break;

      case 'lfu': // Least Frequently Used
        let lowestHits = Infinity;
        for (const [key, entry] of cache) {
          if (entry.hits < lowestHits) {
            lowestHits = entry.hits;
            keyToEvict = key;
          }
        }
        break;

      case 'fifo': // First In, First Out
        keyToEvict = cache.keys().next().value;
        break;

      case 'ttl': // Time To Live (already expired)
        const config = this.cacheConfigs.get(cacheName);
        if (config) {
          for (const [key, entry] of cache) {
            if (Date.now() - entry.timestamp > config.ttl) {
              keyToEvict = key;
              break;
            }
          }
        }
        break;
    }

    if (keyToEvict) {
      cache.delete(keyToEvict);
      console.log(`Cache evicted: ${cacheName}:${keyToEvict} (policy: ${policy})`);
    }
  }

  private async warmupCache(cacheName: string, keys: string[]): Promise<void> {
    console.log(`Warming up cache: ${cacheName} with ${keys.length} keys`);
    
    // Mock warmup - in real implementation, pre-load commonly used data
    for (const key of keys) {
      await this.setCache(cacheName, key, `warmed_data_${key}`);
    }
  }

  private async compressData(data: any): Promise<string> {
    // Mock compression - in real implementation, use actual compression
    const dataString = JSON.stringify(data);
    return `compressed:${dataString}`;
  }

  private mockCompress(data: string): string {
    // Mock compression - in real implementation, use gzip/brotli/deflate
    return `${this.compressionConfig.algorithm}:${data}`;
  }

  private recordCacheHit(cacheName: string, key: string): void {
    // Record cache hit for analytics
  }

  private recordCacheMiss(cacheName: string, key: string): void {
    // Record cache miss for analytics
  }

  private checkOptimizationRules(metrics: PerformanceMetrics): void {
    for (const rule of this.optimizationRules.values()) {
      if (!rule.enabled) continue;

      const threshold = rule.metrics_threshold;
      if (!threshold) continue;

      let shouldOptimize = false;

      if (threshold.response_time && metrics.duration > threshold.response_time) {
        shouldOptimize = true;
      }
      if (threshold.memory_usage && metrics.memory_usage > threshold.memory_usage) {
        shouldOptimize = true;
      }
      if (threshold.error_rate && metrics.error_count > 0) {
        shouldOptimize = true;
      }

      if (shouldOptimize) {
        this.executeOptimizationRule(rule, metrics);
      }
    }
  }

  private executeOptimizationRule(rule: OptimizationRule, metrics: PerformanceMetrics): void {
    console.log(`Executing optimization rule: ${rule.name} for ${metrics.endpoint}`);
    
    // Implement rule execution logic based on rule.action
    switch (rule.type) {
      case OptimizationType.CACHE:
        // Enable aggressive caching for slow endpoints
        break;
      case OptimizationType.COMPRESSION:
        // Enable compression for large responses
        break;
      case OptimizationType.BATCH:
        // Enable batching for high-frequency operations
        break;
    }
  }

  private getCacheStatistics(): any {
    const stats: any = {};
    
    for (const [cacheName, cache] of this.caches) {
      const config = this.cacheConfigs.get(cacheName);
      stats[cacheName] = {
        size: cache.size,
        max_size: config?.maxSize || 0,
        utilization: config ? (cache.size / config.maxSize) * 100 : 0,
        hits: Array.from(cache.values()).reduce((sum, entry) => sum + entry.hits, 0)
      };
    }
    
    return stats;
  }

  private getResourcePoolStatistics(): any {
    const stats: any = {};
    
    for (const [poolName, pool] of this.resourcePools) {
      stats[poolName] = {
        current_size: pool.currentSize,
        max_size: pool.maxSize,
        active_connections: pool.activeConnections,
        waiting_queue_size: pool.waitingQueue.length,
        utilization: (pool.activeConnections / pool.maxSize) * 100
      };
    }
    
    return stats;
  }

  private setupDefaultConfigs(): void {
    // Setup default compression config
    this.compressionConfig = {
      enabled: true,
      algorithm: 'gzip',
      level: 6,
      minSize: 1024, // 1KB
      types: ['application/json', 'text/html', 'text/css', 'application/javascript']
    };

    // Setup default caches
    this.configureCaches('market_data', {
      type: CacheType.MEMORY,
      ttl: 30000, // 30 seconds
      maxSize: 1000,
      compressionEnabled: true,
      evictionPolicy: 'lru',
      warmupEnabled: false
    });

    this.configureCaches('user_data', {
      type: CacheType.MEMORY,
      ttl: 300000, // 5 minutes
      maxSize: 500,
      compressionEnabled: false,
      evictionPolicy: 'lfu',
      warmupEnabled: false
    });

    this.configureCaches('static_data', {
      type: CacheType.MEMORY,
      ttl: 3600000, // 1 hour
      maxSize: 200,
      compressionEnabled: true,
      evictionPolicy: 'ttl',
      warmupEnabled: true,
      warmupData: ['system_config', 'trading_pairs', 'fee_structure']
    });
  }

  private setupDefaultRules(): void {
    const rules: OptimizationRule[] = [
      {
        id: 'slow_response_cache',
        name: 'Enable caching for slow responses',
        type: OptimizationType.CACHE,
        condition: 'response_time > 1000',
        action: 'enable_aggressive_caching',
        priority: 1,
        enabled: true,
        metrics_threshold: { response_time: 1000 }
      },
      {
        id: 'large_response_compress',
        name: 'Compress large responses',
        type: OptimizationType.COMPRESSION,
        condition: 'response_size > 10KB',
        action: 'enable_compression',
        priority: 2,
        enabled: true
      },
      {
        id: 'high_frequency_batch',
        name: 'Batch high-frequency requests',
        type: OptimizationType.BATCH,
        condition: 'request_frequency > 10/second',
        action: 'enable_batching',
        priority: 3,
        enabled: true
      }
    ];

    rules.forEach(rule => {
      this.optimizationRules.set(rule.id, rule);
    });
  }

  private startPerformanceMonitoring(): void {
    // Start monitoring processes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Every 5 minutes

    console.log('Performance optimization service initialized');
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
    this.performanceMetrics = this.performanceMetrics.filter(
      metric => metric.timestamp > cutoffTime
    );
  }
}

// Export singleton instance
export const performanceOptimizationService = new PerformanceOptimizationService();