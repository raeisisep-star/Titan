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
8. [Order Reconciliation Issues](#incident-7-order-reconciliation-issues) 🆕
9. [Exchange API Down](#incident-8-exchange-api-down) 🆕

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

## Incident 7: Order Reconciliation Issues 🆕

### 🔍 Symptoms
- Orders showing incorrect status in database vs exchange
- `last_synced_at` timestamps not updating
- Reconciliation worker logs showing errors
- Circuit breaker in OPEN state preventing reconciliation
- High discrepancy rate (> 5% of orders out of sync)

### 📊 Diagnosis

**Check reconciliation worker status:**
```bash
# Check PM2 status
pm2 status reconciler

# Check recent reconciliation logs
pm2 logs reconciler --lines 50 --nostream

# Check reconciliation metrics
pm2 logs reconciler --nostream | grep -i "reconciliation cycle completed" | tail -5
```

**Check for stale orders:**
```bash
# Connect to database
PGPASSWORD="<rotated-password>" psql -h localhost -p 5433 -U titan_user -d titan_trading

# Query stale orders
SELECT 
  COUNT(*) as stale_count,
  MIN(last_synced_at) as oldest_sync,
  MAX(last_synced_at) as newest_sync
FROM orders
WHERE external_order_id IS NOT NULL
  AND status IN ('pending', 'partial', 'new')
  AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '10 minutes');

# Check discrepancy rate
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - last_synced_at))) as avg_staleness_seconds
FROM orders
WHERE external_order_id IS NOT NULL
GROUP BY status;
```

### ✅ Resolution

#### Scenario A: Reconciliation Worker Crashed

**Symptoms:** PM2 shows reconciler as "stopped" or "errored"

**Resolution:**
```bash
# Check error logs
pm2 logs reconciler --err --lines 100

# Restart reconciler
pm2 restart reconciler

# Verify it's running
pm2 status reconciler

# Monitor for immediate crashes
watch -n 2 'pm2 status reconciler'
```

#### Scenario B: Circuit Breaker in OPEN State

**Symptoms:** Logs show "Circuit breaker [exchange-reconciliation] is OPEN"

**Diagnosis:**
```bash
# Check circuit breaker metrics in logs
pm2 logs reconciler --nostream | grep -i "circuit breaker status"

# Look for patterns of exchange API failures
pm2 logs reconciler --nostream | grep -E "(ECONNREFUSED|ETIMEDOUT|Failed to reconcile)" | tail -20
```

**Resolution:**
```bash
# Option 1: Wait for circuit to naturally transition to HALF_OPEN
# (happens after 2 minutes by default)

# Option 2: Restart reconciler to reset circuit breaker
pm2 restart reconciler

# Option 3: Check exchange connectivity
# If using Paper Trading:
curl http://localhost:5000/api/exchange/balance

# If using real exchange (MEXC):
# Verify API credentials and network connectivity

# Option 4: Temporarily increase circuit breaker thresholds (if needed)
# Edit ecosystem.config.js and add to reconciler env:
# CIRCUIT_FAILURE_THRESHOLD: 10
# CIRCUIT_OPEN_DURATION_MS: 180000
pm2 restart reconciler --update-env
```

#### Scenario C: High Reconciliation Lag

**Symptoms:** Orders taking > 10 minutes to sync, large backlog

**Diagnosis:**
```bash
# Check reconciliation worker performance
pm2 logs reconciler --nostream | grep "cycle completed" | tail -10

# Look for:
# - High duration times (> 30 seconds per cycle)
# - Many errors
# - Circuit breaker rejections

# Check database query performance
PGPASSWORD="<rotated-password>" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "
EXPLAIN ANALYZE 
SELECT id, symbol, external_order_id, status
FROM orders
WHERE external_order_id IS NOT NULL
  AND status IN ('pending', 'partial', 'new')
  AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '5 minutes')
LIMIT 200;
"
```

**Resolution:**
```bash
# Option 1: Verify indexes exist
PGPASSWORD="<rotated-password>" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE '%external%' OR indexname LIKE '%synced%';
"

# Expected indexes:
# - idx_orders_external_order_id
# - idx_orders_exchange

# Option 2: Increase reconciliation batch size (if system can handle it)
# Edit ecosystem.config.js:
# RECONCILIATION_BATCH_SIZE: 300
pm2 restart reconciler --update-env

# Option 3: Decrease reconciliation interval (more frequent syncs)
# Edit ecosystem.config.js:
# RECONCILIATION_INTERVAL_MS: 30000  # 30 seconds
pm2 restart reconciler --update-env

# Option 4: Check exchange API rate limits
pm2 logs titan-backend --nostream | grep -i "429\|rate limit"
```

#### Scenario D: Reconciliation Producing Wrong Data

**Symptoms:** Orders updated with incorrect status/quantities

**Immediate Action:**
```bash
# STOP reconciliation worker immediately
pm2 stop reconciler

# Check recent reconciliation activities
PGPASSWORD="<rotated-password>" psql -h localhost -p 5433 -U titan_user -d titan_trading -c "
SELECT 
  action,
  details->>'orderId' as order_id,
  details->>'externalOrderId' as external_order_id,
  details->>'oldStatus' as old_status,
  details->>'newStatus' as new_status,
  timestamp
FROM activities
WHERE action = 'reconciliation.update'
ORDER BY timestamp DESC
LIMIT 20;
"

# Verify exchange adapter is working correctly
cd /home/ubuntu/Titan
TEST_JWT="<valid-jwt>" node tests/exchange-integration.test.js

# If Paper Trading adapter has bugs, switch to manual reconciliation
# If Real exchange (MEXC) has issues, verify credentials and API status
```

**Resolution:**
```bash
# Option 1: Fix exchange adapter bug (if found)
# Edit appropriate adapter file, test, commit, deploy

# Option 2: Rollback recent reconciliation changes
# Check git history for recent changes to workers/reconciler.js
git log --oneline workers/reconciler.js

# Rollback if needed
git revert <commit-hash>
pm2 restart reconciler

# Option 3: Manual reconciliation for affected orders
# Query affected orders and manually sync with exchange
```

### 🔧 Configuration Tuning

**Default Configuration:**
```javascript
// ecosystem.config.js reconciler env
{
  RECONCILIATION_INTERVAL_MS: 45000,      // 45 seconds
  RECONCILIATION_STALE_MINUTES: 5,        // 5 minutes
  RECONCILIATION_BATCH_SIZE: 200          // 200 orders per cycle
}
```

**For High-Volume Trading:**
```javascript
{
  RECONCILIATION_INTERVAL_MS: 30000,      // 30 seconds (more frequent)
  RECONCILIATION_STALE_MINUTES: 3,        // 3 minutes (tighter sync)
  RECONCILIATION_BATCH_SIZE: 300          // Larger batches
}
```

**For Low-Volume / Stability:**
```javascript
{
  RECONCILIATION_INTERVAL_MS: 60000,      // 60 seconds (less frequent)
  RECONCILIATION_STALE_MINUTES: 10,       // 10 minutes (relaxed)
  RECONCILIATION_BATCH_SIZE: 100          // Smaller batches
}
```

### 📈 Key Metrics to Monitor

**Success Metrics:**
- **Discrepancy Rate:** < 1% of orders with status mismatches
- **Sync Latency:** 95th percentile < 5 minutes
- **Reconciliation Cycle Duration:** < 10 seconds per cycle
- **Circuit Breaker State:** Closed 99%+ of the time

**Warning Thresholds:**
- Discrepancy Rate > 5%
- Sync Latency p95 > 10 minutes
- Circuit Breaker Open > 5% of time
- Reconciliation errors > 10 per hour

**Query for Current Metrics:**
```sql
-- Discrepancy rate
SELECT 
  COUNT(*) FILTER (WHERE last_synced_at < NOW() - INTERVAL '10 minutes') * 100.0 / COUNT(*) as discrepancy_pct
FROM orders
WHERE external_order_id IS NOT NULL;

-- Sync latency distribution
SELECT 
  percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (NOW() - last_synced_at))) as p50_seconds,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (NOW() - last_synced_at))) as p95_seconds,
  percentile_cont(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (NOW() - last_synced_at))) as p99_seconds
FROM orders
WHERE external_order_id IS NOT NULL 
  AND last_synced_at IS NOT NULL;
```

### 🚨 Escalation Path

1. **Level 1:** Restart reconciliation worker (< 2 minutes)
2. **Level 2:** Investigate circuit breaker / exchange connectivity (< 10 minutes)
3. **Level 3:** Review reconciliation code for bugs (< 30 minutes)
4. **Level 4:** Manual order reconciliation required (> 30 minutes)

**Emergency Contact:** DevOps on-call, Backend team lead

---

## Incident 8: Exchange API Down 🆕

### 🔍 Symptoms
- All exchange operations failing
- Circuit breaker stuck in OPEN state
- Cannot place new orders
- Cannot query balances
- Logs showing connection timeouts or 502/503 errors

### 📊 Diagnosis

**Check exchange connectivity:**
```bash
# Check if Paper Trading adapter works
curl -H "Authorization: Bearer <valid-jwt>" http://localhost:5000/api/exchange/balance

# Check server logs for exchange errors
pm2 logs titan-backend --nostream | grep -i "exchange\|adapter" | tail -30

# Check circuit breaker status
pm2 logs reconciler --nostream | grep "circuit breaker status" | tail -5
```

**Verify exchange configuration:**
```bash
# Check .env settings
cd /home/ubuntu/Titan
grep "EXCHANGE" .env

# Should show:
# EXCHANGE_NAME=paper  # For safety
```

### ✅ Resolution

#### Scenario A: Paper Trading Adapter Bug

**Symptoms:** Even Paper Trading failing (shouldn't happen normally)

**Resolution:**
```bash
# Check for code errors
pm2 logs titan-backend --err --lines 50 | grep -i "paper"

# Restart backend
pm2 restart titan-backend

# Run integration tests
TEST_JWT="<valid-jwt>" node tests/exchange-integration.test.js

# If tests fail, check adapters/PaperTradingAdapter.js for bugs
```

#### Scenario B: Real Exchange (MEXC) API Down

**Symptoms:** MEXC API returning errors, but only if EXCHANGE_NAME=mexc

**Resolution:**
```bash
# Check MEXC API status (external)
curl -s https://www.mexc.com/api/v3/ping

# Check if it's rate limiting
pm2 logs titan-backend --nostream | grep "429"

# Option 1: Wait for MEXC to recover
# Circuit breaker will protect system (fail-fast)

# Option 2: Switch to Paper Trading temporarily
# Edit .env:
# EXCHANGE_NAME=paper
pm2 restart ecosystem.config.js --update-env

# Option 3: Disable order placement temporarily
# (Implement feature flag if needed)
```

**Note:** Production should **always** use `EXCHANGE_NAME=paper` unless explicitly configured for real trading.

---

**Last Updated:** 2025-10-28  
**Version:** 1.1  
**Maintained By:** DevOps Team
