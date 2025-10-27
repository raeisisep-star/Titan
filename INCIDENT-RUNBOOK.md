# 🚨 TITAN Trading System - Incident Runbook

**Quick Reference Guide for Common Production Issues**

---

## 📋 Table of Contents

1. [Health Check Failures](#incident-0-health-check-failures) 🆕
2. [High 429 Rate (Too Many Requests)](#incident-1-high-429-rate)
3. [Database Connection Issues](#incident-2-database-connection-issues)
4. [High Response Latency](#incident-3-high-response-latency)
5. [PM2 Service Down](#incident-4-pm2-service-down)
6. [Database Disk Full](#incident-5-database-disk-full)
7. [Memory Leak Detection](#incident-6-memory-leak-detection)

---

## Incident 0: Health Check Failures 🆕

### 🔍 Symptoms
- `/healthz/deps` endpoint returning 503 (Service Unavailable)
- Monitoring alerts for degraded system health
- One or more dependencies reporting as "unhealthy"

### 📊 Diagnosis

**Check overall system health:**
```bash
# Check health endpoint
curl http://localhost:3000/healthz/deps | jq .

# Expected healthy response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-27T13:00:00.000Z",
#   "checks": {
#     "database": { "status": "healthy", "latency": 5 },
#     "redis": { "status": "healthy", "latency": 2 }
#   }
# }
```

**Check specific dependencies:**
```bash
# Test database connection directly
PGPASSWORD="Titan@2024!Strong" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT NOW();"

# Test Redis connection
redis-cli -h localhost -p 6379 PING
```

### ✅ Resolution

#### Scenario A: Database Unhealthy

**Symptoms:** `checks.database.status = "unhealthy"`

**Diagnosis:**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check database connections
PGPASSWORD="Titan@2024!Strong" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
PGPASSWORD="Titan@2024!Strong" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';"
```

**Resolution:**
```bash
# Restart PostgreSQL if service is down
sudo systemctl restart postgresql

# Kill long-running queries (if found)
PGPASSWORD="Titan@2024!Strong" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT pg_terminate_backend(PID_HERE);"

# Check connection pool in application
pm2 logs titan-backend --nostream --lines 50 | grep -i "database\|pool"

# Restart application to reset connection pool
pm2 restart ecosystem.config.js
```

#### Scenario B: Redis Unhealthy

**Symptoms:** `checks.redis.status = "unhealthy"` or `"disconnected"`

**Diagnosis:**
```bash
# Check Redis service
sudo systemctl status redis

# Check Redis memory usage
redis-cli INFO memory | grep used_memory_human

# Check Redis connections
redis-cli CLIENT LIST | wc -l
```

**Resolution:**
```bash
# Restart Redis if service is down
sudo systemctl restart redis

# Clear Redis cache if memory is full
redis-cli FLUSHDB

# Application will automatically reconnect
# Monitor logs for reconnection
pm2 logs titan-backend --lines 50 | grep -i redis
```

#### Scenario C: High Latency

**Symptoms:** Health checks succeeding but with high latency (> 100ms)

**Diagnosis:**
```bash
# Check system load
top
htop

# Check disk I/O
iostat -x 1 5

# Check network latency
ping localhost
```

**Resolution:**
```bash
# Check for resource-intensive queries
# See Incident 3 (High Response Latency) for full details

# Consider scaling database connections
# Edit server-real-v3.js: max: 20 → max: 30
pm2 restart ecosystem.config.js
```

### 🔥 Escalation

If health checks continue to fail after above steps:

1. **Check system resources:**
   ```bash
   df -h  # Disk space
   free -h  # Memory
   top  # CPU and processes
   ```

2. **Review recent changes:**
   ```bash
   cd /home/ubuntu/Titan
   git log --oneline -10
   pm2 logs titan-backend --lines 100
   ```

3. **Restart all services:**
   ```bash
   sudo systemctl restart postgresql redis
   pm2 restart ecosystem.config.js
   ```

4. **Contact senior engineer if issue persists** ☎️

### 📝 Post-Incident

- Document root cause in incident log
- Update monitoring thresholds if false positive
- Consider implementing auto-recovery for common scenarios

---

## Incident 1: High 429 Rate (Too Many Requests)

### 🔍 Symptoms
- Users reporting "Too Many Requests" errors
- 429 status codes in logs
- Rate limiter triggering frequently

### 📊 Diagnosis
```bash
# Check rate limiter backend status
cd /home/ubuntu/Titan
pm2 logs titan-backend --nostream --lines 50 | grep -i "rate\|429"

# Check if using Memory or Redis backend
pm2 logs titan-backend --nostream --lines 20 | grep "Rate limiter"

# Monitor 429 responses in real-time
pm2 logs titan-backend --lines 0 | grep "429"
```

### ✅ Resolution

**Temporary (Immediate):**
```bash
# Increase rate limit temporarily (requires code change + restart)
# Edit server-real-v3.js:
# Change: points: 50 → points: 100
pm2 restart ecosystem.config.js --update-env
```

**Permanent:**
```bash
# Option 1: Fix Redis v5 compatibility (recommended)
# Switch to ioredis or implement Lua script
# See: /home/ubuntu/Titan/SPRINT-3-DEPLOYMENT-REPORT.md

# Option 2: Adjust rate limits based on actual usage
# Analyze logs to determine appropriate threshold
```

### 🔔 Monitoring
```bash
# Track 429 rate
grep "429" /home/ubuntu/Titan/logs/backend-out.log | wc -l

# Check rate limiter keys (if using Redis)
redis-cli KEYS "rl:api:*" | wc -l
```

---

## Incident 2: Database Connection Issues

### 🔍 Symptoms
- "ECONNREFUSED" errors
- "Connection pool exhausted" messages
- 500 errors on all database operations

### 📊 Diagnosis
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if PostgreSQL is listening on port 5433
sudo netstat -tlnp | grep 5433

# Test connection manually
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT 1;"

# Check connection pool status
pm2 logs titan-backend --nostream --lines 50 | grep -i "pool\|connection\|ECONNREFUSED"
```

### ✅ Resolution

**If PostgreSQL is down:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**If connection pool exhausted:**
```bash
# Restart PM2 to reset connection pools
cd /home/ubuntu/Titan
pm2 restart ecosystem.config.js --update-env

# Check for connection leaks in code
# Ensure all queries use proper error handling
```

**If authentication fails:**
```bash
# Verify .env credentials
cat /home/ubuntu/Titan/.env | grep DB_

# Test connection with current credentials
source /home/ubuntu/Titan/.env
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT NOW();"
```

### 🔔 Monitoring
```bash
# Check active connections
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check max connections
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SHOW max_connections;"
```

---

## Incident 3: High Response Latency

### 🔍 Symptoms
- Requests taking > 500ms
- Users reporting slow page loads
- Timeout errors

### 📊 Diagnosis
```bash
# Check PM2 CPU and memory
pm2 status

# Check database query performance
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check system resources
top -bn1 | head -20
df -h
free -h
```

### ✅ Resolution

**High CPU:**
```bash
# Identify CPU-intensive queries
# Add indexes to frequently queried columns
# Consider query optimization
```

**Slow Database Queries:**
```bash
# Enable query logging temporarily
# Check /home/ubuntu/Titan/logs/backend-error.log

# Example: Add index for user_id queries
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON orders(user_id, created_at DESC);
"
```

**Memory Issues:**
```bash
# Restart PM2 to clear memory
pm2 restart ecosystem.config.js --update-env

# Check for memory leaks
pm2 monit
```

### 🔔 Monitoring
```bash
# Track response times
# TODO: Add APM monitoring (New Relic, Datadog, etc.)

# Check PM2 metrics
pm2 describe titan-backend | grep -E "(cpu|memory)"
```

---

## Incident 4: PM2 Service Down

### 🔍 Symptoms
- API not responding
- `pm2 status` shows "stopped" or "errored"
- Health check failing

### 📊 Diagnosis
```bash
# Check PM2 status
pm2 status

# Check recent logs
pm2 logs titan-backend --nostream --lines 100 --err

# Check if port is already in use
sudo netstat -tlnp | grep 5000
```

### ✅ Resolution

**If service stopped:**
```bash
cd /home/ubuntu/Titan
pm2 start ecosystem.config.js
pm2 status
```

**If port conflict:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill conflicting process (if safe)
sudo kill -9 <PID>

# Restart PM2
pm2 restart ecosystem.config.js --update-env
```

**If continuous crashes:**
```bash
# Check error logs
pm2 logs titan-backend --err --nostream --lines 200

# Common issues:
# - Missing environment variables
# - Database connection failure
# - Node module issues

# Verify environment
cd /home/ubuntu/Titan
cat .env | head -10

# Reinstall dependencies if needed
npm install
pm2 restart ecosystem.config.js --update-env
```

### 🔔 Monitoring
```bash
# Setup PM2 auto-restart
pm2 startup
pm2 save

# Monitor restart count
pm2 status | grep restarts
```

---

## Incident 5: Database Disk Full

### 🔍 Symptoms
- "No space left on device" errors
- Failed database writes
- 500 errors on POST requests

### 📊 Diagnosis
```bash
# Check disk usage
df -h

# Check PostgreSQL data directory size
sudo du -sh /var/lib/postgresql/*/main/

# Check backup directory size
du -sh /home/ubuntu/Titan/backups/
```

### ✅ Resolution

**Immediate (Free Space):**
```bash
# Remove old backups
find /home/ubuntu/Titan/backups/ -name "titan_trading_*.dump" -type f -mtime +7 -delete

# Clean up old logs
find /home/ubuntu/Titan/logs/ -name "*.log" -type f -mtime +7 -delete

# Clean PM2 logs
pm2 flush
```

**Permanent:**
```bash
# Setup log rotation (already configured with pm2-logrotate)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:retain 7

# Vacuum PostgreSQL
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "VACUUM FULL ANALYZE;"

# Consider increasing disk size or adding volume
```

### 🔔 Monitoring
```bash
# Daily disk check
df -h | grep -E "Filesystem|/$"

# Alert if usage > 80%
USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $USAGE -gt 80 ]; then
  echo "⚠️ Disk usage is at ${USAGE}%"
fi
```

---

## Incident 6: Memory Leak Detection

### 🔍 Symptoms
- PM2 memory usage increasing over time
- OOM (Out of Memory) kills
- System becoming unresponsive

### 📊 Diagnosis
```bash
# Monitor memory over time
pm2 monit

# Check memory trend
pm2 status

# Check for zombie processes
ps aux | grep node | grep -v grep
```

### ✅ Resolution

**Immediate:**
```bash
# Restart PM2 to free memory
pm2 restart ecosystem.config.js --update-env

# Monitor after restart
watch -n 5 'pm2 status'
```

**Investigation:**
```bash
# Enable heap snapshots (for Node.js memory profiling)
# Add to ecosystem.config.js:
# node_args: '--max-old-space-size=512 --expose-gc'

# Take heap snapshot
pm2 trigger titan-backend heapdump

# Analyze with Chrome DevTools or clinic.js
```

**Prevention:**
```bash
# Set memory limits in ecosystem.config.js
max_memory_restart: '300M'

# Configure PM2 to restart on memory threshold
pm2 restart ecosystem.config.js --update-env
```

### 🔔 Monitoring
```bash
# Setup memory alerts
# TODO: Implement Prometheus + Grafana or similar

# Quick check
pm2 describe titan-backend | grep memory
```

---

## 📞 Escalation Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Primary On-Call | TBD | 24/7 |
| Database Admin | TBD | Business hours |
| DevOps Lead | TBD | Business hours |

---

## 🔗 Useful Commands Reference

```bash
# Quick Health Check
curl http://localhost:5000/health

# Restart Everything
cd /home/ubuntu/Titan
pm2 restart ecosystem.config.js --update-env

# View All Logs
pm2 logs titan-backend

# Database Connection Test
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT NOW();"

# Run Smoke Tests
cd /home/ubuntu/Titan && node smoke-test-sprint3.js

# Check Git Status
cd /home/ubuntu/Titan && git status && git log --oneline -5

# Backup Database Manually
/home/ubuntu/Titan/scripts/backup-database.sh

# Restore from Backup
PGPASSWORD='Titan@2024!Strong' pg_restore -h localhost -p 5433 -U titan_user -d titan_trading --clean --if-exists /home/ubuntu/Titan/backups/latest.dump
```

---

## 📚 Additional Resources

- **Deployment Report:** `/home/ubuntu/Titan/SPRINT-3-DEPLOYMENT-REPORT.md`
- **Smoke Tests:** `/home/ubuntu/Titan/smoke-test-sprint3.js`
- **Environment Config:** `/home/ubuntu/Titan/.env`
- **PM2 Config:** `/home/ubuntu/Titan/ecosystem.config.js`
- **Logs Directory:** `/home/ubuntu/Titan/logs/`
- **Backups Directory:** `/home/ubuntu/Titan/backups/`

---

**Last Updated:** 2025-10-27  
**Version:** 1.0  
**Maintained By:** DevOps Team
