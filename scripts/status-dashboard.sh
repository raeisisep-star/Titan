#!/bin/bash
# TITAN Trading System - Real-time Status Dashboard

# Configuration
REFRESH_INTERVAL=5  # seconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# Function to clear screen
clear_screen() {
    clear
}

# Function to display header
display_header() {
    echo -e "${CYAN}${BOLD}"
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                  TITAN Trading System Dashboard                     ║"
    echo "║                     Real-time Monitoring                            ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${YELLOW}Last Update: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
}

# Function to display system stats
display_system_stats() {
    echo -e "${CYAN}${BOLD}[ SYSTEM RESOURCES ]${NC}"
    
    # CPU
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    CPU_INT=${CPU_USAGE%.*}
    if [ "$CPU_INT" -gt 80 ]; then
        echo -e "  ${RED}● CPU:${NC} ${CPU_USAGE}% ${RED}[HIGH]${NC}"
    else
        echo -e "  ${GREEN}● CPU:${NC} ${CPU_USAGE}%"
    fi
    
    # Memory
    MEMORY_INFO=$(free -h | grep Mem)
    TOTAL_MEM=$(echo $MEMORY_INFO | awk '{print $2}')
    USED_MEM=$(echo $MEMORY_INFO | awk '{print $3}')
    MEM_PERCENT=$(free | grep Mem | awk '{printf "%.1f", ($3/$2) * 100}')
    echo -e "  ${GREEN}● Memory:${NC} ${USED_MEM} / ${TOTAL_MEM} (${MEM_PERCENT}%)"
    
    # Disk
    DISK_INFO=$(df -h / | awk 'NR==2 {print $3 " / " $2 " (" $5 ")"}')
    echo -e "  ${GREEN}● Disk:${NC} ${DISK_INFO}"
    
    # Load Average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
    echo -e "  ${GREEN}● Load:${NC}${LOAD_AVG}"
    
    echo ""
}

# Function to display service status
display_services() {
    echo -e "${CYAN}${BOLD}[ SERVICES STATUS ]${NC}"
    
    # PostgreSQL
    if systemctl is-active postgresql &>/dev/null; then
        DB_CONN=$(PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='titan_trading';" 2>/dev/null | xargs)
        DB_SIZE=$(PGPASSWORD='Titan@2024!Strong' psql -h localhost -p 5433 -U titan_user -d titan_trading -t -c "SELECT pg_size_pretty(pg_database_size('titan_trading'));" 2>/dev/null | xargs)
        echo -e "  ${GREEN}● PostgreSQL:${NC} Running | Connections: ${DB_CONN} | Size: ${DB_SIZE}"
    else
        echo -e "  ${RED}● PostgreSQL:${NC} ${RED}Stopped${NC}"
    fi
    
    # Redis
    if redis-cli -h localhost -p 6379 ping &>/dev/null; then
        REDIS_MEM=$(redis-cli -h localhost -p 6379 INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        REDIS_CLIENTS=$(redis-cli -h localhost -p 6379 INFO clients 2>/dev/null | grep "connected_clients" | cut -d: -f2 | tr -d '\r')
        echo -e "  ${GREEN}● Redis:${NC} Running | Memory: ${REDIS_MEM} | Clients: ${REDIS_CLIENTS}"
    else
        echo -e "  ${RED}● Redis:${NC} ${RED}Stopped${NC}"
    fi
    
    # Nginx
    if systemctl is-active nginx &>/dev/null; then
        echo -e "  ${GREEN}● Nginx:${NC} Running"
    else
        echo -e "  ${RED}● Nginx:${NC} ${RED}Stopped${NC}"
    fi
    
    # PM2 Backend
    if command -v pm2 &>/dev/null; then
        PM2_STATUS=$(pm2 jlist 2>/dev/null)
        PM2_RUNNING=$(echo "$PM2_STATUS" | jq '[.[] | select(.pm2_env.status=="online")] | length' 2>/dev/null || echo "0")
        PM2_TOTAL=$(echo "$PM2_STATUS" | jq '. | length' 2>/dev/null || echo "0")
        
        if [ "$PM2_RUNNING" -gt 0 ]; then
            echo -e "  ${GREEN}● Backend (PM2):${NC} ${PM2_RUNNING}/${PM2_TOTAL} instances running"
        else
            echo -e "  ${RED}● Backend (PM2):${NC} ${RED}No instances running${NC}"
        fi
    fi
    
    echo ""
}

# Function to display API health
display_api_health() {
    echo -e "${CYAN}${BOLD}[ API HEALTH ]${NC}"
    
    # Backend API
    API_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5000/health 2>/dev/null)
    HTTP_CODE=$(echo "$API_RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        API_DATA=$(echo "$API_RESPONSE" | head -n -1)
        DB_STATUS=$(echo "$API_DATA" | jq -r '.database' 2>/dev/null || echo "unknown")
        REDIS_STATUS=$(echo "$API_DATA" | jq -r '.redis' 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}● Backend API:${NC} Healthy (HTTP 200)"
        echo -e "    - Database: ${DB_STATUS}"
        echo -e "    - Redis: ${REDIS_STATUS}"
    else
        echo -e "  ${RED}● Backend API:${NC} ${RED}Unhealthy (HTTP ${HTTP_CODE})${NC}"
    fi
    
    # HTTPS Endpoint
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.zala.ir/health 2>/dev/null)
    if [ "$HTTPS_CODE" = "200" ]; then
        echo -e "  ${GREEN}● HTTPS Endpoint:${NC} Accessible (HTTP 200)"
    else
        echo -e "  ${YELLOW}● HTTPS Endpoint:${NC} ${YELLOW}Status: ${HTTPS_CODE}${NC}"
    fi
    
    echo ""
}

# Function to display network connections
display_network() {
    echo -e "${CYAN}${BOLD}[ NETWORK ]${NC}"
    
    # Active connections
    BACKEND_CONN=$(netstat -an 2>/dev/null | grep ":5000" | grep ESTABLISHED | wc -l)
    DB_CONN=$(netstat -an 2>/dev/null | grep ":5433" | grep ESTABLISHED | wc -l)
    WEB_CONN=$(netstat -an 2>/dev/null | grep -E ":(80|443)" | grep ESTABLISHED | wc -l)
    
    echo -e "  ${GREEN}● Active Connections:${NC}"
    echo -e "    - Backend (5000): ${BACKEND_CONN}"
    echo -e "    - Database (5433): ${DB_CONN}"
    echo -e "    - Web (80/443): ${WEB_CONN}"
    
    echo ""
}

# Function to display recent logs
display_logs() {
    echo -e "${CYAN}${BOLD}[ RECENT LOGS ]${NC}"
    
    # Backend logs
    if [ -f /tmp/webapp/Titan/logs/backend-out.log ]; then
        echo -e "  ${YELLOW}Backend (last 3 lines):${NC}"
        tail -n 3 /tmp/webapp/Titan/logs/backend-out.log 2>/dev/null | sed 's/^/    /'
    fi
    
    echo ""
}

# Function to display footer
display_footer() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit | Refreshing every ${REFRESH_INTERVAL} seconds${NC}"
}

# Main dashboard loop
main() {
    # Trap Ctrl+C
    trap 'echo -e "\n${GREEN}Dashboard stopped.${NC}"; exit 0' INT
    
    while true; do
        clear_screen
        display_header
        display_system_stats
        display_services
        display_api_health
        display_network
        display_logs
        display_footer
        
        sleep $REFRESH_INTERVAL
    done
}

# Run dashboard
main
