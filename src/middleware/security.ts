/**
 * Security Headers Middleware for Hono
 * 
 * Implements OWASP security best practices:
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME-sniffing attacks
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Restricts browser feature access
 * - X-XSS-Protection: Legacy XSS filter (defense-in-depth)
 */

import { Context, Next } from 'hono';

export async function securityHeaders(c: Context, next: Next) {
  // Prevent clickjacking: Deny embedding in frames/iframes
  c.header('X-Frame-Options', 'DENY');
  
  // Prevent MIME-sniffing: Force declared content-type
  c.header('X-Content-Type-Options', 'nosniff');
  
  // Control referrer leakage: Don't send referrer to other origins
  c.header('Referrer-Policy', 'no-referrer');
  
  // Restrict browser features: Disable dangerous APIs
  c.header(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Legacy XSS protection (defense-in-depth for older browsers)
  c.header('X-XSS-Protection', '1; mode=block');
  
  // Proceed to next middleware/handler
  await next();
}

/**
 * Strict Transport Security (HSTS) Middleware
 * 
 * WARNING: Only enable this in production with valid SSL certificate!
 * Once enabled, browsers will ONLY connect via HTTPS for the specified duration.
 * 
 * @param maxAge - Duration in seconds (default: 1 year)
 * @param includeSubDomains - Apply to all subdomains
 * @param preload - Allow browser HSTS preload list inclusion
 */
export function hstsHeaders(
  maxAge: number = 31536000, // 1 year
  includeSubDomains: boolean = true,
  preload: boolean = false
) {
  return async (c: Context, next: Next) => {
    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    if (preload) {
      hstsValue += '; preload';
    }
    
    c.header('Strict-Transport-Security', hstsValue);
    await next();
  };
}

/**
 * Content Security Policy (CSP) Middleware
 * 
 * Note: This is a basic CSP. Adjust directives based on your app's needs.
 * Start with report-only mode to test before enforcing.
 * 
 * @param reportOnly - Use Content-Security-Policy-Report-Only header
 */
export function cspHeaders(reportOnly: boolean = false) {
  return async (c: Context, next: Next) => {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust as needed
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
    
    const headerName = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    
    c.header(headerName, csp);
    await next();
  };
}
