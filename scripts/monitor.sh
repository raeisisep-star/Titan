#!/bin/bash
# TITAN Trading System - System Monitoring Script

# Configuration
MONITOR_LOG="/home/ubuntu/titan-monitor.log"
ALERT_EMAIL="admin@zala.ir"  # Update with actual email
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MONITOR_LOG"
}

# Function to check system resources
check_system_resources() {
    echo -e "\n${GREEN}=== System Resources ===${NC}"
    
    # CPU Usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    CPU_USAGE_INT=${CPU_USAGE%.*}
    
    if [ "$CPU_USAGE_INT" -gt "$CPU_THRESHOLD" ]; then
        echo -e "${RED}⚠️  CPU Usage: ${CPU_USAGE}% (Threshold: ${CPU_THRESHOLD}%)${NC}"
        log_message "WARNING: High CPU usage: ${CPU_USAGE}%"
    else
        echo -e "${GREEN}✅ CPU Usage: ${CPU_USAGE}%${NC}"
    fi
    
    # Memory Usage
    MEMORY_INFO=$(free | grep Mem)
    TOTAL_MEM=$(echo $MEMORY_INFO | awk '{print $2}')
    USED_MEM=$(echo $MEMORY_INFO | awk '{print $3}')
    MEMORY_USAGE=$((USED_MEM * 100 / TOTAL_MEM))
    
    if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
        echo -e "${RED}⚠️  Memory Usage: ${MEMORY_USAGE}% (Threshold: ${MEMORY_THRESHOLD}%)${NC}"
        log_message "WARNING: High memory usage: ${MEMORY_USAGE}%"
    else
        echo -e "${GREEN}✅ Memory Usage: ${MEMORY_USAGE}%${NC}"
    fi
    
    # Disk Usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
        echo -e "${RED}⚠️  Disk Usage: ${DISK_USAGE}% (Threshold: ${DISK_THRESHOLD}%)${NC}"
        log_message "WARNING: High disk usage: ${DISK_USAGE}%"
    else
        echo -e "${GREEN}✅ Disk Usage: ${DISK_USAGE}%${NC}"
    fi
}

# Function to check PostgreSQL
check_postgresql() {
    echo -e "\n${GREEN}=== PostgreSQL Database ===${NC}"
    
    # Check if PostgreSQL is running
    PG_STATUS=$(systemctl is-active postgresql 2>/dev/null || echo "unknown")
    
    if [ "$PG_STATUS" = "active" ]; then
        echo -e "${GREEN}✅ PostgreSQL Status: Running${NC}"
        
        # Check database connections
        DB_CONNECTIONS=$(PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='titan_trading';" 2>/dev/null | xargs)
        
        if [ ! -z "$DB_CONNECTIONS" ]; then
            echo -e "${GREEN}✅ Active Connections: ${DB_CONNECTIONS}${NC}"
            log_message "PostgreSQL: ${DB_CONNECTIONS} active connections"
        else
            echo -e "${YELLOW}⚠️  Cannot query database connections${NC}"
        fi
        
        # Database size
        DB_SIZE=$(PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -t -c "SELECT pg_size_pretty(pg_database_size('titan_trading'));" 2>/dev/null | xargs)
        
        if [ ! -z "$DB_SIZE" ]; then
            echo -e "${GREEN}✅ Database Size: ${DB_SIZE}${NC}"
        fi
        
    else
        echo -e "${RED}❌ PostgreSQL Status: Not Running${NC}"
        log_message "ERROR: PostgreSQL is not running!"
    fi
}

# Function to check Redis
check_redis() {
    echo -e "\n${GREEN}=== Redis Cache ===${NC}"
    
    # Check if Redis is running
    REDIS_PING=$(redis-cli -h localhost -p 6379 ping 2>/dev/null)
    
    if [ "$REDIS_PING" = "PONG" ]; then
        echo -e "${GREEN}✅ Redis Status: Running${NC}"
        
        # Get Redis info
        REDIS_MEMORY=$(redis-cli -h localhost -p 6379 INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        REDIS_CONNECTED=$(redis-cli -h localhost -p 6379 INFO clients 2>/dev/null | grep "connected_clients" | cut -d: -f2 | tr -d '\r')
        
        echo -e "${GREEN}✅ Memory Used: ${REDIS_MEMORY}${NC}"
        echo -e "${GREEN}✅ Connected Clients: ${REDIS_CONNECTED}${NC}"
        log_message "Redis: ${REDIS_MEMORY} memory, ${REDIS_CONNECTED} clients"
    else
        echo -e "${RED}❌ Redis Status: Not Running${NC}"
        log_message "ERROR: Redis is not running!"
    fi
}

# Function to check PM2 processes
check_pm2() {
    echo -e "\n${GREEN}=== PM2 Processes ===${NC}"
    
    # Check if PM2 is installed
    if command -v pm2 &> /dev/null; then
        PM2_STATUS=$(pm2 jlist 2>/dev/null)
        
        if [ ! -z "$PM2_STATUS" ]; then
            # Get PM2 process count
            PM2_COUNT=$(echo "$PM2_STATUS" | jq '. | length' 2>/dev/null || echo "0")
            PM2_RUNNING=$(echo "$PM2_STATUS" | jq '[.[] | select(.pm2_env.status=="online")] | length' 2>/dev/null || echo "0")
            
            if [ "$PM2_RUNNING" -gt "0" ]; then
                echo -e "${GREEN}✅ PM2 Processes Running: ${PM2_RUNNING}/${PM2_COUNT}${NC}"
                log_message "PM2: ${PM2_RUNNING}/${PM2_COUNT} processes running"
                
                # Show process details
                pm2 list
            else
                echo -e "${RED}❌ No PM2 processes running!${NC}"
                log_message "ERROR: No PM2 processes running!"
            fi
        else
            echo -e "${YELLOW}⚠️  PM2 process list empty${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
    fi
}

# Function to check Nginx
check_nginx() {
    echo -e "\n${GREEN}=== Nginx Web Server ===${NC}"
    
    # Check if Nginx is running
    NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
    
    if [ "$NGINX_STATUS" = "active" ]; then
        echo -e "${GREEN}✅ Nginx Status: Running${NC}"
        
        # Test Nginx configuration
        NGINX_TEST=$(nginx -t 2>&1)
        if echo "$NGINX_TEST" | grep -q "test is successful"; then
            echo -e "${GREEN}✅ Configuration: Valid${NC}"
        else
            echo -e "${RED}❌ Configuration: Invalid${NC}"
            log_message "ERROR: Nginx configuration invalid"
        fi
        
    else
        echo -e "${RED}❌ Nginx Status: Not Running${NC}"
        log_message "ERROR: Nginx is not running!"
    fi
}

# Function to check API health
check_api_health() {
    echo -e "\n${GREEN}=== API Health Check ===${NC}"
    
    # Check backend health endpoint
    API_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5000/health 2>/dev/null)
    HTTP_CODE=$(echo "$API_RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Backend API: Healthy (HTTP $HTTP_CODE)${NC}"
        log_message "Backend API health check: OK"
    else
        echo -e "${RED}❌ Backend API: Unhealthy (HTTP $HTTP_CODE)${NC}"
        log_message "ERROR: Backend API health check failed (HTTP $HTTP_CODE)"
    fi
    
    # Check HTTPS endpoint
    HTTPS_RESPONSE=$(curl -s -w "\n%{http_code}" https://www.zala.ir/health 2>/dev/null)
    HTTPS_CODE=$(echo "$HTTPS_RESPONSE" | tail -n 1)
    
    if [ "$HTTPS_CODE" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS Endpoint: Accessible (HTTP $HTTPS_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS Endpoint: May have issues (HTTP $HTTPS_CODE)${NC}"
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    echo -e "\n${GREEN}=== SSL Certificate ===${NC}"
    
    # Check SSL certificate expiry
    if [ -f /etc/letsencrypt/live/zala.ir/cert.pem ]; then
        CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/zala.ir/cert.pem 2>/dev/null | cut -d= -f2)
        CERT_DAYS=$(( ($(date -d "$CERT_EXPIRY" +%s) - $(date +%s)) / 86400 ))
        
        if [ "$CERT_DAYS" -gt 30 ]; then
            echo -e "${GREEN}✅ SSL Certificate: Valid for ${CERT_DAYS} days${NC}"
        elif [ "$CERT_DAYS" -gt 7 ]; then
            echo -e "${YELLOW}⚠️  SSL Certificate: Expires in ${CERT_DAYS} days${NC}"
            log_message "WARNING: SSL certificate expires in ${CERT_DAYS} days"
        else
            echo -e "${RED}❌ SSL Certificate: Expires in ${CERT_DAYS} days!${NC}"
            log_message "CRITICAL: SSL certificate expires in ${CERT_DAYS} days!"
        fi
    else
        echo -e "${YELLOW}⚠️  SSL Certificate: Not found or no access${NC}"
    fi
}

# Function to display network statistics
check_network() {
    echo -e "\n${GREEN}=== Network Statistics ===${NC}"
    
    # Check open ports
    echo "🌐 Open Ports:"
    netstat -tuln 2>/dev/null | grep LISTEN | grep -E ":(80|443|5000|5433|6379)" || echo "  (netstat not available)"
    
    # Check active connections to backend
    BACKEND_CONNECTIONS=$(netstat -an 2>/dev/null | grep ":5000" | grep ESTABLISHED | wc -l)
    echo -e "${GREEN}✅ Active Backend Connections: ${BACKEND_CONNECTIONS}${NC}"
}

# Main monitoring function
main() {
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   TITAN Trading System - Monitoring       ║${NC}"
    echo -e "${GREEN}║   $(date '+%Y-%m-%d %H:%M:%S')                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    
    log_message "===== Monitoring Check Started ====="
    
    check_system_resources
    check_postgresql
    check_redis
    check_pm2
    check_nginx
    check_api_health
    check_ssl_certificate
    check_network
    
    echo -e "\n${GREEN}✅ Monitoring check completed${NC}"
    echo -e "${GREEN}📊 Log file: ${MONITOR_LOG}${NC}\n"
    
    log_message "===== Monitoring Check Completed ====="
}

# Run main function
main
