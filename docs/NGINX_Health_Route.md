# 🩺 NGINX Health Route Configuration

**Purpose**: Configure Nginx to proxy `/health` endpoint to backend for JSON health checks  
**Problem**: Currently `/health` returns HTML (frontend) instead of JSON (backend API)  
**Impact**: Monitoring systems, load balancers, and health checks cannot parse HTML responses

---

## Table of Contents

1. [Current Problem](#current-problem)
2. [Solution Overview](#solution-overview)
3. [Nginx Configuration](#nginx-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedure](#rollback-procedure)

---

## Current Problem

### Symptoms

```bash
# Backend (correct) - returns JSON
curl http://localhost:5000/health
# {"status":"healthy","database":"connected","redis":"connected","timestamp":"..."}

# Public URL (incorrect) - returns HTML
curl https://www.zala.ir/health
# <!DOCTYPE html><html lang="fa" dir="rtl">...
```

### Root Cause

Nginx configuration prioritizes static file serving over backend proxy:
- Frontend build contains a static `/health.html` or similar
- Nginx `try_files` directive serves static files first
- Backend `/health` endpoint never receives the request

### Impact

- ❌ Load balancers cannot perform health checks
- ❌ Monitoring systems (PM2, Supervisor) cannot validate service
- ❌ CI/CD pipelines cannot verify deployment health
- ❌ External monitoring tools (UptimeRobot, etc.) fail to parse response

---

## Solution Overview

**Strategy**: Add explicit `location /health` block BEFORE the main `location /` block in Nginx config.

**Priority Order**:
1. `/health` → proxy to backend:5000 (specific route - highest priority)
2. `/api/*` → proxy to backend:5000 (API routes)
3. `/` → try_files for static frontend (catch-all - lowest priority)

This ensures health checks always hit the backend API.

---

## Nginx Configuration

### Step 1: Locate Configuration File

Find your active Nginx config for zala.ir:

```bash
# Check which config is active
sudo nginx -T | grep -A 10 "server_name www.zala.ir"

# Common locations:
# - /etc/nginx/sites-available/zala.ir
# - /etc/nginx/sites-enabled/zala.ir
# - /etc/nginx/conf.d/zala.ir.conf
```

### Step 2: Backup Current Configuration

```bash
sudo cp /etc/nginx/sites-available/zala.ir /etc/nginx/sites-available/zala.ir.backup-$(date +%Y%m%d-%H%M%S)
```

### Step 3: Add Health Check Block

Edit the configuration file and add this block **BEFORE** the main `location /` block:

```nginx
server {
    listen 443 ssl http2;
    server_name www.zala.ir zala.ir;

    # ... (existing SSL configuration) ...

    # =================================================================
    # HEALTH CHECK - Must be BEFORE location / block
    # =================================================================
    location /health {
        # Proxy to backend service
        proxy_pass http://127.0.0.1:5000/health;
        
        # Essential headers
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Force JSON response
        proxy_set_header Accept application/json;
        
        # Disable buffering for immediate response
        proxy_buffering off;
        
        # Short timeouts for quick failure detection
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
        
        # Disable caching for health checks
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        
        # Add health check identifier header
        add_header X-Health-Check-Source "nginx-proxy" always;
    }

    # =================================================================
    # API ROUTES - Proxy to backend
    # =================================================================
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        # ... (existing API proxy configuration) ...
    }

    # =================================================================
    # STATIC FRONTEND - Serve files
    # =================================================================
    location / {
        try_files $uri $uri/ /index.html;
        # ... (existing frontend configuration) ...
    }
}
```

### Step 4: Validate Configuration

```bash
# Test Nginx configuration syntax
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 5: Apply Changes

```bash
# Reload Nginx without dropping connections
sudo systemctl reload nginx

# Or restart if reload fails
sudo systemctl restart nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

## Deployment Steps

### Pre-Deployment Checklist

- [ ] Backup current Nginx configuration
- [ ] Verify backend is running (`pm2 status`)
- [ ] Test backend health endpoint (`curl http://localhost:5000/health`)
- [ ] Schedule deployment during low-traffic period
- [ ] Notify team of configuration change

### Deployment Procedure

```bash
# 1. Backup configuration
sudo cp /etc/nginx/sites-available/zala.ir /etc/nginx/sites-available/zala.ir.backup-$(date +%Y%m%d-%H%M%S)

# 2. Edit configuration (use nano/vim)
sudo nano /etc/nginx/sites-available/zala.ir
# (Add the /health location block as shown above)

# 3. Validate syntax
sudo nginx -t

# 4. If validation passes, reload
sudo systemctl reload nginx

# 5. Verify immediately (within 10 seconds)
curl -i https://www.zala.ir/health

# 6. Check for JSON response
curl -s https://www.zala.ir/health | jq .
```

### Expected Timeline

- Configuration edit: **2 minutes**
- Syntax validation: **5 seconds**
- Nginx reload: **1 second** (zero downtime)
- Verification: **30 seconds**

**Total downtime**: **0 seconds** (reload doesn't drop connections)

---

## Testing & Verification

### Test 1: Local Backend (Baseline)

```bash
curl -i http://localhost:5000/health

# Expected:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"status":"healthy","database":"connected",...}
```

### Test 2: Public URL (After Fix)

```bash
curl -i https://www.zala.ir/health

# Expected:
# HTTP/2 200
# Content-Type: application/json
# x-health-check-source: nginx-proxy
# {"status":"healthy","database":"connected",...}
```

### Test 3: JSON Parsing

```bash
# Should work without errors
curl -s https://www.zala.ir/health | jq .

# Extract specific fields
curl -s https://www.zala.ir/health | jq '.status, .database, .redis'
```

### Test 4: Response Time

```bash
# Should respond within 100ms
time curl -s https://www.zala.ir/health > /dev/null

# Or use curl's built-in timing
curl -w "@-" -o /dev/null -s https://www.zala.ir/health <<'EOF'
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_total:       %{time_total}s\n
EOF
```

### Test 5: Under Load

```bash
# Send 100 requests
for i in {1..100}; do
  curl -s https://www.zala.ir/health | jq -r '.status'
done | sort | uniq -c

# Expected: All 100 requests return "healthy"
```

### Test 6: Backend Down Scenario

```bash
# Stop backend temporarily
pm2 stop titan-backend

# Test health endpoint (should return 502 Bad Gateway)
curl -i https://www.zala.ir/health

# Restart backend
pm2 start titan-backend

# Verify health restored
curl -s https://www.zala.ir/health | jq .
```

---

## Troubleshooting

### Issue 1: Still Returns HTML

**Symptom**: `curl https://www.zala.ir/health` returns HTML

**Causes & Solutions**:

1. **Location block order wrong**
   ```bash
   # Check order in config
   sudo nginx -T | grep -A 5 "location /health"
   
   # Solution: Move /health block ABOVE location /
   sudo nano /etc/nginx/sites-available/zala.ir
   sudo systemctl reload nginx
   ```

2. **Nginx didn't reload**
   ```bash
   # Check if reload happened
   sudo journalctl -u nginx -n 20
   
   # Force restart
   sudo systemctl restart nginx
   ```

3. **Cloudflare caching HTML response**
   ```bash
   # Purge Cloudflare cache for /health
   # Go to Cloudflare Dashboard → Caching → Purge Everything
   # Or use CF API to purge specific URL
   
   # Test with CF bypass
   curl -H "Cache-Control: no-cache" https://www.zala.ir/health
   ```

### Issue 2: 502 Bad Gateway

**Symptom**: `curl https://www.zala.ir/health` returns 502

**Causes & Solutions**:

1. **Backend not running**
   ```bash
   pm2 status
   # If stopped: pm2 start titan-backend
   ```

2. **Wrong port in proxy_pass**
   ```bash
   # Check backend port
   sudo netstat -tlnp | grep 5000
   
   # Verify proxy_pass URL
   sudo nginx -T | grep "proxy_pass.*5000"
   ```

3. **Firewall blocking localhost**
   ```bash
   # Unlikely but check
   sudo iptables -L -n | grep 5000
   ```

### Issue 3: Timeout

**Symptom**: Request hangs for 30+ seconds

**Causes & Solutions**:

1. **Backend deadlock**
   ```bash
   # Check backend logs
   pm2 logs titan-backend --lines 50
   
   # Restart if needed
   pm2 reload titan-backend
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   psql -h localhost -U titan_user -d titan_prod -c "SELECT 1;"
   
   # Check Redis
   redis-cli ping
   ```

### Issue 4: Missing Headers

**Symptom**: Response doesn't include `X-Health-Check-Source: nginx-proxy`

**Solution**:
```bash
# Ensure 'always' flag is set in config
sudo grep -A 1 "X-Health-Check-Source" /etc/nginx/sites-available/zala.ir

# Should be: add_header X-Health-Check-Source "nginx-proxy" always;
# Without 'always', header only added on 200 responses
```

---

## Rollback Procedure

### Quick Rollback (if health checks fail)

```bash
# 1. Restore backup (replace TIMESTAMP)
sudo cp /etc/nginx/sites-available/zala.ir.backup-TIMESTAMP /etc/nginx/sites-available/zala.ir

# 2. Test configuration
sudo nginx -t

# 3. Reload
sudo systemctl reload nginx

# 4. Verify old behavior restored
curl -I https://www.zala.ir/health
```

### Manual Rollback (remove /health block)

```bash
# 1. Edit config
sudo nano /etc/nginx/sites-available/zala.ir

# 2. Remove entire "location /health { ... }" block

# 3. Reload
sudo nginx -t && sudo systemctl reload nginx
```

### Rollback Timeline

- **Total time**: 30 seconds
- **Downtime**: 0 seconds (reload is graceful)

---

## Best Practices

### 1. Monitoring Integration

After fixing the health route, integrate with monitoring tools:

```bash
# PM2 health check (add to ecosystem.config.js)
healthCheckUrl: 'https://www.zala.ir/health'
healthCheckInterval: 30000  # 30 seconds

# External monitoring (UptimeRobot, Pingdom, etc.)
URL: https://www.zala.ir/health
Method: GET
Expected keyword: "healthy"
Check interval: 1 minute
```

### 2. Nginx Configuration Management

- **Version control**: Commit Nginx configs to git repo (remove sensitive data)
- **Automated testing**: Add Nginx config validation to CI/CD
- **Change tracking**: Document all Nginx changes in changelog

### 3. Health Endpoint Evolution

Consider enhancing backend `/health` endpoint with:

```typescript
// More detailed health response
{
  status: "healthy",
  timestamp: "2025-11-02T10:00:00Z",
  version: "1.0.0",
  services: {
    database: { status: "connected", latency_ms: 3 },
    redis: { status: "connected", latency_ms: 1 },
    mexc: { status: "connected", latency_ms: 45 }
  },
  system: {
    uptime_seconds: 3600,
    memory_usage_mb: 256,
    cpu_usage_percent: 15
  }
}
```

### 4. Security Considerations

- **Rate limiting**: Apply Nginx rate limiting to `/health` (max 100 req/min)
- **Access control**: Restrict `/health` to trusted IPs if needed
- **DDoS protection**: Use Cloudflare rate limiting for public health endpoint

---

## Related Documentation

- [RUNBOOK_Secrets_Local.md](./RUNBOOK_Secrets_Local.md) - Secrets management
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) - General rollback strategies
- [MONITORING_AND_SAFETY.md](./MONITORING_AND_SAFETY.md) - Monitoring setup

---

## Appendix: Complete Nginx Server Block Example

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.zala.ir zala.ir;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/zala.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zala.ir/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/zala.ir.access.log;
    error_log /var/log/nginx/zala.ir.error.log;

    # Root directory
    root /home/ubuntu/Titan-frontend/dist;
    index index.html;

    # HEALTH CHECK - PRIORITY 1
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header X-Health-Check-Source "nginx-proxy" always;
    }

    # API ROUTES - PRIORITY 2
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    # STATIC FILES - PRIORITY 3
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name www.zala.ir zala.ir;
    return 301 https://www.zala.ir$request_uri;
}
```

---

**Last Updated**: 2025-11-02  
**Author**: TITAN DevOps Team  
**Version**: 1.0.0
