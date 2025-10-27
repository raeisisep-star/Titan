#!/bin/bash
#
# Daily PostgreSQL Database Backup Script
# Usage: Add to crontab: 0 2 * * * /home/ubuntu/Titan/scripts/backup-database.sh
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    set -a
    source "${PROJECT_DIR}/.env"
    set +a
fi

# Database credentials from .env
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_USER="${DB_USER:-titan_user}"
DB_NAME="${DB_NAME:-titan_trading}"
DB_PASSWORD="${DB_PASSWORD}"

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/titan_trading_${DATE}.dump"
BACKUP_LOG="${BACKUP_DIR}/backup_${DATE}.log"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "=== Database Backup Started: $(date) ===" | tee "$BACKUP_LOG"
echo "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}" | tee -a "$BACKUP_LOG"

# Perform backup
export PGPASSWORD="$DB_PASSWORD"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=custom \
    --compress=9 \
    --verbose \
    --file="$BACKUP_FILE" 2>&1 | tee -a "$BACKUP_LOG"; then
    
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup successful: $BACKUP_FILE ($BACKUP_SIZE)" | tee -a "$BACKUP_LOG"
    
    # Create latest symlink
    ln -sf "$BACKUP_FILE" "${BACKUP_DIR}/latest.dump"
    
    # Cleanup old backups (keep last 30 days)
    echo "Cleaning up backups older than ${RETENTION_DAYS} days..." | tee -a "$BACKUP_LOG"
    find "$BACKUP_DIR" -name "titan_trading_*.dump" -type f -mtime +${RETENTION_DAYS} -delete
    find "$BACKUP_DIR" -name "backup_*.log" -type f -mtime +${RETENTION_DAYS} -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "titan_trading_*.dump" -type f | wc -l)
    echo "Total backups retained: $BACKUP_COUNT" | tee -a "$BACKUP_LOG"
    
else
    echo "❌ Backup failed! Check log: $BACKUP_LOG" | tee -a "$BACKUP_LOG"
    exit 1
fi

echo "=== Database Backup Completed: $(date) ===" | tee -a "$BACKUP_LOG"

# Optional: Send notification (uncomment if needed)
# curl -X POST "https://your-webhook-url.com" \
#   -H "Content-Type: application/json" \
#   -d "{\"text\": \"Database backup completed: $BACKUP_FILE ($BACKUP_SIZE)\"}"

exit 0
