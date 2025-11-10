// Simple in-memory cache service with TTL
// Can be replaced with Redis in production for distributed caching

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    console.log('✅ Cache Service initialized');
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  set(key, value, ttl) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      console.log(`🗑️  Cache expired: ${key}`);
    }, ttl * 1000);

    this.timers.set(key, timer);
    console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.timers.delete(key);
      console.log(`🗑️  Cache expired (on get): ${key}`);
      return null;
    }

    console.log(`✨ Cache hit: ${key}`);
    return item.value;
  }

  /**
   * Delete a specific key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
    console.log(`🗑️  Cache deleted: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.cache.clear();
    console.log('🗑️  Cache cleared');
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Express middleware factory for caching responses
   * @param {number} ttl - Time to live in seconds
   * @returns {Function} Express middleware
   */
  middleware(ttl) {
    return (req, res, next) => {
      const key = `${req.method}:${req.originalUrl || req.url}`;
      const cached = this.get(key);

      if (cached) {
        console.log(`⚡ Serving from cache: ${key}`);
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (body) => {
        this.set(key, body, ttl);
        return originalJson(body);
      };

      next();
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
