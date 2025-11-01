#!/usr/bin/env bash
set -euo pipefail

LOG="/home/ubuntu/Titan/logs/pg-weekly-report.log"
PG_URI="$(grep ^DATABASE_URL /home/ubuntu/Titan/.env | cut -d= -f2-)"
ALERT="/home/ubuntu/Titan/scripts/send_telegram.sh"

{
  echo "===== PostgreSQL Weekly Report $(date -u) ====="
  echo ""
  
  echo "-- Top 10 Slow Queries (by mean time)"
  psql "$PG_URI" -c "SELECT 
    substring(query, 1, 80) AS query_preview,
    calls,
    round(mean_exec_time::numeric, 2) AS mean_ms,
    round(max_exec_time::numeric, 2) AS max_ms,
    round(total_exec_time::numeric, 2) AS total_ms
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;" 2>&1 || echo "pg_stat_statements not available"
  
  echo ""
  echo "-- Top 10 Most Called Queries"
  psql "$PG_URI" -c "SELECT 
    substring(query, 1, 80) AS query_preview,
    calls,
    round(mean_exec_time::numeric, 2) AS mean_ms
  FROM pg_stat_statements 
  ORDER BY calls DESC 
  LIMIT 10;" 2>&1 || echo "pg_stat_statements not available"
  
  echo ""
  echo "-- Table Sizes (Top 10)"
  psql "$PG_URI" -c "SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS indexes_size
  FROM pg_catalog.pg_statio_user_tables 
  ORDER BY pg_total_relation_size(relid) DESC 
  LIMIT 10;"
  
  echo ""
  echo "-- Index Usage Statistics (Top 10)"
  psql "$PG_URI" -c "SELECT 
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC 
  LIMIT 10;"
  
  echo ""
  echo "-- Unused Indexes (idx_scan = 0)"
  psql "$PG_URI" -c "SELECT 
    relname AS table_name,
    indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS wasted_size
  FROM pg_stat_user_indexes 
  WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
  )
  ORDER BY pg_relation_size(indexrelid) DESC;"
  
  echo ""
  echo "-- Database Size"
  psql "$PG_URI" -c "SELECT 
    pg_database.datname AS database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
  FROM pg_database 
  WHERE datname = current_database();"
  
  echo ""
  echo "===== End of Report ====="
  
} >> "$LOG" 2>&1

# Send Telegram notification
"$ALERT" "📊 PostgreSQL Weekly Report generated - Check logs"

echo "Report written to $LOG"
