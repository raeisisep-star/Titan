#!/bin/bash
# =============================================================================
# Production Database Backup Script
# =============================================================================
# Description: Creates compressed backup of production database
# Retention: 30 days
# Schedule: Daily at 2:00 AM (via cron)
# Usage: ./backup-production-db.sh
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURATION
# =============================================================================

# Database connection (read from environment)
DATABASE_URL="${DATABASE_URL:-}"
DB_NAME="${DB_NAME:-titan_trading}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"

# Backup configuration
BACKUP_DIR="/home/ubuntu/backups/database"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="titan_prod_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
LOG_FILE="/home/ubuntu/logs/db-backup-production.log"

# Telegram notification (optional)
TELEGRAM_TOKEN="${TELEGRAM_ALERT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
ENABLE_TELEGRAM="${ENABLE_TELEGRAM_BACKUP_ALERTS:-false}"

# =============================================================================
# FUNCTIONS
# =============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

send_telegram_notification() {
    local message="$1"
    
    if [[ "$ENABLE_TELEGRAM" == "true" ]] && [[ -n "$TELEGRAM_TOKEN" ]] && [[ -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${message}" \
            -d "parse_mode=HTML" \
            > /dev/null 2>&1 || true
    fi
}

cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    find "$BACKUP_DIR" -name "titan_prod_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    local deleted_count=$(find "$BACKUP_DIR" -name "titan_prod_*.sql.gz" -type f -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)
    log "Deleted ${deleted_count} old backup(s)"
}

get_database_size() {
    if [[ -n "$DATABASE_URL" ]]; then
        psql "$DATABASE_URL" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs || echo "Unknown"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));" 2>/dev/null | xargs || echo "Unknown"
    fi
}

verify_backup() {
    local backup_file="$1"
    
    # Check if file exists
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file does not exist: $backup_file"
        return 1
    fi
    
    # Check if file is not empty
    if [[ ! -s "$backup_file" ]]; then
        error "Backup file is empty: $backup_file"
        return 1
    fi
    
    # Check if file is valid gzip
    if ! gzip -t "$backup_file" 2>/dev/null; then
        error "Backup file is not a valid gzip file: $backup_file"
        return 1
    fi
    
    local backup_size=$(du -h "$backup_file" | cut -f1)
    log "Backup verification passed (size: $backup_size)"
    return 0
}

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================

log "=========================================="
log "Starting Production Database Backup"
log "=========================================="

# Check if backup directory exists
if [[ ! -d "$BACKUP_DIR" ]]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Check if log directory exists
LOG_DIR=$(dirname "$LOG_FILE")
if [[ ! -d "$LOG_DIR" ]]; then
    mkdir -p "$LOG_DIR"
fi

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump not found. Please install postgresql-client"
    send_telegram_notification "🔴 <b>Production Backup Failed</b>%0A%0Apg_dump not found on server"
    exit 1
fi

# Check database connectivity
log "Checking database connectivity..."
if [[ -n "$DATABASE_URL" ]]; then
    if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        error "Cannot connect to database using DATABASE_URL"
        send_telegram_notification "🔴 <b>Production Backup Failed</b>%0A%0ACannot connect to database"
        exit 1
    fi
else
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        error "Cannot connect to database at $DB_HOST:$DB_PORT"
        send_telegram_notification "🔴 <b>Production Backup Failed</b>%0A%0ACannot connect to database"
        exit 1
    fi
fi

log "Database connection successful"

# Get database size
DB_SIZE=$(get_database_size)
log "Database size: $DB_SIZE"

# =============================================================================
# BACKUP EXECUTION
# =============================================================================

log "Starting backup to: $BACKUP_PATH"
START_TIME=$(date +%s)

# Create backup
if [[ -n "$DATABASE_URL" ]]; then
    pg_dump "$DATABASE_URL" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > "$BACKUP_PATH" 2>> "$LOG_FILE"
else
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        > "$BACKUP_PATH" 2>> "$LOG_FILE"
fi

BACKUP_STATUS=$?

if [[ $BACKUP_STATUS -ne 0 ]]; then
    error "pg_dump failed with exit code: $BACKUP_STATUS"
    send_telegram_notification "🔴 <b>Production Backup Failed</b>%0A%0Apg_dump exit code: $BACKUP_STATUS"
    exit 1
fi

log "Backup completed successfully"

# Compress backup
log "Compressing backup..."
gzip -f "$BACKUP_PATH"
COMPRESSED_BACKUP="${BACKUP_PATH}.gz"

# Verify backup
if ! verify_backup "$COMPRESSED_BACKUP"; then
    error "Backup verification failed"
    send_telegram_notification "🔴 <b>Production Backup Failed</b>%0A%0AVerification failed"
    exit 1
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Get final backup size
BACKUP_SIZE=$(du -h "$COMPRESSED_BACKUP" | cut -f1)

log "Backup compressed successfully"
log "Final backup size: $BACKUP_SIZE"
log "Backup duration: ${DURATION}s"

# =============================================================================
# CLEANUP
# =============================================================================

cleanup_old_backups

# =============================================================================
# SUMMARY
# =============================================================================

# Count total backups
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "titan_prod_*.sql.gz" -type f | wc -l)

log "=========================================="
log "Backup Summary:"
log "  Database: $DB_NAME"
log "  Database Size: $DB_SIZE"
log "  Backup File: $BACKUP_FILE.gz"
log "  Backup Size: $BACKUP_SIZE"
log "  Duration: ${DURATION}s"
log "  Total Backups: $TOTAL_BACKUPS"
log "  Retention: $RETENTION_DAYS days"
log "=========================================="

# Send success notification
if [[ "$ENABLE_TELEGRAM" == "true" ]]; then
    send_telegram_notification "✅ <b>Production Backup Successful</b>%0A%0A📊 Database: <code>$DB_NAME</code>%0A💾 Size: $BACKUP_SIZE%0A⏱ Duration: ${DURATION}s%0A📦 Total Backups: $TOTAL_BACKUPS"
fi

log "Production database backup completed successfully"

exit 0

# =============================================================================
# CRON JOB SETUP
# =============================================================================
# Add to crontab (production server):
# 0 2 * * * /home/ubuntu/Titan/scripts/backup-production-db.sh >> /home/ubuntu/logs/db-backup-production.log 2>&1
#
# Alternative with explicit environment:
# 0 2 * * * cd /home/ubuntu/Titan && source .env && ./scripts/backup-production-db.sh
# =============================================================================

# =============================================================================
# RESTORE INSTRUCTIONS
# =============================================================================
# To restore from backup:
#
# 1. List available backups:
#    ls -lh /home/ubuntu/backups/database/titan_prod_*.sql.gz
#
# 2. Decompress backup:
#    gunzip -k /home/ubuntu/backups/database/titan_prod_TIMESTAMP.sql.gz
#
# 3. Restore to database:
#    psql $DATABASE_URL < /home/ubuntu/backups/database/titan_prod_TIMESTAMP.sql
#
# 4. Verify restoration:
#    psql $DATABASE_URL -c "\dt"
#
# =============================================================================
