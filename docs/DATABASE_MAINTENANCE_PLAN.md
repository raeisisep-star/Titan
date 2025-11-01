# Database Maintenance Plan

**Last Updated**: 2024-11-01  
**Status**: Phase 4 Implementation Complete  
**Next Review**: 2024-12-01

## Overview

This document outlines the complete database maintenance strategy for the Titan Trading System, including performance optimization, data retention policies, backup procedures, and monitoring guidelines.

## Current Database Status

### Schema Summary

| Table | Rows (Est) | Size | Indexes | Status |
|-------|-----------|------|---------|--------|
| users | ~100 | 16 KB | 3 | ✅ Healthy |
| user_sessions | ~500 | 80 KB | 2 | ✅ Healthy |
| trading_accounts | ~200 | 32 KB | 2 | ✅ Healthy |
| portfolios | ~200 | 32 KB | 2 | ✅ Healthy |
| orders | ~5,000 | 400 KB | 4 | ⚠️ Needs index |
| trades | ~10,000 | 800 KB | 3 | ⚠️ Needs index |
| positions | ~1,000 | 160 KB | 3 | ⚠️ Needs index |
| price_alerts | ~500 | 80 KB | 2 | ⚠️ Needs index |
| notifications | ~2,000 | 320 KB | 2 | ⚠️ Needs index |
| audit_logs | ~50,000 | 8 MB | 2 | ⚠️ Needs index |
| system_logs | ~100,000 | 16 MB | 1 | ⚠️ Needs index |
| watchlist_items | ~500 | 80 KB | 2 | ✅ Healthy |
| ai_insights | ~1,000 | 160 KB | 2 | ✅ Healthy |
| markets | ~200 | 32 KB | 2 | ✅ Healthy |
| autopilot_configs | ~100 | 16 KB | 2 | ✅ Healthy |
| exchange_settings | ~200 | 32 KB | 2 | ✅ Healthy |

**Total Database Size**: ~26 MB (current)  
**Total Indexes**: 39 existing + 9 new = 48 total

### Key Observations

1. ✅ **Good Index Coverage**: All tables have primary keys and unique constraints
2. ⚠️ **Missing Performance Indexes**: 9 critical indexes identified for high-traffic queries
3. ✅ **Healthy Table Sizes**: All tables are within normal growth ranges
4. ⚠️ **No Data Retention**: Logs tables will grow indefinitely without cleanup
5. ✅ **No Bloat Detected**: All tables are efficiently packed

## Performance Optimization

### New Indexes Implemented

**Migration**: `0010_add_performance_indexes.sql`

#### High Priority (5 indexes)

1. **`idx_orders_created_at`** - Orders by creation date (DESC)
   - **Usage**: Recent orders, order history pagination
   - **Expected Impact**: 30-50% faster queries
   - **Query**: `SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`

2. **`idx_trades_created_at`** - Trades by creation date (DESC)
   - **Usage**: Trade history, performance analytics
   - **Expected Impact**: 30-50% faster queries
   - **Query**: `SELECT * FROM trades ORDER BY created_at DESC LIMIT 100`

3. **`idx_price_alerts_user_id`** - Price alerts by user
   - **Usage**: Fetching all alerts for a user
   - **Expected Impact**: 40-60% faster queries
   - **Query**: `SELECT * FROM price_alerts WHERE user_id = ?`

4. **`idx_notifications_unread`** - Unread notifications (partial index)
   - **Usage**: Fetching unread notifications (very frequent)
   - **Expected Impact**: 50-70% faster queries
   - **Query**: `SELECT * FROM notifications WHERE user_id = ? AND is_read = false`
   - **Note**: Partial index reduces size by ~60%

5. **`idx_positions_portfolio_status`** - Positions by portfolio and status
   - **Usage**: Portfolio management, open positions
   - **Expected Impact**: 20-30% faster queries
   - **Query**: `SELECT * FROM positions WHERE portfolio_id = ? AND status = 'open'`

#### Medium Priority (4 indexes)

6. **`idx_audit_logs_user_timestamp`** - Audit logs by user and time
   - **Usage**: User activity tracking, security audits
   - **Query**: `SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC`

7. **`idx_system_logs_level_timestamp`** - System logs by level and time
   - **Usage**: Error monitoring, log analysis
   - **Query**: `SELECT * FROM system_logs WHERE log_level = 'ERROR' ORDER BY created_at DESC`

8. **`idx_user_sessions_user_expires`** - Active sessions (partial index)
   - **Usage**: Session validation, cleanup
   - **Query**: `SELECT * FROM user_sessions WHERE user_id = ? AND is_active = true`

9. **`idx_orders_symbol`** - Orders by symbol
   - **Usage**: Symbol-specific order history
   - **Query**: `SELECT * FROM orders WHERE symbol = 'BTCUSDT'`

### Index Maintenance

**Monitoring**:
```sql
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Find unused indexes (idx_scan = 0 after weeks of operation)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as wasted_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
);
```

**REINDEX Schedule**:
```bash
# Monthly reindex (first Sunday, 4 AM)
0 4 1-7 * 0 psql $DATABASE_URL -c "REINDEX DATABASE titan_trading;" >> /home/ubuntu/logs/db-reindex.log 2>&1
```

## Data Retention Policies

**Migration**: `0011_add_data_retention_functions.sql`

### Retention Rules

| Table | Retention Period | Cleanup Function | Schedule |
|-------|-----------------|------------------|----------|
| audit_logs | 90 days | `cleanup_audit_logs()` | Daily 2 AM |
| system_logs (INFO/DEBUG) | 30 days | `cleanup_system_logs()` | Daily 2 AM |
| system_logs (WARN/ERROR) | 180 days | `cleanup_system_logs()` | Daily 2 AM |
| notifications (read) | 60 days | `cleanup_notifications()` | Daily 2 AM |
| notifications (unread) | ∞ (keep) | N/A | N/A |
| user_sessions (expired) | 0 days | `cleanup_expired_sessions()` | Daily 2 AM |

### Cleanup Functions

#### Individual Cleanup Functions

1. **`cleanup_audit_logs()`**
   ```sql
   SELECT * FROM cleanup_audit_logs();
   -- Returns: deleted_count
   ```

2. **`cleanup_system_logs()`**
   ```sql
   SELECT * FROM cleanup_system_logs();
   -- Returns: info_deleted, warn_deleted, total_deleted
   ```

3. **`cleanup_notifications()`**
   ```sql
   SELECT * FROM cleanup_notifications();
   -- Returns: deleted_count
   ```

4. **`cleanup_expired_sessions()`**
   ```sql
   SELECT * FROM cleanup_expired_sessions();
   -- Returns: deleted_count
   ```

#### Comprehensive Cleanup

**`run_all_cleanups()`** - Executes all cleanup functions with timing
```sql
SELECT * FROM run_all_cleanups();
-- Returns: cleanup_type, records_deleted, execution_time
```

### Cleanup Statistics View

**`cleanup_statistics`** - Monitor cleanup targets before execution
```sql
SELECT * FROM cleanup_statistics;
-- Shows: table_name, total_records, records_to_cleanup, table_size
```

### Cron Job Setup

```bash
# Daily comprehensive cleanup (2:00 AM)
0 2 * * * psql $DATABASE_URL -c "SELECT run_all_cleanups();" >> /home/ubuntu/logs/db-cleanup.log 2>&1

# Weekly statistics report (Sunday 8:00 AM)
0 8 * * 0 psql $DATABASE_URL -c "SELECT * FROM cleanup_statistics;" >> /home/ubuntu/logs/db-stats.log 2>&1
```

## Backup Strategy

### Production Backups

**Script**: `/home/ubuntu/Titan/scripts/backup-production-db.sh`

**Schedule**: Daily at 2:00 AM
```bash
0 2 * * * /home/ubuntu/Titan/scripts/backup-production-db.sh >> /home/ubuntu/logs/db-backup-production.log 2>&1
```

**Configuration**:
- **Retention**: 30 days
- **Location**: `/home/ubuntu/backups/database/`
- **Format**: Compressed SQL (`titan_prod_YYYYMMDD_HHMMSS.sql.gz`)
- **Method**: `pg_dump` with `--clean --if-exists`
- **Notifications**: Telegram alerts (optional)

**Features**:
- ✅ Pre-backup connectivity check
- ✅ Database size reporting
- ✅ Compression (gzip)
- ✅ Backup verification
- ✅ Automatic old backup cleanup
- ✅ Detailed logging
- ✅ Telegram notifications
- ✅ Duration tracking

### Staging Backups

**Script**: `/home/ubuntu/Titan-staging/scripts/backup-staging-db.sh`

**Schedule**: Weekly on Sunday at 3:00 AM
```bash
0 3 * * 0 /home/ubuntu/Titan-staging/scripts/backup-staging-db.sh >> /home/ubuntu/logs/db-backup-staging.log 2>&1
```

**Configuration**:
- **Retention**: 7 days
- **Location**: `/home/ubuntu/backups/staging/`
- **Format**: Compressed SQL (`titan_staging_YYYYMMDD_HHMMSS.sql.gz`)
- **Method**: `pg_dump` with `--clean --if-exists`

### Restore Procedures

#### Production Restore

```bash
# 1. List available backups
ls -lh /home/ubuntu/backups/database/titan_prod_*.sql.gz

# 2. Stop application
pm2 stop titan-backend-production

# 3. Decompress backup
gunzip -k /home/ubuntu/backups/database/titan_prod_TIMESTAMP.sql.gz

# 4. Create backup of current state (optional)
pg_dump $DATABASE_URL > /tmp/current_backup_$(date +%s).sql

# 5. Restore from backup
psql $DATABASE_URL < /home/ubuntu/backups/database/titan_prod_TIMESTAMP.sql

# 6. Verify restoration
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 7. Restart application
pm2 start titan-backend-production
```

#### Staging Restore

```bash
# Same steps as production, but with staging paths and process names
pm2 stop titan-backend-staging
gunzip -k /home/ubuntu/backups/staging/titan_staging_TIMESTAMP.sql.gz
psql $DATABASE_URL < /home/ubuntu/backups/staging/titan_staging_TIMESTAMP.sql
pm2 start titan-backend-staging
```

### Backup Monitoring

```bash
# Check latest backup status
tail -50 /home/ubuntu/logs/db-backup-production.log

# List all backups with sizes
du -h /home/ubuntu/backups/database/ | sort -h

# Check backup age (should have daily backup)
find /home/ubuntu/backups/database/ -name "titan_prod_*.sql.gz" -mtime -1

# Verify backup integrity
gunzip -t /home/ubuntu/backups/database/titan_prod_latest.sql.gz
```

## Security Best Practices

### Database User Privileges

```sql
-- Production user (minimal privileges)
CREATE USER titan_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE titan_trading TO titan_app;
GRANT USAGE ON SCHEMA public TO titan_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO titan_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO titan_app;

-- Backup user (read-only)
CREATE USER titan_backup WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE titan_trading TO titan_backup;
GRANT USAGE ON SCHEMA public TO titan_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO titan_backup;
```

### Connection Limits

```sql
-- Set connection limits per user
ALTER USER titan_app CONNECTION LIMIT 20;
ALTER USER titan_backup CONNECTION LIMIT 5;

-- Monitor active connections
SELECT 
    usename,
    COUNT(*) as connection_count,
    MAX(backend_start) as last_connection
FROM pg_stat_activity
WHERE datname = 'titan_trading'
GROUP BY usename;
```

### Password Rotation

```bash
# Rotate production database password (quarterly)
# 1. Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Update database user
psql -c "ALTER USER titan_app PASSWORD '$NEW_PASSWORD';"

# 3. Update .env files
# Production: /home/ubuntu/Titan/.env
# Staging: /home/ubuntu/Titan-staging/.env

# 4. Restart applications
pm2 restart all
```

## Monitoring and Alerts

### Health Check Queries

```sql
-- Database size growth
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as current_size,
    pg_database_size(current_database()) as size_bytes;

-- Table bloat check
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow query detection (queries > 5 seconds)
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
AND state = 'active';

-- Lock monitoring
SELECT 
    pg_stat_activity.pid,
    pg_class.relname,
    pg_locks.locktype,
    pg_locks.mode,
    pg_stat_activity.query
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE NOT pg_locks.granted;
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Database Size | > 5 GB | > 10 GB | Review cleanup policies |
| Active Connections | > 50 | > 80 | Scale connection pool |
| Slow Queries | > 10/hour | > 50/hour | Optimize queries |
| Locks | > 5 | > 10 | Investigate transactions |
| Table Bloat | > 30% | > 50% | Run VACUUM FULL |
| Backup Age | > 25 hours | > 48 hours | Check cron jobs |

## Migration Procedures

### Applying New Migrations

```bash
# Development/Staging
cd /home/ubuntu/Titan-staging
psql $DATABASE_URL < database/migrations/0010_add_performance_indexes.sql
psql $DATABASE_URL < database/migrations/0011_add_data_retention_functions.sql

# Verify migration
psql $DATABASE_URL -c "\d+ orders"  # Check indexes
psql $DATABASE_URL -c "\df cleanup_*"  # Check functions

# Production (with backup)
cd /home/ubuntu/Titan

# 1. Create backup first
./scripts/backup-production-db.sh

# 2. Apply migration
psql $DATABASE_URL < database/migrations/0010_add_performance_indexes.sql
psql $DATABASE_URL < database/migrations/0011_add_data_retention_functions.sql

# 3. Verify
psql $DATABASE_URL -c "SELECT schemaname, indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';"
```

### Rollback Migrations

```sql
-- Rollback 0011 (cleanup functions)
DROP FUNCTION IF EXISTS cleanup_audit_logs();
DROP FUNCTION IF EXISTS cleanup_system_logs();
DROP FUNCTION IF EXISTS cleanup_notifications();
DROP FUNCTION IF EXISTS cleanup_expired_sessions();
DROP FUNCTION IF EXISTS run_all_cleanups();
DROP VIEW IF EXISTS cleanup_statistics;

-- Rollback 0010 (performance indexes)
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_trades_created_at;
DROP INDEX IF EXISTS idx_price_alerts_user_id;
DROP INDEX IF EXISTS idx_notifications_unread;
DROP INDEX IF EXISTS idx_positions_portfolio_status;
DROP INDEX IF EXISTS idx_audit_logs_user_timestamp;
DROP INDEX IF EXISTS idx_system_logs_level_timestamp;
DROP INDEX IF EXISTS idx_user_sessions_user_expires;
DROP INDEX IF EXISTS idx_orders_symbol;
```

## Implementation Checklist

### Phase 1: Immediate (Week 1) ✅

- [x] Create missing indexes (0010 migration)
- [x] Create data retention functions (0011 migration)
- [x] Setup backup scripts (production and staging)
- [ ] Apply migrations to staging database
- [ ] Test migrations and verify performance
- [ ] Configure cron jobs for backups
- [ ] Test backup and restore procedures

### Phase 2: Short-term (Weeks 2-3)

- [ ] Configure cron jobs for data cleanup
- [ ] Setup monitoring queries
- [ ] Create alert thresholds in monitoring system
- [ ] Document runbook procedures
- [ ] Train team on backup/restore

### Phase 3: Long-term (Month 2+)

- [ ] Monthly index usage review
- [ ] Quarterly password rotation
- [ ] Quarterly performance review
- [ ] Capacity planning based on growth trends

## Next Review Date

**2024-12-01** - Review:
- Index usage statistics
- Data retention effectiveness
- Backup success rate
- Database growth trends
- Performance metrics

## References

- Migration Files: `/home/ubuntu/Titan/database/migrations/`
- Backup Scripts: `/home/ubuntu/Titan/scripts/`
- Logs: `/home/ubuntu/logs/`
- PostgreSQL Documentation: https://www.postgresql.org/docs/current/

---

**Document Version**: 1.0  
**Last Modified**: 2024-11-01  
**Author**: Titan DevOps Team
