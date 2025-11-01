# Security Headers Integration Guide

This guide explains how to integrate the security headers middleware into your Hono application.

## Quick Start

### Option 1: Apply to All Routes (Recommended)

```typescript
import { Hono } from 'hono';
import { securityHeaders } from './middleware/security';

const app = new Hono();

// Apply security headers to all routes
app.use('*', securityHeaders);

// Your routes...
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

### Option 2: Apply to Specific Routes

```typescript
import { Hono } from 'hono';
import { securityHeaders } from './middleware/security';

const app = new Hono();

// Apply only to API routes
app.use('/api/*', securityHeaders);

export default app;
```

### Option 3: Full Security Stack (Production)

```typescript
import { Hono } from 'hono';
import { securityHeaders, hstsHeaders, cspHeaders } from './middleware/security';

const app = new Hono();

// 1. Basic security headers (always enable)
app.use('*', securityHeaders);

// 2. HSTS (HTTPS enforcement) - ONLY IN PRODUCTION WITH SSL!
if (process.env.NODE_ENV === 'production') {
  app.use('*', hstsHeaders(
    31536000,  // 1 year
    true,      // includeSubDomains
    false      // preload (set true after testing)
  ));
}

// 3. Content Security Policy (start in report-only mode)
app.use('*', cspHeaders(true)); // reportOnly = true

export default app;
```

## Security Headers Explained

### X-Frame-Options: DENY
- **Protects Against**: Clickjacking attacks
- **Effect**: Prevents your site from being embedded in `<iframe>` or `<frame>`
- **Value**: `DENY` (strictest), `SAMEORIGIN` (allow same-origin iframes)

### X-Content-Type-Options: nosniff
- **Protects Against**: MIME-sniffing attacks
- **Effect**: Forces browsers to respect declared `Content-Type`
- **Example**: Prevents browser from executing `text/html` as JavaScript

### Referrer-Policy: no-referrer
- **Protects Against**: Information leakage
- **Effect**: Doesn't send `Referer` header to external sites
- **Privacy**: Prevents tracking via referrer URLs

### Permissions-Policy
- **Protects Against**: Unauthorized browser feature access
- **Effect**: Disables dangerous APIs (camera, microphone, geolocation, payment, USB, etc.)
- **Granular**: Can enable specific features for specific origins if needed

### X-XSS-Protection: 1; mode=block
- **Protects Against**: Cross-Site Scripting (legacy)
- **Effect**: Enables browser's XSS filter
- **Note**: Modern browsers use CSP instead, but this provides defense-in-depth

### Strict-Transport-Security (HSTS)
- **Protects Against**: SSL stripping attacks, protocol downgrade
- **Effect**: Forces HTTPS-only connections for specified duration
- **⚠️ WARNING**: Only enable with valid SSL certificate! Cannot be easily undone.

### Content-Security-Policy (CSP)
- **Protects Against**: XSS, data injection, unauthorized resource loading
- **Effect**: Whitelist-based resource loading policy
- **Recommendation**: Start with `report-only` mode, monitor violations, then enforce

## Testing Security Headers

### Using curl:
```bash
curl -I https://www.zala.ir | grep -i "x-frame\|x-content\|referrer\|permissions"
```

### Using Security Headers scanner:
```bash
# Install
npm install -g observatory-cli

# Scan
observatory www.zala.ir
```

### Using Mozilla Observatory:
Visit: https://observatory.mozilla.org/

## Nginx Alternative

If you have Nginx reverse proxy, you can set headers there instead:

```nginx
# /etc/nginx/sites-available/titan

server {
    listen 443 ssl http2;
    server_name www.zala.ir;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # HSTS (uncomment after SSL is confirmed working)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Verification Checklist

After deploying:

- [ ] Check headers: `curl -I https://www.zala.ir`
- [ ] Verify X-Frame-Options prevents iframe embedding
- [ ] Test CSP doesn't block legitimate resources
- [ ] Confirm HSTS only enabled in production with SSL
- [ ] Scan with Mozilla Observatory (target A+ rating)
- [ ] Review browser console for CSP violations

## Security Rating Goals

| Header | Status | Priority |
|--------|--------|----------|
| X-Frame-Options | ✅ Implemented | High |
| X-Content-Type-Options | ✅ Implemented | High |
| Referrer-Policy | ✅ Implemented | High |
| Permissions-Policy | ✅ Implemented | Medium |
| X-XSS-Protection | ✅ Implemented | Low (legacy) |
| Strict-Transport-Security | ⚠️ Production only | High |
| Content-Security-Policy | ⚠️ Report-only first | High |

## Related

- OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
- MDN Security Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security
- Mozilla Observatory: https://observatory.mozilla.org/
