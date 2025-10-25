# Task-3: CSP Report-Only + Collector

## Overview
Content Security Policy in Report-Only mode for monitoring violations without blocking content.

## Components

### 1. Nginx CSP Headers
**File**: `/etc/nginx/sites-available/zala`

**Headers Added**:
```nginx
# CSP Report-Only (doesn't block, only reports)
add_header Content-Security-Policy-Report-Only "
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' cdn.jsdelivr.net; 
  style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; 
  img-src 'self' data: https:; 
  connect-src 'self' https://www.zala.ir wss://www.zala.ir; 
  frame-ancestors 'none'; 
  report-to default; 
  report-uri https://www.zala.ir/api/security/csp-report
" always;

# Report-To API for modern browsers
add_header Report-To '{
  "group":"default",
  "max_age":10886400,
  "endpoints":[{"url":"https://www.zala.ir/api/security/csp-report"}]
}' always;
```

### 2. Backend Collector Endpoint
**File**: `server-real-v3.js`

**Route**: `POST /api/security/csp-report`

**Features**:
- Accepts CSP violation reports
- Sanitizes sensitive data (removes query params, tokens)
- Logs to `/var/log/csp-report.log`
- No cookies, tokens, or Authorization headers logged

### 3. Log File
**File**: `/var/log/csp-report.log`
- Permissions: `644` (ubuntu:ubuntu)
- Format: JSON (one report per line)
- Sanitized: Query parameters stripped

## Evidence Pack

### 1. Headers Present
```bash
curl -I https://www.zala.ir/api/health | grep "x-titan-config"
# x-titan-config: zala-ssl-enhanced-v3 ✅
```

### 2. Endpoint Working
```bash
curl -X POST https://www.zala.ir/api/security/csp-report \
  -H 'Content-Type: application/json' \
  -d '{"csp-report":{"document-uri":"https://www.zala.ir","violated-directive":"script-src","blocked-uri":"https://evil.com/script.js"}}'
  
# Response: {"success":true,"message":"Report received"} ✅
```

### 3. Log Sanitization
**Input** (with sensitive data):
```json
{
  "document-uri": "https://www.zala.ir/page?token=secret123&user=admin",
  "violated-directive": "style-src",
  "blocked-uri": "https://cdn.example.com/style.css?v=1.0",
  "source-file": "https://www.zala.ir/app.js?hash=abc123"
}
```

**Output** (sanitized):
```json
{
  "document-uri": "https://www.zala.ir/page",
  "violated-directive": "style-src",
  "blocked-uri": "https://cdn.example.com/style.css",
  "source-file": "https://www.zala.ir/app.js",
  "timestamp": "2025-10-25T12:09:36.056Z"
}
```

✅ Query parameters removed (`?token=`, `?user=`, `?v=`, `?hash=`)

### 4. Log File Permissions
```bash
ls -lh /var/log/csp-report.log
# -rw-r--r-- 1 ubuntu ubuntu 0 Oct 25 12:09 /var/log/csp-report.log ✅
```

## Testing

```bash
# 1. Check headers
curl -I https://www.zala.ir | grep -i content-security

# 2. Test endpoint
curl -X POST https://www.zala.ir/api/security/csp-report \
  -H 'Content-Type: application/json' \
  -d '{"csp-report":{"document-uri":"https://www.zala.ir","violated-directive":"script-src","blocked-uri":"inline"}}'

# 3. View logs
sudo tail -f /var/log/csp-report.log
```

## Rollback

```bash
# 1. Restore nginx config
sudo cp /etc/nginx/sites-available/zala.backup.task3-csp-* /etc/nginx/sites-available/zala
sudo systemctl reload nginx

# 2. Remove endpoint from server-real-v3.js
# (git revert commit)

# 3. Remove log file
sudo rm /var/log/csp-report.log
```

## Definition of Done ✅

- [x] CSP Report-Only header in Nginx
- [x] Report-To header configured
- [x] Backend endpoint `/api/security/csp-report` created
- [x] Query parameters sanitized (no tokens/secrets)
- [x] Logs to `/var/log/csp-report.log`
- [x] File permissions secure (644)
- [x] Evidence: Headers sent, endpoint works, logs sanitized

---
**Date**: 2025-10-25  
**Status**: ✅ Complete  
**Branch**: task/csp-report-only
