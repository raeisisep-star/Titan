// services/rateLimit/drivers/memory.js
class MemoryDriver {
  constructor({ defaultPolicy } = {}) {
    this.name = 'memory';
    this.buckets = new Map(); // key → { tokens, resetAt, blockedUntil }
    this.defaultPolicy = defaultPolicy || { points: 60, duration: 60, blockMs: 0 };
  }
  
  async init() {}

  _now() { 
    return Date.now(); 
  }

  _getBucket(key, policy) {
    const now = this._now();
    let b = this.buckets.get(key);
    if (!b || now >= b.resetAt) {
      b = { 
        tokens: policy.points, 
        resetAt: now + policy.duration * 1000, 
        blockedUntil: 0 
      };
      this.buckets.set(key, b);
    }
    return b;
  }

  async consume(key, policy = this.defaultPolicy) {
    const now = this._now();
    const p = { ...this.defaultPolicy, ...policy };
    const b = this._getBucket(key, p);

    if (b.blockedUntil && now < b.blockedUntil) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetMs: b.resetAt - now, 
        retryAfterMs: b.blockedUntil - now 
      };
    }

    if (b.tokens > 0) {
      b.tokens -= 1;
      return { 
        allowed: true, 
        remaining: b.tokens, 
        resetMs: b.resetAt - now, 
        retryAfterMs: 0 
      };
    }

    if (p.blockMs && p.blockMs > 0) {
      b.blockedUntil = now + p.blockMs;
    }
    
    return { 
      allowed: false, 
      remaining: 0, 
      resetMs: b.resetAt - now, 
      retryAfterMs: b.blockedUntil ? (b.blockedUntil - now) : (b.resetAt - now) 
    };
  }

  async reset(key) { 
    this.buckets.delete(key); 
  }

  async status(key) {
    const b = this.buckets.get(key);
    if (!b) return { exists: false };
    const now = this._now();
    return { 
      exists: true, 
      remaining: b.tokens, 
      resetMs: Math.max(0, b.resetAt - now), 
      blockedMs: Math.max(0, (b.blockedUntil || 0) - now) 
    };
  }
}

module.exports = MemoryDriver;
