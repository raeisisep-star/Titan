# TITAN Monitoring System - Complete Setup ✅

## Overview
Comprehensive monitoring solution for TITAN Trading System with real-time dashboards and automated health checks.

## Monitoring Scripts

### 1. Full System Monitor (`scripts/monitor.sh`)
**Purpose**: Complete system health check with detailed reporting

**Features**:
- ✅ System Resources (CPU, Memory, Disk)
- ✅ PostgreSQL Database Status & Connections
- ✅ Redis Cache Status & Memory
- ✅ PM2 Process Management
- ✅ Nginx Web Server Status
- ✅ API Health Checks (Backend + HTTPS)
- ✅ SSL Certificate Expiry
- ✅ Network Statistics & Active Connections

**Usage**:
```bash
# Run manual check
/tmp/webapp/Titan/scripts/monitor.sh

# Schedule in cron (every hour)
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1
```

**Sample Output**:
```
╔════════════════════════════════════════════╗
║   TITAN Trading System - Monitoring       ║
║   2025-10-14 13:13:10                     ║
╚════════════════════════════════════════════╝

=== System Resources ===
✅ CPU Usage: 1.5%
✅ Memory Usage: 7%
✅ Disk Usage: 18%

=== PostgreSQL Database ===
✅ PostgreSQL Status: Running
✅ Active Connections: 1
✅ Database Size: 9361 kB

=== Redis Cache ===
✅ Redis Status: Running
✅ Memory Used: 1.06M
✅ Connected Clients: 4

=== PM2 Processes ===
✅ PM2 Processes Running: 2/2
```

### 2. Real-time Status Dashboard (`scripts/status-dashboard.sh`)
**Purpose**: Live monitoring dashboard with auto-refresh

**Features**:
- 🔄 Auto-refresh every 5 seconds
- 📊 Real-time system metrics
- 🔴 Color-coded status indicators
- 📈 Network connection stats
- 📝 Recent log tailing
- ⚡ Live API health monitoring

**Usage**:
```bash
# Start dashboard (Ctrl+C to exit)
/tmp/webapp/Titan/scripts/status-dashboard.sh
```

**Dashboard Components**:
1. **System Resources**: CPU, Memory, Disk, Load Average
2. **Services Status**: PostgreSQL, Redis, Nginx, PM2
3. **API Health**: Backend health endpoint, HTTPS status
4. **Network**: Active connections per service
5. **Recent Logs**: Last 3 lines of backend logs

## Monitoring Thresholds

### System Resources
- **CPU Warning**: > 80%
- **Memory Warning**: > 80%
- **Disk Warning**: > 85%

### Database
- **Connection Monitoring**: Active connections tracked
- **Size Monitoring**: Database growth tracked

### SSL Certificate
- **Green**: > 30 days remaining
- **Yellow Warning**: 7-30 days remaining
- **Red Critical**: < 7 days remaining

## Log Files

### Monitor Log
- **Location**: `/home/ubuntu/titan-monitor.log`
- **Content**: All monitoring check results with timestamps
- **Rotation**: Manual (configure logrotate if needed)

**View logs**:
```bash
# View full log
cat /home/ubuntu/titan-monitor.log

# Tail live
tail -f /home/ubuntu/titan-monitor.log

# View last 50 lines
tail -n 50 /home/ubuntu/titan-monitor.log

# Search for errors
grep ERROR /home/ubuntu/titan-monitor.log
```

### Backend Logs
- **Output**: `/tmp/webapp/Titan/logs/backend-out.log`
- **Errors**: `/tmp/webapp/Titan/logs/backend-error.log`
- **PM2 Logs**: `~/.pm2/logs/`

**View backend logs**:
```bash
# PM2 logs
pm2 logs titan-backend --lines 100

# Direct file access
tail -f /tmp/webapp/Titan/logs/backend-out.log
```

## Automated Monitoring Schedule

### Recommended Cron Jobs
```bash
# Edit crontab
crontab -e
```

Add these lines:
```cron
# Daily backup at 2 AM
0 2 * * * /tmp/webapp/Titan/scripts/backup.sh >> /home/ubuntu/titan-backup.log 2>&1

# Hourly system monitoring
0 * * * * /tmp/webapp/Titan/scripts/monitor.sh >> /home/ubuntu/titan-monitor.log 2>&1

# Every 5 minutes API health check (optional)
*/5 * * * * curl -s http://localhost:5000/health > /dev/null || echo "[$(date)] Backend API down!" >> /home/ubuntu/titan-alerts.log
```

## Monitoring Metrics

### Current System Status (as of last check)
```
✅ CPU Usage: 1.5% (Healthy)
✅ Memory Usage: 7% (Healthy)
✅ Disk Usage: 18% (Healthy)
✅ PostgreSQL: Running (1 connection)
✅ Redis: Running (1.06M memory, 4 clients)
✅ PM2: 2/2 instances running
✅ Backend API: Healthy (HTTP 200)
✅ HTTPS Endpoint: Accessible
⚠️  Nginx Config: Requires sudo for SSL cert access
```

### Service Ports
- **Backend API**: `5000` (HTTP)
- **PostgreSQL**: `5433`
- **Redis**: `6379`
- **Nginx**: `80` (HTTP), `443` (HTTPS)

## Alert Configuration

### Manual Alerting
The monitor script logs warnings for:
- High CPU/Memory/Disk usage
- Service failures
- API health check failures
- SSL certificate expiration warnings

### Future Email Alerts (Optional)
Configure email alerts by updating `scripts/monitor.sh`:
```bash
ALERT_EMAIL="admin@zala.ir"
```

Then install mail utilities:
```bash
sudo apt-get install mailutils
```

## Health Check Endpoints

### Backend Health
```bash
# Local check
curl http://localhost:5000/health

# Public HTTPS check
curl https://www.zala.ir/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-10-14T13:13:10.000Z",
  "version": "1.0.0"
}
```

### Individual Service Checks
```bash
# PostgreSQL
PGPASSWORD='***REDACTED***' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT NOW();"

# Redis
redis-cli -h localhost -p 6379 ping

# Nginx
systemctl status nginx

# PM2
pm2 status
```

## Performance Metrics

### Database Performance
```bash
# Active queries
PGPASSWORD='***REDACTED***' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT pid, usename, application_name, state, query FROM pg_stat_activity WHERE datname='titan_trading';"

# Database size
PGPASSWORD='***REDACTED***' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT pg_size_pretty(pg_database_size('titan_trading'));"

# Table sizes
PGPASSWORD='***REDACTED***' psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Redis Performance
```bash
# Memory stats
redis-cli -h localhost -p 6379 INFO memory

# Connection stats
redis-cli -h localhost -p 6379 INFO clients

# Keyspace info
redis-cli -h localhost -p 6379 INFO keyspace
```

### Backend Performance
```bash
# PM2 monitoring
pm2 monit

# Process details
pm2 show titan-backend

# Resource usage
pm2 list
```

## Troubleshooting

### Monitor Script Issues
```bash
# Check script permissions
ls -l /tmp/webapp/Titan/scripts/monitor.sh

# Make executable
chmod +x /tmp/webapp/Titan/scripts/monitor.sh

# Run with debug
bash -x /tmp/webapp/Titan/scripts/monitor.sh
```

### Service Down
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Restart Redis
sudo systemctl restart redis

# Restart Nginx
sudo systemctl restart nginx

# Restart Backend
pm2 restart titan-backend
```

### High Resource Usage
```bash
# Find top CPU processes
top -bn1 | head -20

# Find top memory processes
ps aux --sort=-%mem | head -10

# Check disk usage by directory
du -sh /tmp/webapp/Titan/* | sort -h
```

## Integration with External Tools (Optional)

### 1. Prometheus + Grafana
For advanced metrics and visualization:
```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
cd node_exporter-1.6.1.linux-amd64
./node_exporter &
```

### 2. Uptime Kuma
Self-hosted monitoring tool:
```bash
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

### 3. Netdata
Real-time performance monitoring:
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

## Monitoring Checklist

### Daily Checks
- [ ] Review monitoring logs
- [ ] Check backup completion
- [ ] Verify all services running
- [ ] Check API health endpoints

### Weekly Checks
- [ ] Review disk usage trends
- [ ] Check backup restoration
- [ ] Review error logs
- [ ] Verify SSL certificate status

### Monthly Checks
- [ ] Database performance analysis
- [ ] Review and optimize slow queries
- [ ] Check for security updates
- [ ] Review monitoring thresholds

## Status Summary

✅ **Monitoring System**: Fully operational
✅ **Health Checks**: All services healthy
✅ **Automated Checks**: Scripts ready for cron
✅ **Logging**: Configured and working
✅ **Dashboards**: Real-time monitoring available
⏳ **Email Alerts**: Ready for configuration (optional)
⏳ **Advanced Monitoring**: Prometheus/Grafana (optional)

## Next Steps

1. ✅ Monitoring Tools - **COMPLETED**
2. ⏳ Setup automated cron jobs for monitoring
3. ⏳ Configure email alerts (optional)
4. ⏳ Security hardening (Rate limiting, Fail2ban)
5. ⏳ Performance testing and optimization
6. ⏳ Final production deployment checklist
