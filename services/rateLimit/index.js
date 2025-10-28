// services/rateLimit/index.js
const MemoryDriver = require('./drivers/memory');
const RedisDriver = require('./drivers/redis');

class RateLimitService {
  /**
   * @param {'redis'|'memory'} backend
   * @param {object} [opts]
   * opts.redisUrl
   * opts.defaultPolicy = { points, duration, blockMs }
   */
  constructor(backend = 'memory', opts = {}) {
    this.backendName = backend;
    this.opts = opts;
    this.driver = null;
  }

  async init() {
    if (this.backendName === 'redis') {
      try {
        this.driver = new RedisDriver({
          url: this.opts.redisUrl || process.env.REDIS_URL,
          defaultPolicy: this.opts.defaultPolicy,
        });
        await this.driver.init();
        return;
      } catch (e) {
        console.error('[RateLimitService] Redis init failed → fallback to Memory:', e?.message || e);
      }
    }
    // fallback
    this.driver = new MemoryDriver({ defaultPolicy: this.opts.defaultPolicy });
    await this.driver.init?.();
  }

  /**
   * مصرف توکن‌های ریت‌لیمیت
   * @param {string} key
   * @param {object} policy {points, duration, blockMs}
   * @returns {Promise<{allowed:boolean, remaining:number, resetMs:number, retryAfterMs:number}>}
   */
  async consume(key, policy) {
    if (!this.driver) throw new Error('RateLimitService not initialized');
    return this.driver.consume(key, policy);
  }

  async reset(key) {
    if (!this.driver) return;
    return this.driver.reset(key);
  }

  async status(key) {
    if (!this.driver) return { exists: false };
    return this.driver.status(key);
  }

  backend() {
    return this.driver?.name || 'memory';
  }
}

module.exports = RateLimitService;
