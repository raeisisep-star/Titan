# 🚀 TITAN Trading System - Quick Start Guide

## 📋 Overview

This guide helps you quickly get started with the TITAN Trading System deployed on **www.zala.ir**.

---

## 🔗 Access Points

### Public URLs
- **Main Website**: https://www.zala.ir
- **Alternative**: https://zala.ir
- **Health Check**: https://www.zala.ir/health
- **API Base**: https://www.zala.ir/api

### Server Details
- **IP Address**: 188.40.209.82
- **SSH Access**: `ssh ubuntu@188.40.209.82`
- **Application Path**: `/tmp/webapp/Titan/`

---

## ⚡ Quick Commands

### Service Management

#### Check All Services
```bash
cd /tmp/webapp/Titan && scripts/monitor.sh
```

#### Restart Backend
```bash
pm2 restart titan-backend
```

#### Check Backend Status
```bash
pm2 status
pm2 logs titan-backend --lines 50
```

#### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Health Checks

#### Quick Health Check
```bash
curl https://www.zala.ir/health
```

#### Full System Check
```bash
cd /tmp/webapp/Titan && scripts/monitor.sh
```

#### Real-time Dashboard
```bash
cd /tmp/webapp/Titan && scripts/status-dashboard.sh
```
*(Press Ctrl+C to exit)*

### Backups

#### Create Manual Backup
```bash
cd /tmp/webapp/Titan && scripts/backup.sh
```

#### List Backups
```bash
ls -lh /home/ubuntu/titan-backups/
```

#### Check Backup Size
```bash
du -sh /home/ubuntu/titan-backups/
```

---

## 🔧 Initial Setup (One-time)

### 1. Setup Automated Backups

```bash
# Open crontab editor
crontab -e

# Add this line (daily backup at 2 AM):
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1

# Save and exit (Ctrl+X, then Y, then Enter)
```

### 2. Setup Automated Monitoring

```bash
# Add to crontab (hourly monitoring):
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1

# Optional: API health check every 5 minutes
*/5 * * * * curl -s http://localhost:5000/health > /dev/null || echo "[$(date)] API Down!" >> /home/ubuntu/titan-alerts.log
```

### 3. Verify Cron Jobs

```bash
# List current cron jobs
crontab -l

# Expected output:
# 0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1
# 0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1
```

---

## 📊 Monitoring Dashboard

### View Real-time Status
```bash
cd /tmp/webapp/Titan && scripts/status-dashboard.sh
```

### Key Metrics Displayed
- ✅ CPU, Memory, Disk usage
- ✅ PostgreSQL status & connections
- ✅ Redis cache status
- ✅ PM2 backend instances
- ✅ Nginx status
- ✅ API health checks
- ✅ Network connections
- ✅ Recent logs

---

## 🔍 Troubleshooting

### Backend Not Responding

```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart titan-backend

# View logs
pm2 logs titan-backend --lines 100
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT NOW();"

# Restart if needed
sudo systemctl restart postgresql
```

### Nginx Issues

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Redis Connection Issues

```bash
# Check status
sudo systemctl status redis

# Test connection
redis-cli -h localhost -p 6379 ping

# Restart if needed
sudo systemctl restart redis
```

### High Resource Usage

```bash
# Check resource usage
cd /tmp/webapp/Titan && scripts/monitor.sh

# View top processes
top -bn1 | head -20

# Check disk usage
df -h
du -sh /tmp/webapp/Titan/*
```

---

## 📝 Common Tasks

### View Logs

```bash
# Backend logs (PM2)
pm2 logs titan-backend

# Backend output log
tail -f /tmp/webapp/Titan/logs/backend-out.log

# Backend error log
tail -f /tmp/webapp/Titan/logs/backend-error.log

# Monitoring logs
tail -f /home/ubuntu/titan-monitor.log

# Backup logs
tail -f /home/ubuntu/titan-backup.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Clear Logs

```bash
# Clear PM2 logs
pm2 flush

# Clear backend logs
> /tmp/webapp/Titan/logs/backend-out.log
> /tmp/webapp/Titan/logs/backend-error.log

# Clear monitoring logs
> /home/ubuntu/titan-monitor.log
```

### Update Application Code

```bash
# Navigate to application directory
cd /tmp/webapp/Titan

# Pull latest changes (if using git)
git pull

# Install dependencies (if needed)
npm install

# Restart backend
pm2 restart titan-backend

# Verify
pm2 status
```

### Restore from Backup

#### Restore Database
```bash
cd /home/ubuntu/titan-backups

# List available backups
ls -lh db_backup_*.dump

# Restore specific backup
PGPASSWORD='Titan@2024!Strong' pg_restore \
  -h localhost -p 5433 -U titan_user \
  -d titan_trading --clean \
  db_backup_YYYYMMDD_HHMMSS.dump

# Verify restoration
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT COUNT(*) FROM users;"
```

#### Restore Application Code
```bash
cd /home/ubuntu/titan-backups

# Extract backup
tar -xzf code_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/webapp/Titan/

# Reinstall dependencies
cd /tmp/webapp/Titan
npm install

# Restart backend
pm2 restart titan-backend
```

---

## 🧪 Testing API Endpoints

### Health Check
```bash
curl https://www.zala.ir/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "redis": "connected",
#   "timestamp": "2025-10-14T13:00:00.000Z",
#   "version": "1.0.0"
# }
```

### Login (Test)
```bash
curl -X POST https://www.zala.ir/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Portfolio (with auth)
```bash
curl https://www.zala.ir/api/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Trades List
```bash
curl https://www.zala.ir/api/trades \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Dashboard Stats
```bash
curl https://www.zala.ir/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📈 Performance Monitoring

### Check Current Performance
```bash
cd /tmp/webapp/Titan && scripts/monitor.sh
```

### Database Performance
```bash
# Active connections
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT count(*) FROM pg_stat_activity WHERE datname='titan_trading';"

# Database size
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT pg_size_pretty(pg_database_size('titan_trading'));"

# Table sizes
PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

### Redis Performance
```bash
# Memory usage
redis-cli -h localhost -p 6379 INFO memory | grep used_memory_human

# Connected clients
redis-cli -h localhost -p 6379 INFO clients | grep connected_clients

# Keys count
redis-cli -h localhost -p 6379 DBSIZE
```

### Backend Performance
```bash
# PM2 detailed info
pm2 show titan-backend

# Process monitoring
pm2 monit

# Resource usage
pm2 list
```

---

## 🔐 Security Checklist

### Daily Checks
- [ ] Review monitoring logs: `tail /home/ubuntu/titan-monitor.log`
- [ ] Check failed login attempts: `sudo grep "Failed password" /var/log/auth.log`
- [ ] Verify SSL certificate: `curl -vI https://www.zala.ir 2>&1 | grep "expire"`

### Weekly Checks
- [ ] Review backup completion: `ls -lh /home/ubuntu/titan-backups/`
- [ ] Check disk usage: `df -h`
- [ ] Review error logs: `tail -100 /tmp/webapp/Titan/logs/backend-error.log`

### Monthly Checks
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review database performance
- [ ] Check SSL certificate expiry
- [ ] Test backup restoration

---

## 📞 Quick Reference

### Service Ports
- **HTTP**: 80
- **HTTPS**: 443
- **Backend**: 5000
- **PostgreSQL**: 5433
- **Redis**: 6379

### Important Paths
- **Application**: `/tmp/webapp/Titan/`
- **Backups**: `/home/ubuntu/titan-backups/`
- **Logs**: `/tmp/webapp/Titan/logs/`
- **Scripts**: `/tmp/webapp/Titan/scripts/`
- **Nginx Config**: `/etc/nginx/sites-available/titan`
- **SSL Certs**: `/etc/letsencrypt/live/zala.ir/`

### Important Files
- **Environment**: `/tmp/webapp/Titan/.env`
- **PM2 Config**: `/tmp/webapp/Titan/ecosystem.config.js`
- **Backend Server**: `/tmp/webapp/Titan/server.js`
- **Frontend Config**: `/tmp/webapp/Titan/dist/config.js`

### Useful Scripts
```bash
# Full system monitor
/tmp/webapp/Titan/scripts/monitor.sh

# Real-time dashboard
/tmp/webapp/Titan/scripts/status-dashboard.sh

# Create backup
/tmp/webapp/Titan/scripts/backup.sh
```

---

## 🆘 Emergency Procedures

### System Down - Quick Recovery

1. **Check all services**:
```bash
cd /tmp/webapp/Titan && scripts/monitor.sh
```

2. **Restart all services**:
```bash
pm2 restart all
sudo systemctl restart postgresql
sudo systemctl restart redis
sudo systemctl restart nginx
```

3. **Verify recovery**:
```bash
curl https://www.zala.ir/health
pm2 status
```

### Database Corruption - Restore from Backup

1. **Stop backend**:
```bash
pm2 stop titan-backend
```

2. **Restore database**:
```bash
cd /home/ubuntu/titan-backups
PGPASSWORD='Titan@2024!Strong' pg_restore \
  -h localhost -p 5433 -U titan_user \
  -d titan_trading --clean \
  $(ls -t db_backup_*.dump | head -1)
```

3. **Restart backend**:
```bash
pm2 restart titan-backend
```

### High Load - Scale Backend

```bash
# Increase PM2 instances
cd /tmp/webapp/Titan
pm2 scale titan-backend 4

# Verify
pm2 status
```

---

## 📚 Additional Documentation

- **DEPLOYMENT_COMPLETE.md** - Full deployment documentation
- **BACKUP_SETUP.md** - Detailed backup configuration
- **MONITORING_SETUP.md** - Complete monitoring guide
- **README.md** - Project overview

---

## ✅ Daily Operations Checklist

### Morning Check (5 minutes)
```bash
# Run system monitor
cd /tmp/webapp/Titan && scripts/monitor.sh

# Check overnight logs
tail -50 /home/ubuntu/titan-monitor.log

# Verify backups
ls -lh /home/ubuntu/titan-backups/ | tail -5
```

### Evening Check (3 minutes)
```bash
# Quick health check
curl https://www.zala.ir/health

# Check service status
pm2 status
```

---

## 🎯 Next Steps After Initial Setup

1. ✅ Complete cron job setup (backups + monitoring)
2. ⏳ Test API endpoints with real data
3. ⏳ Configure email alerts (optional)
4. ⏳ Set up log rotation
5. ⏳ Implement rate limiting
6. ⏳ Add Fail2ban for security

---

## 💡 Tips & Best Practices

1. **Always check logs first** when troubleshooting
2. **Run monitor script** before making changes
3. **Test backups regularly** by restoring to test environment
4. **Keep documentation updated** as you make changes
5. **Monitor disk usage** to avoid running out of space
6. **Review security logs** for suspicious activity
7. **Keep PM2 updated**: `npm install pm2@latest -g`

---

## 📮 Support

For issues or questions:
1. Check this Quick Start Guide
2. Review detailed documentation files
3. Check monitoring logs
4. Contact system administrator: admin@zala.ir

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Status**: 🟢 Production Ready

---

*Happy Trading! 🚀*
