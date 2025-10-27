/**
 * Rate Limiting Middleware using rate-limiter-flexible + Redis
 * Protects API endpoints from abuse with per-user rate limits
 */

const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');

let rateLimiter;

/**
 * Initialize rate limiter with Redis or fallback to Memory
 * @param {object} redisClient - Redis client instance (optional)
 * @param {object} options - Rate limiter options
 * @returns {RateLimiterRedis|RateLimiterMemory}
 */
function initRateLimiter(redisClient, options = {}) {
  const defaultOptions = {
    points: 50,           // 50 requests
    duration: 60,         // per 60 seconds (1 minute)
    blockDuration: 0,     // do not block, just return 429
    keyPrefix: 'rl:api',  // Redis key prefix
  };

  const config = { ...defaultOptions, ...options };

  if (redisClient && redisClient.isOpen) {
    console.log('🔒 Rate limiter initialized with Redis backend');
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      ...config,
    });
  } else {
    console.warn('⚠️  Rate limiter using Memory backend (Redis not available)');
    rateLimiter = new RateLimiterMemory(config);
  }

  return rateLimiter;
}

/**
 * Rate limit middleware for Hono
 * Extracts user key from JWT userId, IP address, or forwarded IP
 * @returns {Function} Hono middleware function
 */
function rateLimitMiddleware() {
  return async (c, next) => {
    if (!rateLimiter) {
      console.error('❌ Rate limiter not initialized');
      return c.json({ 
        success: false, 
        error: 'Rate limiter configuration error' 
      }, 500);
    }

    try {
      // Extract unique key for rate limiting
      // Priority: userId (from auth) > X-Forwarded-For > Remote IP
      const userId = c.get('userId');
      const forwardedFor = c.req.header('x-forwarded-for');
      const remoteIp = c.req.raw?.socket?.remoteAddress || 'unknown';
      
      const key = userId || forwardedFor?.split(',')[0]?.trim() || remoteIp;

      // Consume 1 point for this request
      await rateLimiter.consume(key);

      // Request allowed - proceed
      return next();
    } catch (rateLimiterRes) {
      // Rate limit exceeded
      const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
      
      return c.json({
        success: false,
        error: 'Too Many Requests',
        retryAfter,
      }, 429, {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rateLimiter.points),
        'X-RateLimit-Remaining': String(rateLimiterRes.remainingPoints),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfter),
      });
    }
  };
}

module.exports = {
  initRateLimiter,
  rateLimitMiddleware,
};
