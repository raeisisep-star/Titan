# 🕐 TITAN Trading System - Cron Job Setup Guide

## Overview

This guide provides step-by-step instructions for setting up automated tasks using cron jobs for the TITAN Trading System.

---

## 📋 Prerequisites

- SSH access to server: `ssh ubuntu@188.40.209.82`
- Sudo privileges (for some operations)
- Basic familiarity with Linux cron

---

## 🚀 Quick Setup (Copy-Paste Method)

### Step 1: Open Crontab Editor

```bash
crontab -e
```

**Note**: If this is your first time, you'll be asked to choose an editor. Select `nano` (option 1) for beginners.

### Step 2: Add These Lines to the End of the File

```cron
# TITAN Trading System - Automated Tasks

# Daily database and application backup at 2:00 AM UTC
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1

# Hourly system health monitoring
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1

# API health check every 5 minutes (optional)
*/5 * * * * curl -s http://localhost:5000/health > /dev/null || echo "[$(date)] Backend API Down!" >> /home/ubuntu/titan-alerts.log 2>&1

# Weekly log cleanup (every Sunday at 3:00 AM)
0 3 * * 0 find /tmp/webapp/Titan/logs -name "*.log" -mtime +30 -delete 2>&1

# Monthly backup cleanup (first day of month at 4:00 AM)
0 4 1 * * find /home/ubuntu/titan-backups -name "*backup*" -mtime +60 -delete 2>&1
```

### Step 3: Save and Exit

- **In nano**: Press `Ctrl+X`, then `Y`, then `Enter`
- **In vim**: Press `Esc`, type `:wq`, press `Enter`

### Step 4: Verify Cron Jobs

```bash
crontab -l
```

You should see all the jobs you just added.

---

## 📅 Cron Job Breakdown

### 1. Daily Backup (2:00 AM UTC)

```cron
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1
```

**What it does**:
- Runs at 2:00 AM UTC every day
- Backs up: Database, application code, Nginx config, PM2 config, environment variables
- Keeps backups for 7 days
- Logs output to `/home/ubuntu/titan-backup.log`

**Manual test**:
```bash
/tmp/webapp/Titan/scripts/backup.sh
```

**Check logs**:
```bash
tail -f /home/ubuntu/titan-backup.log
```

---

### 2. Hourly System Monitoring

```cron
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1
```

**What it does**:
- Runs every hour (at minute 0)
- Checks: CPU, Memory, Disk, PostgreSQL, Redis, PM2, Nginx, API health, SSL certificate
- Logs warnings for high resource usage
- Logs output to `/home/ubuntu/titan-monitor.log`

**Manual test**:
```bash
/tmp/webapp/Titan/scripts/monitor.sh
```

**Check logs**:
```bash
tail -f /home/ubuntu/titan-monitor.log
```

---

### 3. API Health Check (Every 5 Minutes) - Optional

```cron
*/5 * * * * curl -s http://localhost:5000/health > /dev/null || echo "[$(date)] Backend API Down!" >> /home/ubuntu/titan-alerts.log 2>&1
```

**What it does**:
- Runs every 5 minutes
- Pings backend health endpoint
- Logs alert only if API is down
- Logs to `/home/ubuntu/titan-alerts.log`

**Manual test**:
```bash
curl http://localhost:5000/health
```

**Check alerts**:
```bash
tail -f /home/ubuntu/titan-alerts.log
```

---

### 4. Weekly Log Cleanup (Sunday 3:00 AM)

```cron
0 3 * * 0 find /tmp/webapp/Titan/logs -name "*.log" -mtime +30 -delete 2>&1
```

**What it does**:
- Runs every Sunday at 3:00 AM
- Deletes log files older than 30 days
- Keeps recent logs for troubleshooting
- Prevents disk space issues

**Manual test** (dry run - shows what would be deleted):
```bash
find /tmp/webapp/Titan/logs -name "*.log" -mtime +30
```

---

### 5. Monthly Backup Cleanup (1st of Month 4:00 AM)

```cron
0 4 1 * * find /home/ubuntu/titan-backups -name "*backup*" -mtime +60 -delete 2>&1
```

**What it does**:
- Runs on the 1st day of every month at 4:00 AM
- Deletes backup files older than 60 days
- Extra safety net beyond the 7-day retention in backup script
- Prevents backup directory from growing too large

**Manual test** (dry run - shows what would be deleted):
```bash
find /home/ubuntu/titan-backups -name "*backup*" -mtime +60
```

---

## 🕰️ Cron Schedule Format

```
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Examples

```cron
# Every minute
* * * * * command

# Every 5 minutes
*/5 * * * * command

# Every hour
0 * * * * command

# Every day at midnight
0 0 * * * command

# Every day at 2:30 AM
30 2 * * * command

# Every Monday at 9 AM
0 9 * * 1 command

# First day of every month at 4 AM
0 4 1 * * command

# Every 15 minutes between 9 AM and 5 PM
*/15 9-17 * * * command
```

---

## ✅ Verification Steps

### Check Cron Service Status

```bash
systemctl status cron
```

Should show: `Active: active (running)`

### View Current Cron Jobs

```bash
crontab -l
```

### Check Cron Logs (System)

```bash
grep CRON /var/log/syslog | tail -20
```

### Monitor Cron Execution

```bash
# Watch for cron executions in real-time
tail -f /var/log/syslog | grep CRON
```

---

## 📊 Testing Cron Jobs

### Test Before Scheduling

Before adding to cron, test each command manually:

```bash
# Test backup script
/tmp/webapp/Titan/scripts/backup.sh

# Test monitor script
/tmp/webapp/Titan/scripts/monitor.sh

# Test API health check
curl -s http://localhost:5000/health > /dev/null || echo "API Down!"
```

### Force Immediate Cron Run (for testing)

You can't directly force a cron job, but you can temporarily change the schedule:

```bash
# Edit crontab
crontab -e

# Change schedule to run in next minute
# For example, if current time is 14:35, set:
36 14 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1

# Wait one minute, check logs
tail /home/ubuntu/titan-backup.log

# Change back to original schedule
```

---

## 🔍 Troubleshooting

### Cron Job Not Running

**1. Check if cron service is running**:
```bash
systemctl status cron
```

**2. Start cron if stopped**:
```bash
sudo systemctl start cron
sudo systemctl enable cron
```

**3. Check system logs for errors**:
```bash
grep CRON /var/log/syslog | tail -50
```

**4. Verify script permissions**:
```bash
ls -l /tmp/webapp/Titan/scripts/
# All scripts should be executable (-rwxrwxr-x)
```

**5. Make scripts executable if needed**:
```bash
chmod +x /tmp/webapp/Titan/scripts/*.sh
```

### Script Runs Manually But Not Via Cron

**Issue**: PATH and environment variables differ in cron

**Solution**: Use absolute paths in cron jobs

```cron
# Bad (might not work in cron)
0 2 * * * backup.sh

# Good (will work)
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh
```

### No Output in Log Files

**1. Check log file permissions**:
```bash
ls -l /home/ubuntu/titan-*.log
```

**2. Create log files if they don't exist**:
```bash
touch /home/ubuntu/titan-backup.log
touch /home/ubuntu/titan-monitor.log
touch /home/ubuntu/titan-alerts.log
chmod 644 /home/ubuntu/titan-*.log
```

**3. Test output redirection manually**:
```bash
echo "test" >> /home/ubuntu/titan-backup.log
cat /home/ubuntu/titan-backup.log
```

### Cron Emails

If you receive cron emails with errors:

**View mail**:
```bash
mail
```

**Disable email notifications** (add to top of crontab):
```cron
MAILTO=""
```

**Or redirect to log file instead**:
```cron
MAILTO=/home/ubuntu/cron-errors.log
```

---

## 📧 Email Alerts (Advanced - Optional)

### Setup Email Notifications

**1. Install mail utilities**:
```bash
sudo apt-get update
sudo apt-get install mailutils ssmtp
```

**2. Configure SSMTP** (edit `/etc/ssmtp/ssmtp.conf`):
```bash
sudo nano /etc/ssmtp/ssmtp.conf
```

Add:
```ini
root=your-email@example.com
mailhub=smtp.gmail.com:587
AuthUser=your-email@gmail.com
AuthPass=your-app-password
UseSTARTTLS=YES
```

**3. Test email**:
```bash
echo "Test email from TITAN" | mail -s "Test" your-email@example.com
```

**4. Add email alerts to cron jobs**:
```cron
# Backup with email notification
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1 || echo "Backup failed on $(date)" | mail -s "TITAN Backup Failed" admin@example.com
```

---

## 📈 Monitoring Cron Jobs

### View Recent Cron Executions

```bash
# Last 50 cron executions
grep CRON /var/log/syslog | tail -50

# Filter for specific job
grep "backup.sh" /var/log/syslog | tail -20
```

### Check Last Run Time

```bash
# Backup log last modified time
ls -l /home/ubuntu/titan-backup.log

# Monitor log last modified time
ls -l /home/ubuntu/titan-monitor.log
```

### View Job Output

```bash
# View full backup log
cat /home/ubuntu/titan-backup.log

# View last 50 lines
tail -50 /home/ubuntu/titan-backup.log

# Follow in real-time
tail -f /home/ubuntu/titan-backup.log

# Search for errors
grep -i error /home/ubuntu/titan-backup.log
grep -i failed /home/ubuntu/titan-backup.log
```

---

## 🎛️ Advanced Cron Configuration

### Set Environment Variables

Add to top of crontab:

```cron
# Environment variables
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAILTO=""

# Your cron jobs here...
```

### Run Multiple Commands

```cron
# Chain commands with &&
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh && curl -X POST https://healthcheck.io/ping/YOUR-UUID

# Run in background
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh &
```

### Conditional Execution

```cron
# Run only if file exists
0 2 * * * [ -f /tmp/webapp/Titan/scripts/backup.sh ] && /tmp/webapp/Titan/scripts/backup.sh
```

---

## 📋 Cron Job Checklist

Before finalizing your cron setup:

- [ ] All scripts are executable: `chmod +x /tmp/webapp/Titan/scripts/*.sh`
- [ ] Test each script manually first
- [ ] Log directories exist and are writable
- [ ] Cron service is running: `systemctl status cron`
- [ ] Cron jobs are added: `crontab -l`
- [ ] Log files are being created
- [ ] Check system logs for errors: `grep CRON /var/log/syslog`
- [ ] Wait for first scheduled run and verify
- [ ] Document any custom changes

---

## 🚨 Emergency: Disable All Cron Jobs

If something goes wrong:

```bash
# Remove all cron jobs (CAREFUL!)
crontab -r

# Or edit and comment out all jobs
crontab -e
# Add # at the start of each line

# Or stop cron service temporarily
sudo systemctl stop cron
```

To restore:
```bash
# Start cron service
sudo systemctl start cron

# Re-add jobs using the Quick Setup section above
crontab -e
```

---

## 📝 Recommended Cron Schedule Summary

| Task | Schedule | Time (UTC) | Frequency |
|------|----------|------------|-----------|
| Backup | `0 2 * * *` | 2:00 AM | Daily |
| Monitoring | `0 * * * *` | Every hour | Hourly |
| API Health | `*/5 * * * *` | Every 5 min | Every 5 min |
| Log Cleanup | `0 3 * * 0` | 3:00 AM | Weekly (Sun) |
| Backup Cleanup | `0 4 1 * *` | 4:00 AM | Monthly (1st) |

---

## 💡 Best Practices

1. **Always test scripts manually before adding to cron**
2. **Use absolute paths** in cron commands
3. **Redirect output to log files** for debugging
4. **Set appropriate retention policies** to prevent disk fill
5. **Monitor cron logs regularly** for failures
6. **Document any custom cron jobs** you add
7. **Use comments** in crontab for clarity
8. **Schedule resource-intensive jobs** during low-traffic hours
9. **Stagger multiple jobs** to avoid overlapping execution
10. **Keep backups of your crontab**: `crontab -l > ~/crontab.backup`

---

## 🔗 Related Documentation

- **QUICK_START.md** - Quick reference guide
- **BACKUP_SETUP.md** - Backup system details
- **MONITORING_SETUP.md** - Monitoring configuration
- **DEPLOYMENT_COMPLETE.md** - Full deployment guide

---

## ✅ Quick Verification Commands

After setup, run these to verify everything works:

```bash
# 1. Check cron service
systemctl status cron

# 2. List your cron jobs
crontab -l

# 3. Test backup script
/tmp/webapp/Titan/scripts/backup.sh

# 4. Test monitor script
/tmp/webapp/Titan/scripts/monitor.sh

# 5. Check log files exist
ls -lh /home/ubuntu/titan-*.log

# 6. Watch for cron executions
grep CRON /var/log/syslog | tail -20
```

---

**Setup Complete!** ✅

Your TITAN Trading System now has automated backups, monitoring, and maintenance tasks running 24/7.

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0
