// middleware/rateLimitV2.js
const RateLimitService = require('../services/rateLimit');
const { policies, detectPolicy, makeKey } = require('../config/rateLimit');

let service;

/** باید در boot سرور یک بار صدا بخورد */
async function initRateLimiterV2() {
  const backend = (process.env.RATE_LIMIT_BACKEND || 'memory').toLowerCase();
  service = new RateLimitService(backend, {
    redisUrl: process.env.REDIS_URL,
    defaultPolicy: policies.public,
  });
  await service.init();
  console.log(`[RateLimitV2] initialized with backend="${service.backend()}"`);
}

/** استفاده به‌عنوان middleware عمومی */
async function rateLimitMiddlewareV2(req, res, next) {
  try {
    const policyName = detectPolicy(req);
    const policy = policies[policyName] || policies.public;
    const key = makeKey(req);

    const burst = policies.burst || { points: 10, duration: 5 };
    
    // ابتدا burst (نرم)، بعد policy اصلی
    const r1 = await service.consume(`${key}:burst`, burst);
    if (!r1.allowed) {
      res.set('Retry-After', Math.ceil((r1.retryAfterMs || r1.resetMs || 1000) / 1000));
      return res.status(429).json({ 
        ok: false, 
        error: 'Too Many Requests (burst)', 
        retryAfterMs: r1.retryAfterMs || r1.resetMs 
      });
    }

    const r2 = await service.consume(`${key}:${policyName}`, policy);
    res.set('X-RateLimit-Remaining', String(r2.remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil((r2.resetMs || 0) / 1000)));
    res.set('X-RateLimit-Backend', service.backend());

    if (!r2.allowed) {
      res.set('Retry-After', Math.ceil((r2.retryAfterMs || r2.resetMs || 1000) / 1000));
      return res.status(429).json({ 
        ok: false, 
        error: 'Too Many Requests', 
        retryAfterMs: r2.retryAfterMs || r2.resetMs 
      });
    }

    return next();
  } catch (e) {
    console.error('[RateLimitV2] error:', e);
    // در خطا، عبور می‌دهیم تا در دسترس‌پذیری لطمه نزند (سخت‌گیرانه نکنیم)
    return next();
  }
}

module.exports = { initRateLimiterV2, rateLimitMiddlewareV2, getService: () => service };
