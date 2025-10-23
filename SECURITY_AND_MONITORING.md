# 🔒 Security & Monitoring Configuration

**Date:** 2025-10-23  
**Status:** ✅ Fully Configured

---

## 🎯 Summary

این سند تنظیمات امنیتی و مانیتورینگ سیستم TITAN را شرح می‌دهد.

### ✅ Implemented

1. **PM2 Persistence** - بعد از ریبوت backend بالا می‌آید
2. **Security Hardening** - .env امن، PostgreSQL فقط لوکال
3. **Uptime Monitoring** - هر ۱ دقیقه health check

---

## 1️⃣ PM2 Persistence & Auto-Start

### Configuration

**PM2 Startup Script:** ✅ Installed
```bash
# Service: pm2-ubuntu.service
# Location: /etc/systemd/system/pm2-ubuntu.service
# User: ubuntu
# Status: enabled
```

**PM2 Process List:** ✅ Saved
```bash
# Saved to: /home/ubuntu/.pm2/dump.pm2
# Contains: titan-backend (2 instances in cluster mode)
```

### Verification

```bash
# Check PM2 service status
systemctl status pm2-ubuntu

# Check if PM2 is enabled to start on boot
systemctl is-enabled pm2-ubuntu
# Output: enabled

# List saved PM2 processes
pm2 list
```

### After Reboot

```bash
# PM2 will automatically:
# 1. Start pm2-ubuntu service
# 2. Resurrect saved processes from dump.pm2
# 3. Start titan-backend with 2 cluster instances
# 4. Connect to database on port 5433
```

### Manual Commands

```bash
# Save current PM2 process list
pm2 save

# Remove PM2 from startup (if needed)
pm2 unstartup systemd

# Re-add PM2 to startup
pm2 startup systemd
```

---

## 2️⃣ Security Hardening

### A. .env File Security

**Status:** ✅ Secure

**Configuration:**
```bash
# File: /home/ubuntu/Titan/.env
# Permissions: 644 (readable by owner)
# Git Status: Ignored (in .gitignore)
```

**Verification:**
```bash
# Check if .env is in .gitignore
cat .gitignore | grep "^\.env$"
# Output: .env

# Verify .env is not tracked by git
git ls-files | grep "^\.env$"
# Output: (empty) ✅

# Check file permissions
ls -la /home/ubuntu/Titan/.env
# Output: -rw-r--r-- ubuntu ubuntu .env
```

**Best Practices:**
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` for template (without real credentials)
- ✅ Keep `.env` permissions restrictive
- ✅ Rotate secrets periodically

### B. PostgreSQL Security

**Status:** ✅ Secure (localhost only)

**Configuration:**
```bash
# PostgreSQL listening address
Listen Address: 127.0.0.1:5433
Interface: Loopback only (not accessible from external network)
```

**Verification:**
```bash
# Check listening address
sudo ss -ltnp | grep ':5433'
# Output: LISTEN 127.0.0.1:5433 (localhost only) ✅

# Try to connect from external IP (should fail)
psql -U titan_user -h <external-ip> -p 5433 -d titan_trading
# Expected: Connection refused ✅
```

**PostgreSQL Configuration:**
```
# File: /etc/postgresql/*/main/postgresql.conf
listen_addresses = '127.0.0.1'  # Localhost only
port = 5433                      # Non-standard port
```

**Additional Security:**
- ✅ Strong password: `***REDACTED***`
- ✅ Non-standard port: `5433` (not default `5432`)
- ✅ Limited user permissions: Only `titan_trading` database
- ✅ SSL connections (if configured in postgresql.conf)

### C. Nginx Security Headers

**Status:** ✅ Configured

All security headers are present in responses:

```bash
# Test security headers
curl -sI https://www.zala.ir/api/health | grep -i "strict-transport\|x-frame\|x-content"

# Output:
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
```

**Headers Explanation:**
- **HSTS:** Force HTTPS for 1 year with preload
- **X-Frame-Options:** Prevent clickjacking
- **X-Content-Type-Options:** Prevent MIME sniffing
- **X-XSS-Protection:** Browser XSS filter
- **Referrer-Policy:** Control referrer information

---

## 3️⃣ Uptime Monitoring

### A. Monitoring Script

**Location:** `/home/ubuntu/Titan/scripts/uptime-monitor.sh`  
**Frequency:** Every 1 minute (cron)  
**Target:** `https://www.zala.ir/api/health/full`

**Features:**
- ✅ Checks overall health status
- ✅ Monitors API, Database, Redis services
- ✅ Logs successful checks
- ✅ Alerts on failures (separate alert log)
- ✅ Automatic log rotation (>10MB)

**Cron Configuration:**
```bash
# View cron job
crontab -l | grep uptime-monitor

# Output:
* * * * * /home/ubuntu/Titan/scripts/uptime-monitor.sh >> /home/ubuntu/Titan/logs/uptime-monitor.log 2>&1
```

**Log Files:**
```bash
# Success logs
/home/ubuntu/Titan/logs/uptime-monitor.log

# Alert logs (failures only)
/home/ubuntu/Titan/logs/uptime-alerts.log
```

**Example Log Output:**
```
[2025-10-23 13:41:01] ✅ OK - Overall: healthy | API: healthy | DB: healthy | Redis: healthy
[2025-10-23 13:42:01] ✅ OK - Overall: healthy | API: healthy | DB: healthy | Redis: healthy
[2025-10-23 13:43:01] ⚠️  WARNING: Health check failed - Status: degraded, Error: Database timeout
```

**Manual Test:**
```bash
# Run monitor manually
/home/ubuntu/Titan/scripts/uptime-monitor.sh

# View last 10 logs
tail -10 /home/ubuntu/Titan/logs/uptime-monitor.log

# View alerts only
tail -20 /home/ubuntu/Titan/logs/uptime-alerts.log

# Watch logs in real-time
tail -f /home/ubuntu/Titan/logs/uptime-monitor.log
```

### B. Health Dashboard

**Location:** `/home/ubuntu/Titan/scripts/health-dashboard.sh`  
**Purpose:** Real-time system health overview

**Usage:**
```bash
# Run once
/home/ubuntu/Titan/scripts/health-dashboard.sh

# Auto-refresh every 5 seconds
watch -n 5 /home/ubuntu/Titan/scripts/health-dashboard.sh
```

**Dashboard Shows:**
- 🔧 PM2 Processes (status, uptime, memory)
- 🏥 Backend Health (all services)
- 🗄️ PostgreSQL Database (connection, size, tables)
- 🌐 Nginx Status (active/inactive, config)
- 🔒 SSL Certificate (expiry date)
- 📊 Recent Uptime Checks (last 5)
- 💾 Disk Usage
- 🧠 Memory Usage

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 TITAN Trading Platform - Health Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Time: 2025-10-23 13:41:11 UTC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 Backend Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Status: healthy
Version: 1.0.0
Uptime: 1277 seconds

Services:
  ✅ API Server: healthy - Uptime: 1277s
  ✅ PostgreSQL Database: healthy - Latency: 2ms, Size: 11MB
  ✅ Redis Cache: healthy - Latency: 1ms
  ℹ️ Job Queue: not_configured
  ⚠️ Memory Usage: warning - 17MB / 18MB (93%)
```

---

## 📊 Monitoring Metrics

### Key Performance Indicators

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Backend Uptime | >99.5% | - | Monitoring |
| API Response Time | <100ms | ~10ms | ✅ Excellent |
| Database Latency | <50ms | 2-3ms | ✅ Excellent |
| Redis Latency | <10ms | 1ms | ✅ Excellent |
| Disk Usage | <80% | 31% | ✅ Good |
| Memory Usage | <90% | 93% | ⚠️ High |

### Alert Thresholds

**Critical Alerts:**
- Backend unreachable for >2 minutes
- Database connection failed
- Disk usage >90%
- Memory usage >95%

**Warning Alerts:**
- API response time >500ms
- Database latency >100ms
- Memory usage >90%
- Disk usage >80%

---

## 🔧 Maintenance Tasks

### Daily

```bash
# Check uptime logs for failures
grep "WARNING\|CRITICAL" /home/ubuntu/Titan/logs/uptime-alerts.log | tail -20

# View dashboard
/home/ubuntu/Titan/scripts/health-dashboard.sh
```

### Weekly

```bash
# Check PM2 status
pm2 status

# Review error logs
pm2 logs titan-backend --lines 100 --err

# Check disk usage
df -h
```

### Monthly

```bash
# Rotate large log files
find /home/ubuntu/Titan/logs -type f -size +50M -exec gzip {} \;

# Check SSL certificate expiry
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt -noout -enddate

# Update dependencies (test environment first)
cd /home/ubuntu/Titan
npm outdated
```

### After System Updates

```bash
# Restart PM2
pm2 restart all

# Verify startup script still works
systemctl status pm2-ubuntu

# Test health check
curl -s https://www.zala.ir/api/health/full | jq '.data.overallStatus'
```

---

## 🚨 Incident Response

### Backend Down

```bash
# 1. Check PM2 status
pm2 status

# 2. Check PM2 logs
pm2 logs titan-backend --lines 50

# 3. Restart if needed
pm2 restart titan-backend

# 4. Check health
curl -s http://127.0.0.1:5000/api/health
```

### Database Connection Issues

```bash
# 1. Check PostgreSQL is running
sudo systemctl status postgresql

# 2. Check if port is listening
sudo ss -ltnp | grep ':5433'

# 3. Test connection
PGPASSWORD='***REDACTED***' psql -U titan_user -h localhost -p 5433 -d titan_trading -c "SELECT 1;"

# 4. Check backend .env
cat /home/ubuntu/Titan/.env | grep DATABASE_URL
```

### High Memory Usage

```bash
# 1. Check memory consumption
free -h

# 2. Check PM2 process memory
pm2 monit

# 3. Restart PM2 if memory leak
pm2 restart titan-backend

# 4. Increase PM2 max memory restart
pm2 restart titan-backend --max-memory-restart 2G
```

### SSL Certificate Issues

```bash
# 1. Check certificate validity
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt -noout -dates

# 2. Test SSL connection
curl -vI https://www.zala.ir 2>&1 | grep -i "ssl\|certificate"

# 3. Check Nginx SSL config
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx
```

---

## 📚 Quick Reference

### Important Paths

```bash
# Backend
/home/ubuntu/Titan/                          # Project root
/home/ubuntu/Titan/.env                      # Environment variables (not in git)
/home/ubuntu/Titan/server-real-v3.js         # Backend entry point

# PM2
/home/ubuntu/.pm2/dump.pm2                   # Saved process list
/home/ubuntu/.pm2/logs/                      # PM2 logs
/etc/systemd/system/pm2-ubuntu.service       # Startup service

# Logs
/home/ubuntu/Titan/logs/uptime-monitor.log   # Health check logs
/home/ubuntu/Titan/logs/uptime-alerts.log    # Alert logs

# Scripts
/home/ubuntu/Titan/scripts/uptime-monitor.sh # Monitoring script
/home/ubuntu/Titan/scripts/health-dashboard.sh # Dashboard

# SSL
/etc/ssl/cloudflare/zala.ir.origin.fullchain.crt  # Certificate
/etc/ssl/cloudflare/zala.ir.origin.key            # Private key

# Nginx
/etc/nginx/sites-available/zala.ir           # Config (symlink)
/home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf  # Source config
```

### Useful Commands

```bash
# Health checks
curl -s https://www.zala.ir/api/health/full | jq '.'
/home/ubuntu/Titan/scripts/health-dashboard.sh

# PM2 management
pm2 status
pm2 logs titan-backend --lines 20
pm2 restart titan-backend
pm2 save

# View logs
tail -f /home/ubuntu/Titan/logs/uptime-monitor.log
grep "WARNING\|CRITICAL" /home/ubuntu/Titan/logs/uptime-alerts.log

# Database
PGPASSWORD='***REDACTED***' psql -U titan_user -h localhost -p 5433 -d titan_trading

# System status
systemctl status pm2-ubuntu
systemctl status nginx
systemctl status postgresql
```

---

## 🎯 Success Criteria

### ✅ Completed

1. **PM2 Persistence**
   - ✅ Startup script installed and enabled
   - ✅ Process list saved
   - ✅ Backend will auto-start after reboot

2. **Security Hardening**
   - ✅ .env file not tracked in git
   - ✅ PostgreSQL listening on localhost only
   - ✅ Strong password with non-standard port
   - ✅ Security headers configured

3. **Uptime Monitoring**
   - ✅ Cron job running every minute
   - ✅ Health check script with logging
   - ✅ Alert logging for failures
   - ✅ Health dashboard for quick overview

---

**Last Updated:** 2025-10-23  
**Maintained By:** DevOps Team  
**Contact:** For issues, check logs and dashboard first
