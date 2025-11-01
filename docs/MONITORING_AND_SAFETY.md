# Monitoring and Safety Infrastructure

**Phase**: 5  
**Status**: ✅ Complete  
**Last Updated**: November 1, 2024

---

## Overview

Phase 5 implements comprehensive monitoring, alerting, and safety infrastructure for the Titan Trading System. This includes health checks, process monitoring, security hardening, log management, and external synthetic monitoring.

## Components

### A) Health Checks

**Script**: `scripts/health-checks.sh`  
**Purpose**: Comprehensive system health monitoring  
**Frequency**: Every 5 minutes (cron)

**Checks Performed**:
- ✅ Backend health (prod:5000 + staging:5001)
- ✅ Redis connectivity (PING test)
- ✅ PostgreSQL connectivity (both databases)
- ✅ Nginx stub_status metrics
- ✅ Disk space monitoring (warn >70%, critical >80%)

**Nginx Stub Status**:
- **Endpoint**: http://127.0.0.1:8080/nginx_status
- **Config**: `/etc/nginx/conf.d/stub_status.conf`
- **Access**: Localhost only
- **Metrics**: Active connections, requests, reading/writing state

**Usage**:
```bash
# Manual run
/home/ubuntu/Titan/scripts/health-checks.sh

# Check logs
tail -f /home/ubuntu/Titan/logs/health-checks.log
```

### B) Telegram Alerting

**Script**: `scripts/send_telegram.sh`  
**Purpose**: Centralized alert delivery system

**Configuration**:
Add to `.env` files (both production and staging):
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Usage**:
```bash
# Send test alert
./scripts/send_telegram.sh "🔔 Test alert message"

# Used by other scripts automatically
```

**Features**:
- Silent exit if not configured (no disruption)
- HTML parsing support for rich formatting
- Error-tolerant (never breaks monitoring flow)

### C) Rate Limiting

**Status**: ✅ Already Implemented

**Backend Rate Limiting** (Express/Hono):
- **Middleware**: `middleware/rateLimitV2.js`
- **Store**: Redis-backed with memory fallback
- **Policies**:
  - **Auth endpoints**: Strict limits (10 req/min per IP)
  - **API endpoints**: Standard limits (120 req/min per IP)
  - **Public endpoints**: Relaxed limits
  - **Burst protection**: Additional layer for traffic spikes

**Frontend Rate Limiting** (Nginx):
- **Auth endpoints**: 5 req/sec with burst=10
- **API endpoints**: 20 req/sec with burst=30
- **Connection limits**: Max 20 concurrent per IP
- **Status code**: 429 Too Many Requests

**Packages**:
- `express-rate-limit`: Core rate limiting
- `rate-limit-redis`: Redis storage adapter
- `ioredis`: Redis client
- `express-slow-down`: Gradual request slowdown

### D) Security Headers

**Middleware**: `middleware/securityHeaders.js`  
**Purpose**: Comprehensive HTTP security headers

**Headers Applied**:
- **HSTS**: Force HTTPS for 1 year with preload
- **X-Frame-Options**: DENY (prevent clickjacking)
- **X-Content-Type-Options**: nosniff (prevent MIME sniffing)
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Disable unnecessary features
- **CSP**: Strict policy for API-only responses

**CORS Configuration**:
- **Allowed Origins** (Production):
  - https://www.zala.ir
  - https://staging.zala.ir
- **Development Origins**:
  - http://localhost:3000
  - http://localhost:5173
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Credentials**: Enabled
- **Max-Age**: 24 hours

**Integration**:
```javascript
// Add to server-real-v3.js
const { securityHeadersMiddleware, strictCorsMiddleware } = require('./middleware/securityHeaders');

// Apply security headers
app.use('/*', securityHeadersMiddleware);

// Apply strict CORS
app.use('/*', strictCorsMiddleware);
```

### E) Log Rotation

**Configuration**: `/etc/logrotate.d/titan-app`

**Settings**:
- **Frequency**: Daily
- **Retention**: 14 days
- **Compression**: Enabled (delayed)
- **Method**: copytruncate (no service restart needed)
- **Ownership**: ubuntu:ubuntu (0644)

**Paths Managed**:
- `/home/ubuntu/Titan/logs/*.log`
- `/home/ubuntu/Titan-staging/logs/*.log`

**Testing**:
```bash
# Dry run (test mode)
sudo logrotate -d /etc/logrotate.d/titan-app

# Force rotation (manual)
sudo logrotate -f /etc/logrotate.d/titan-app
```

### F) PostgreSQL Monitoring

**Script**: `scripts/pg-weekly-report.sh`  
**Purpose**: Comprehensive database analytics  
**Frequency**: Weekly (Sunday 7:00 AM)

**Reports Generated**:
1. **Top 10 Slow Queries** (by mean execution time)
2. **Top 10 Most Called Queries**
3. **Table Sizes** (total, table, indexes breakdown)
4. **Index Usage Statistics** (scans, tuples, size)
5. **Unused Indexes** (candidates for removal)
6. **Database Size** (current total size)

**pg_stat_statements**:
- **Status**: Requires superuser privileges (not enabled)
- **Alternative**: Basic statistics still collected without extension
- **Future**: Enable if superuser access obtained

**Usage**:
```bash
# Manual run
/home/ubuntu/Titan/scripts/pg-weekly-report.sh

# View report
less /home/ubuntu/Titan/logs/pg-weekly-report.log

# Latest report
tail -100 /home/ubuntu/Titan/logs/pg-weekly-report.log
```

### G) PM2 Process Watchdog

**Script**: `scripts/pm2-watchdog.sh`  
**Purpose**: Automated process monitoring and recovery  
**Frequency**: Every 2 minutes

**Features**:
- **Down Detection**: Identifies offline processes
- **Auto-Restart**: Attempts automatic recovery
- **High Restart Warning**: Alerts if process restarts >10 times
- **Telegram Notifications**: Real-time alerts on issues
- **Recovery Confirmation**: Verifies successful restart

**Monitored Processes**:
- titan-backend (production, cluster mode, 2 instances)
- titan-backend-staging (staging, cluster mode, 2 instances)
- reconciler (production, fork mode)
- reconciler-staging (staging, fork mode)

**Usage**:
```bash
# Manual run
/home/ubuntu/Titan/scripts/pm2-watchdog.sh

# Check logs
tail -f /home/ubuntu/Titan/logs/pm2-watchdog.log
```

**Alert Scenarios**:
- ❌ Process down → Alert + Auto-restart
- 🔴 Restart failed → Critical alert
- ✅ Recovery success → Confirmation
- ⚠️ High restart count (>10) → Warning alert

### H) Nginx Rate Limiting

**Configuration**: `/etc/nginx/conf.d/ratelimit.conf`

**Zones Defined**:
```nginx
# API rate limiting: 120 requests per minute per IP
limit_req_zone $binary_remote_addr zone=api_rate:10m rate=120r/m;

# Connection limiting: 20 concurrent connections per IP
limit_conn_zone $binary_remote_addr zone=perip:10m;

# Status codes for rate limit violations
limit_req_status 429;
limit_conn_status 429;
```

**Application** (per-site configs):
```nginx
location /api/ {
    limit_req zone=api_rate burst=60 nodelay;
    limit_conn perip 20;
    proxy_pass http://127.0.0.1:5000;
}
```

**Existing Configurations**:
- **Production** (`/etc/nginx/sites-available/zala`):
  - Auth: 5 req/sec, burst=10
  - API: 20 req/sec, burst=30
- **Staging** (`/etc/nginx/sites-available/staging-zala`):
  - Auth: 10 req/sec, burst=20
  - API: 50 req/sec, burst=100

### I) Server Hardening

**Status**: System-level configuration (not in repo)

**UFW Firewall**:
```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow Nginx (HTTP + HTTPS)
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Fail2ban**:
```bash
# Install
sudo apt-get install -y fail2ban

# Configuration: /etc/fail2ban/jail.d/defaults-debian.conf
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h

# Restart
sudo systemctl restart fail2ban

# Check status
sudo fail2ban-client status sshd
```

### J) External Synthetic Checks

**Script**: `scripts/external-synthetic.sh`  
**Purpose**: External monitoring from outside the server  
**Frequency**: Every 10 minutes

**Endpoints Monitored**:
- **Production**: https://www.zala.ir/api/health
- **Staging**: https://staging.zala.ir/api/health

**Validation**:
- HTTP status 200
- JSON response contains `"success":true`
- Timeout: 10 seconds
- Alerts on failure

**Usage**:
```bash
# Manual run
/home/ubuntu/Titan/scripts/external-synthetic.sh

# Check logs
tail -f /home/ubuntu/Titan/logs/external-synth.log
```

---

## Cron Jobs Schedule

```cron
# Existing cron jobs (Phase 4)
* * * * * /home/ubuntu/Titan/scripts/uptime-monitor.sh
0 2 * * * /home/ubuntu/Titan/scripts/backup-database.sh
0 2 * * * /home/ubuntu/Titan/scripts/backup-production-db.sh
0 3 * * 0 /home/ubuntu/Titan-staging/scripts/backup-staging-db.sh
15 2 * * * psql -c "SELECT run_all_cleanups();"
0 8 * * 0 psql -c "SELECT * FROM cleanup_statistics;"
0 4 1-7 * 0 psql -c "REINDEX DATABASE titan_trading;"

# Phase 5 cron jobs (NEW)
*/5 * * * * /home/ubuntu/Titan/scripts/health-checks.sh
*/2 * * * * /home/ubuntu/Titan/scripts/pm2-watchdog.sh
0 7 * * 0 /home/ubuntu/Titan/scripts/pg-weekly-report.sh
*/10 * * * * /home/ubuntu/Titan/scripts/external-synthetic.sh
```

**Total**: 11 automated cron jobs

---

## Alert Thresholds (KPIs)

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **API Error Rate (5xx)** | >1% in 5min | >5% in 5min | Alert + investigate |
| **Latency (p95)** | >800ms | >1500ms | Alert + optimize |
| **Rate Limit Hits** | >100/min | >500/min | Alert + investigate (possible attack) |
| **Redis Ping** | >50ms | Fail | Alert + check connection |
| **Postgres Query** | >300ms avg | >1000ms avg | Alert + optimize queries |
| **Disk Space** | >70% used | >80% used | Alert + cleanup |
| **PM2 Process** | Any restarts | Down + restart failed | Alert + manual intervention |
| **Memory Usage** | >80% | >90% | Alert + check for leaks |
| **CPU Load** | >2.0 (1min avg) | >4.0 (1min avg) | Alert + investigate |

---

## Testing

### Manual Testing

```bash
# 1. Health checks
/home/ubuntu/Titan/scripts/health-checks.sh

# 2. PM2 watchdog
/home/ubuntu/Titan/scripts/pm2-watchdog.sh

# 3. External synthetic
/home/ubuntu/Titan/scripts/external-synthetic.sh

# 4. PostgreSQL report
/home/ubuntu/Titan/scripts/pg-weekly-report.sh

# 5. Telegram alert (if configured)
./scripts/send_telegram.sh "🧪 Test alert from monitoring system"
```

### Automated Testing

Cron jobs will run automatically. Monitor logs:

```bash
# Watch all monitoring logs
tail -f /home/ubuntu/Titan/logs/*.log

# Specific log files
tail -f /home/ubuntu/Titan/logs/health-checks.log
tail -f /home/ubuntu/Titan/logs/pm2-watchdog.log
tail -f /home/ubuntu/Titan/logs/external-synth.log
tail -f /home/ubuntu/Titan/logs/pg-weekly-report.log
```

---

## Deployment Checklist

### Pre-Deployment
- [x] All scripts created and tested
- [x] Nginx configurations applied
- [x] Logrotate configuration created
- [x] Security middleware implemented
- [x] Cron jobs scheduled
- [ ] Telegram credentials configured (optional)

### Deployment Steps
1. ✅ Push code to GitHub
2. ✅ Create Pull Request
3. ⏳ Review and approve PR
4. ⏳ Merge to main
5. ⏳ Auto-deploy to staging
6. ⏳ Manual deploy to production
7. ⏳ Configure Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
8. ⏳ Integrate security headers middleware
9. ⏳ Monitor for 24 hours

### Post-Deployment
- [ ] Verify health checks running every 5 minutes
- [ ] Verify PM2 watchdog running every 2 minutes
- [ ] Verify external checks running every 10 minutes
- [ ] Wait for first weekly PostgreSQL report (Sunday 7 AM)
- [ ] Review logs for any errors
- [ ] Test Telegram alerts (if configured)

---

## Rollback Plan

### Remove Scripts
```bash
cd /home/ubuntu/Titan
rm scripts/health-checks.sh
rm scripts/send_telegram.sh
rm scripts/pg-weekly-report.sh
rm scripts/pm2-watchdog.sh
rm scripts/external-synthetic.sh
rm middleware/securityHeaders.js
```

### Remove Nginx Configurations
```bash
sudo rm /etc/nginx/conf.d/stub_status.conf
sudo rm /etc/nginx/conf.d/ratelimit.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Remove Logrotate
```bash
sudo rm /etc/logrotate.d/titan-app
```

### Remove Cron Jobs
```bash
crontab -e
# Delete Phase 5 cron job lines
```

### Uninstall Packages
```bash
cd /home/ubuntu/Titan
npm uninstall express-rate-limit rate-limit-redis ioredis helmet express-slow-down morgan
```

---

## Future Improvements

### Phase 5.1 (Optional Enhancements)
- [ ] Enable pg_stat_statements (requires superuser)
- [ ] Implement Prometheus metrics export
- [ ] Add Grafana dashboards
- [ ] Implement distributed tracing (Jaeger/Zipkin)
- [ ] Add application performance monitoring (APM)

### Phase 5.2 (Advanced Security)
- [ ] Implement WAF (Web Application Firewall)
- [ ] Add bot detection and mitigation
- [ ] Implement DDoS protection layer
- [ ] Add security scanning automation
- [ ] Implement secrets rotation automation

---

## Troubleshooting

### Health Checks Failing

**Issue**: Health checks reporting failures  
**Diagnosis**:
```bash
# Check individual services
curl -i http://127.0.0.1:5000/api/health
curl -i http://127.0.0.1:5001/api/health
redis-cli ping
psql $DATABASE_URL -c "SELECT 1;"
```

**Solutions**:
- Restart backend: `pm2 restart titan-backend`
- Restart Redis: `sudo systemctl restart redis`
- Check PostgreSQL: `sudo systemctl status postgresql`

### PM2 Watchdog Not Working

**Issue**: Watchdog not detecting down processes  
**Diagnosis**:
```bash
# Check PM2 status
pm2 status

# Check watchdog logs
tail -50 /home/ubuntu/Titan/logs/pm2-watchdog.log

# Test watchdog manually
/home/ubuntu/Titan/scripts/pm2-watchdog.sh
```

**Solutions**:
- Verify cron job exists: `crontab -l | grep pm2-watchdog`
- Check jq is installed: `which jq` (install if missing: `sudo apt install jq`)
- Verify PM2 is running: `pm2 list`

### Telegram Alerts Not Sending

**Issue**: No alerts received  
**Diagnosis**:
```bash
# Check env variables
grep TELEGRAM /home/ubuntu/Titan/.env

# Test telegram script
./scripts/send_telegram.sh "Test message"

# Check for errors
echo $?  # Should be 0
```

**Solutions**:
- Verify BOT_TOKEN is correct
- Verify CHAT_ID is correct
- Test bot manually: `curl "https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=Test"`
- Check bot is not blocked

---

## Metrics Dashboard (Manual)

```bash
# System overview
./scripts/health-checks.sh
pm2 status
df -h /
free -h
uptime

# Database metrics
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
psql $DATABASE_URL -c "SELECT * FROM cleanup_statistics;"

# Nginx metrics
curl -s http://127.0.0.1:8080/nginx_status

# Rate limiting (check Redis)
redis-cli KEYS "rate-limit:*" | wc -l
```

---

## Documentation Updates

- **Created**: November 1, 2024
- **Last Updated**: November 1, 2024
- **Version**: 1.0
- **Phase**: 5 - Monitoring & Safety
- **Status**: ✅ Complete

**Related Documents**:
- `docs/DATABASE_MAINTENANCE_PLAN.md` - Database monitoring details
- `docs/CI_CD_IMPLEMENTATION_STATUS.md` - Overall CI/CD status
- `README.md` - General project documentation

---

**End of Document**
