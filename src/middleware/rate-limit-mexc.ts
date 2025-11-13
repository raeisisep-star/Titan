/**
 * Rate Limiting for MEXC API Endpoints
 * Task-8: Protect sensitive MEXC endpoints from abuse
 */

import { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter (use Redis for production)
 */
class MemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  
  /**
   * Check if request is allowed
   */
  check(key: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);
    
    // No entry or expired window
    if (!entry || now > entry.resetTime) {
      const resetTime = now + config.windowMs;
      this.store.set(key, { count: 1, resetTime });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime
      };
    }
    
    // Within window
    if (entry.count < config.maxRequests) {
      entry.count++;
      this.store.set(key, entry);
      
      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
      };
    }
    
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clear expired entries (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimiter = new MemoryRateLimiter();

// Run cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Rate limit configurations for different MEXC endpoints
 */
export const MEXC_RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Order placement: 10 requests per minute
  'order_create': {
    windowMs: 60 * 1000,
    maxRequests: 10
  },
  
  // Order cancellation: 20 requests per minute
  'order_cancel': {
    windowMs: 60 * 1000,
    maxRequests: 20
  },
  
  // Balance check: 30 requests per minute
  'balance': {
    windowMs: 60 * 1000,
    maxRequests: 30
  },
  
  // Open orders: 20 requests per minute
  'open_orders': {
    windowMs: 60 * 1000,
    maxRequests: 20
  },
  
  // Price/ticker: 60 requests per minute
  'ticker': {
    windowMs: 60 * 1000,
    maxRequests: 60
  },
  
  // Default: 30 requests per minute
  'default': {
    windowMs: 60 * 1000,
    maxRequests: 30
  }
};

/**
 * Create rate limiting middleware for MEXC endpoints
 */
export function mexcRateLimitMiddleware(limitType: keyof typeof MEXC_RATE_LIMITS = 'default') {
  return async (c: Context, next: Next) => {
    const config = MEXC_RATE_LIMITS[limitType];
    
    // Generate rate limit key (user-based or IP-based)
    const userId = c.get('userId');
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `mexc:${limitType}:${userId || ip}`;
    
    // Check rate limit
    const result = rateLimiter.check(key, config);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      c.header('Retry-After', retryAfter.toString());
      
      return c.json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests to MEXC ${limitType} endpoint. Please try again in ${retryAfter} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after_seconds: retryAfter
      }, 429);
    }
    
    return next();
  };
}

/**
 * Reset rate limit for a user (admin function)
 */
export function resetRateLimit(userId: number | string, limitType: string): void {
  const key = `mexc:${limitType}:${userId}`;
  rateLimiter.reset(key);
}
