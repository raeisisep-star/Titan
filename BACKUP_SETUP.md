# TITAN Backup System - Setup Complete ✅

## Backup Script Location
- **Script**: `/tmp/webapp/Titan/scripts/backup.sh`
- **Backup Directory**: `/home/ubuntu/titan-backups/`
- **Log File**: `/home/ubuntu/titan-backup.log`

## What Gets Backed Up

### 1. PostgreSQL Database (44 KB)
- Database: `titan_trading`
- Port: `5433`
- User: `titan_user`
- Format: PostgreSQL custom compressed dump
- File: `db_backup_YYYYMMDD_HHMMSS.dump`

### 2. Application Code (5.9 MB)
- Directory: `/tmp/webapp/Titan`
- Excludes: `node_modules`, `.wrangler`, `logs`, `dist`
- Format: Compressed tarball
- File: `code_backup_YYYYMMDD_HHMMSS.tar.gz`

### 3. Nginx Configuration (1.5 KB)
- File: `/etc/nginx/sites-available/titan`
- SSL Certs: `/etc/letsencrypt/live/zala.ir/`
- File: `nginx_config_YYYYMMDD_HHMMSS.tar.gz`

### 4. PM2 Configuration (555 bytes)
- File: `/tmp/webapp/Titan/ecosystem.config.js`
- PM2 Process List saved
- File: `ecosystem_YYYYMMDD_HHMMSS.config.js`

### 5. Environment Variables (2.1 KB)
- File: `/tmp/webapp/Titan/.env`
- Contains: Database URLs, JWT secrets, Redis config
- File: `env_YYYYMMDD_HHMMSS.backup`

## Manual Backup Command
```bash
/tmp/webapp/Titan/scripts/backup.sh
```

## Automated Daily Backups (Cron)

### Setup Cron Job (Run as ubuntu user)
```bash
crontab -e
```

Add this line:
```
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1
```

This runs backup daily at 2:00 AM UTC.

### Verify Cron Job
```bash
crontab -l
```

## Backup Retention
- **Retention Period**: 7 days
- Old backups are automatically deleted
- Cleanup runs at end of each backup

## Restore Procedures

### 1. Restore Database
```bash
cd /home/ubuntu/titan-backups

# List available backups
ls -lh db_backup_*.dump

# Restore specific backup
PGPASSWORD='Titan@2024!Strong' pg_restore \
  -h localhost -p 5433 -U titan_user \
  -d titan_trading \
  --clean \
  db_backup_YYYYMMDD_HHMMSS.dump
```

### 2. Restore Application Code
```bash
cd /home/ubuntu/titan-backups

# Extract code backup
tar -xzf code_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/webapp/Titan/

# Reinstall dependencies
cd /tmp/webapp/Titan
npm install

# Restart services
pm2 restart all
```

### 3. Restore Nginx Configuration
```bash
cd /home/ubuntu/titan-backups

# Extract and copy nginx config (requires sudo)
sudo tar -xzf nginx_config_YYYYMMDD_HHMMSS.tar.gz -C /

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Restore Environment Files
```bash
cd /home/ubuntu/titan-backups

# Restore .env file
cp env_YYYYMMDD_HHMMSS.backup /tmp/webapp/Titan/.env

# Restore PM2 config
cp ecosystem_YYYYMMDD_HHMMSS.config.js /tmp/webapp/Titan/ecosystem.config.js

# Restart PM2 services
pm2 restart all
```

## Backup Verification

### Check Latest Backup
```bash
ls -lht /home/ubuntu/titan-backups/ | head -10
```

### Verify Database Backup Integrity
```bash
cd /home/ubuntu/titan-backups
pg_restore --list db_backup_*.dump
```

### Check Total Backup Size
```bash
du -sh /home/ubuntu/titan-backups/
```

### View Backup Logs
```bash
tail -f /home/ubuntu/titan-backup.log
```

## Backup Testing

### Test Backup Script
```bash
cd /tmp/webapp/Titan
bash scripts/backup.sh
```

### Test Database Restore (Dry Run)
```bash
cd /home/ubuntu/titan-backups
pg_restore --list db_backup_*.dump
```

## Security Notes

1. **Backup Directory Permissions**: Only `ubuntu` user has access
2. **Database Credentials**: Stored in backup script (protect file permissions)
3. **Environment Backups**: Contain sensitive keys (secure backup directory)
4. **SSL Certificates**: Backed up but may need sudo for restoration

## Troubleshooting

### Backup Script Fails
```bash
# Check script permissions
ls -l /tmp/webapp/Titan/scripts/backup.sh

# Make executable if needed
chmod +x /tmp/webapp/Titan/scripts/backup.sh

# Check backup directory exists
ls -ld /home/ubuntu/titan-backups
```

### Database Backup Fails
```bash
# Test PostgreSQL connection
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT NOW();"

# Check PostgreSQL is running
systemctl status postgresql
```

### Cron Job Not Running
```bash
# Check cron service
systemctl status cron

# View cron logs
grep CRON /var/log/syslog

# Test cron job manually
/tmp/webapp/Titan/scripts/backup.sh
```

## Backup Status Summary

✅ **Backup script created and tested**
✅ **Manual backup successful** (5.9 MB total)
✅ **All 5 components backed up**: Database, Code, Nginx, PM2, Environment
✅ **7-day retention policy implemented**
✅ **Backup restoration procedures documented**
⏳ **Cron job ready for setup** (requires user to run `crontab -e`)

## Next Steps

1. ✅ Backup Automation - **COMPLETED**
2. ⏳ Setup Monitoring Tools (Grafana/Prometheus or alternatives)
3. ⏳ Security Hardening (Rate limiting, Fail2ban)
4. ⏳ Performance Testing
5. ⏳ Final Production Checklist
