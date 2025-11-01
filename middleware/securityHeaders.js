/**
 * Security Headers Middleware for Hono
 * Adds essential security headers to all responses
 */

const securityHeadersMiddleware = async (c, next) => {
  await next();
  
  // Remove X-Powered-By header (if any framework adds it)
  c.res.headers.delete('X-Powered-By');
  
  // Strict-Transport-Security (HSTS)
  // Force HTTPS for 1 year, include subdomains
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // X-Frame-Options
  // Prevent clickjacking attacks
  c.res.headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  // Prevent MIME sniffing
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  // Enable browser XSS protection (legacy, but doesn't hurt)
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  // Control referrer information
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy (formerly Feature-Policy)
  // Disable unnecessary browser features
  c.res.headers.set('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Content-Security-Policy (CSP)
  // Strict policy for API server (no inline scripts, only API responses)
  if (!c.req.url.includes('/api/security/csp-report')) {
    c.res.headers.set('Content-Security-Policy', 
      "default-src 'none'; " +
      "script-src 'none'; " +
      "style-src 'none'; " +
      "img-src 'none'; " +
      "font-src 'none'; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'none'; " +
      "form-action 'none'; " +
      "report-uri /api/security/csp-report"
    );
  }
};

/**
 * CORS Middleware with strict allowed origins
 * Only allow specific domains (production and staging)
 */
const strictCorsOrigins = [
  'https://www.zala.ir',
  'https://staging.zala.ir',
  'http://localhost:3000',      // Development
  'http://localhost:5173',      // Vite dev server
];

/**
 * Validate CORS origin
 */
function isAllowedOrigin(origin) {
  if (!origin) return false; // No origin = same-origin request, allow
  if (process.env.NODE_ENV === 'development') return true; // Allow all in dev
  return strictCorsOrigins.includes(origin);
}

/**
 * CORS middleware with dynamic origin validation
 */
const strictCorsMiddleware = async (c, next) => {
  const origin = c.req.header('Origin');
  
  if (origin && isAllowedOrigin(origin)) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.res.headers.set('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, Idempotency-Key, X-Request-ID');
    c.res.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Handle preflight OPTIONS requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
};

module.exports = {
  securityHeadersMiddleware,
  strictCorsMiddleware,
  isAllowedOrigin,
  strictCorsOrigins,
};
