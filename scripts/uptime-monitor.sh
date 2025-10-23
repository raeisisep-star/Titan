#!/bin/bash
#
# Uptime Monitor for TITAN Backend
# Checks health endpoint every minute and logs results
#
# Usage: Add to crontab with:
#   * * * * * /home/ubuntu/Titan/scripts/uptime-monitor.sh >> /home/ubuntu/Titan/logs/uptime-monitor.log 2>&1
#

HEALTH_URL_LOCAL="http://127.0.0.1:5000/api/health/full"
HEALTH_URL_PUBLIC="https://www.zala.ir/api/health/full"
LOG_DIR="/home/ubuntu/Titan/logs"
LOG_FILE="$LOG_DIR/uptime-monitor.log"
ALERT_FILE="$LOG_DIR/uptime-alerts.log"

# Create log directory if not exists
mkdir -p "$LOG_DIR"

# Get timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Check local health endpoint first (primary check)
RESPONSE=$(curl -s --max-time 5 "$HEALTH_URL_LOCAL")
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    # Local check failed - backend is down
    echo "[$TIMESTAMP] ❌ CRITICAL: Backend down - Unable to connect to $HEALTH_URL_LOCAL (exit code: $EXIT_CODE)" | tee -a "$ALERT_FILE"
    
    # Try public URL to determine if it's backend or CF/DNS issue
    PUBLIC_RESPONSE=$(curl -s -k --max-time 10 "$HEALTH_URL_PUBLIC" 2>/dev/null)
    PUBLIC_EXIT=$?
    if [ $PUBLIC_EXIT -ne 0 ]; then
        echo "[$TIMESTAMP] ⚠️  Additional: Public URL also unreachable - possible CF/DNS/SSL issue" | tee -a "$ALERT_FILE"
    fi
    exit 1
fi

# Parse JSON response
STATUS=$(echo "$RESPONSE" | jq -r '.data.overallStatus // "unknown"' 2>/dev/null)
SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false' 2>/dev/null)

if [ "$SUCCESS" != "true" ] || [ "$STATUS" != "healthy" ]; then
    # Health check failed
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"' 2>/dev/null)
    echo "[$TIMESTAMP] ⚠️  WARNING: Health check failed - Status: $STATUS, Error: $ERROR_MSG" | tee -a "$ALERT_FILE"
    exit 1
fi

# Get service details
DB_STATUS=$(echo "$RESPONSE" | jq -r '.data.services[] | select(.name=="PostgreSQL Database") | .status' 2>/dev/null)
REDIS_STATUS=$(echo "$RESPONSE" | jq -r '.data.services[] | select(.name=="Redis Cache") | .status' 2>/dev/null)
API_STATUS=$(echo "$RESPONSE" | jq -r '.data.services[] | select(.name=="API Server") | .status' 2>/dev/null)

# Success - log brief status
echo "[$TIMESTAMP] ✅ OK - Overall: $STATUS | API: $API_STATUS | DB: $DB_STATUS | Redis: $REDIS_STATUS"

# Rotate log file if larger than 10MB
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
    if [ "$LOG_SIZE" -gt 10485760 ]; then
        mv "$LOG_FILE" "$LOG_FILE.$(date +%Y%m%d-%H%M%S).old"
        echo "[$TIMESTAMP] 🔄 Log rotated (size: $LOG_SIZE bytes)"
    fi
fi

exit 0
