#!/bin/bash
#
# TITAN Health Dashboard
# Shows real-time health status of all services
#
# Usage: ./scripts/health-dashboard.sh
#

clear

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 TITAN Trading Platform - Health Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📅 Time: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

# Check PM2 processes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 PM2 Processes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list | grep -A 1 "titan-backend"
echo ""

# Check backend health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥 Backend Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s http://127.0.0.1:5000/api/health/full 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$HEALTH_RESPONSE" ]; then
    OVERALL=$(echo "$HEALTH_RESPONSE" | jq -r '.data.overallStatus // "unknown"')
    VERSION=$(echo "$HEALTH_RESPONSE" | jq -r '.data.version // "unknown"')
    UPTIME=$(echo "$HEALTH_RESPONSE" | jq -r '.data.uptime // "unknown"')
    
    echo "Overall Status: $OVERALL"
    echo "Version: $VERSION"
    echo "Uptime: $UPTIME"
    echo ""
    echo "Services:"
    echo "$HEALTH_RESPONSE" | jq -r '.data.services[] | "  " + .icon + " " + .name + ": " + .status + " - " + .details'
else
    echo "❌ Unable to reach backend on http://127.0.0.1:5000"
fi
echo ""

# Check database
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  PostgreSQL Database"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
DB_PORT=$(ss -ltn | grep ':5433' | wc -l)
if [ $DB_PORT -gt 0 ]; then
    echo "✅ PostgreSQL listening on port 5433 (localhost only)"
    
    # Try to get database info
    DB_INFO=$(PGPASSWORD='***REDACTED***' psql -U titan_user -h localhost -p 5433 -d titan_trading -t -c "SELECT pg_database_size(current_database())/1024/1024 || 'MB' as size, (SELECT count(*) FROM pg_tables WHERE schemaname='public') as tables;" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "Database Info: $DB_INFO"
    fi
else
    echo "❌ PostgreSQL not listening on port 5433"
fi
echo ""

# Check Nginx
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Nginx Web Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
echo "Status: $NGINX_STATUS"

if [ "$NGINX_STATUS" = "active" ]; then
    NGINX_CONFIG=$(nginx -t 2>&1 | grep "syntax is ok" | wc -l)
    if [ $NGINX_CONFIG -gt 0 ]; then
        echo "✅ Configuration: Valid"
    else
        echo "⚠️  Configuration: Check needed"
    fi
fi
echo ""

# Check SSL certificate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SSL Certificate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/etc/ssl/cloudflare/zala.ir.origin.fullchain.crt" ]; then
    CERT_EXPIRY=$(openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt -noout -enddate 2>/dev/null | cut -d= -f2)
    echo "Certificate: ✅ Installed"
    echo "Expires: $CERT_EXPIRY"
else
    echo "❌ Certificate not found"
fi
echo ""

# Check recent uptime logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Recent Uptime Checks (Last 5)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/home/ubuntu/Titan/logs/uptime-monitor.log" ]; then
    tail -5 /home/ubuntu/Titan/logs/uptime-monitor.log
else
    echo "No uptime logs yet (will appear after first cron run)"
fi
echo ""

# Check disk usage
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Disk Usage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h / | grep -v "Filesystem"
echo ""

# Check memory
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧠 Memory Usage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
free -h | grep -E "^Mem|^Swap"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 Public Health Check: https://www.zala.ir/api/health/full"
echo "🔄 Auto-refresh: watch -n 5 /home/ubuntu/Titan/scripts/health-dashboard.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
