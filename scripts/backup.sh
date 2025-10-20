#!/bin/bash
# TITAN Trading System - Automated Backup Script

# Configuration
BACKUP_DIR="/home/ubuntu/titan-backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="titan_trading"
DB_USER="titan_user"
DB_HOST="localhost"
DB_PORT="5433"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "=== TITAN Backup Started at $(date) ==="

# 1. Database Backup
echo "📊 Backing up PostgreSQL database..."
PGPASSWORD='Titan@2024!Strong' pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F c \
  -f "$BACKUP_DIR/db_backup_$DATE.dump"

if [ $? -eq 0 ]; then
    echo "✅ Database backup completed: db_backup_$DATE.dump"
else
    echo "❌ Database backup failed!"
fi

# 2. Application Code Backup
echo "📦 Backing up application code..."
tar -czf "$BACKUP_DIR/code_backup_$DATE.tar.gz" \
  -C /tmp/webapp/Titan \
  --exclude='node_modules' \
  --exclude='.wrangler' \
  --exclude='logs' \
  --exclude='dist' \
  .

if [ $? -eq 0 ]; then
    echo "✅ Code backup completed: code_backup_$DATE.tar.gz"
else
    echo "❌ Code backup failed!"
fi

# 3. Nginx Configuration Backup
echo "⚙️  Backing up Nginx configuration..."
# Copy nginx config if readable
if [ -r /etc/nginx/sites-available/titan ]; then
    cp /etc/nginx/sites-available/titan "$BACKUP_DIR/nginx_titan_$DATE.conf" 2>/dev/null
    echo "✅ Nginx config backup completed"
else
    echo "⚠️  Nginx config backup skipped (requires sudo)"
fi

# 4. PM2 Configuration Backup
echo "🔧 Backing up PM2 configuration..."
cp /tmp/webapp/Titan/ecosystem.config.js "$BACKUP_DIR/ecosystem_$DATE.config.js"
pm2 save

# 5. Environment Variables Backup
echo "🔐 Backing up environment files..."
cp /tmp/webapp/Titan/.env "$BACKUP_DIR/env_$DATE.backup"

# Clean old backups (keep last 7 days)
echo "🗑️  Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "db_backup_*" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "code_backup_*" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "nginx_config_*" -mtime +$RETENTION_DAYS -delete

# Backup Summary
echo ""
echo "=== Backup Summary ==="
ls -lh "$BACKUP_DIR" | grep "$DATE"
echo ""
echo "💾 Total backup size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "✅ Backup completed at $(date)"
