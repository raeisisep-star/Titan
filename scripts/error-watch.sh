#!/usr/bin/env bash
#
# TITAN Error Watch - Monitor logs for errors and send alerts
# Runs continuously and watches for ERROR level logs
#

set -euo pipefail

LOG_FILE="/home/ubuntu/Titan/logs/titan.log"
ALERT_LOG="/home/ubuntu/Titan/logs/error-alerts.log"
COOLDOWN_SECONDS=300  # 5 minutes cooldown between alerts
LAST_ALERT_TIME=0

log_alert() {
  local message="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] $message" | tee -a "$ALERT_LOG"
}

send_alert() {
  local error_line="$1"
  local current_time=$(date +%s)
  
  # Check cooldown period
  if [ $((current_time - LAST_ALERT_TIME)) -lt $COOLDOWN_SECONDS ]; then
    return
  fi
  
  LAST_ALERT_TIME=$current_time
  
  # Extract relevant info from JSON log
  local timestamp=$(echo "$error_line" | jq -r '.time // .timestamp // "unknown"' 2>/dev/null || echo "unknown")
  local level=$(echo "$error_line" | jq -r '.level // "unknown"' 2>/dev/null || echo "unknown")
  local msg=$(echo "$error_line" | jq -r '.msg // .message // "No message"' 2>/dev/null || echo "No message")
  local err=$(echo "$error_line" | jq -r '.err.message // "N/A"' 2>/dev/null || echo "N/A")
  
  # Log to alert file
  log_alert "⚠️  ERROR DETECTED in TITAN Backend"
  log_alert "Time: $timestamp"
  log_alert "Level: $level"
  log_alert "Message: $msg"
  log_alert "Error: $err"
  log_alert "Full log: $error_line"
  log_alert "---"
  
  # Send email if mail is configured
  if command -v mail >/dev/null 2>&1; then
    echo -e "TITAN Backend Error Alert\n\nTime: $timestamp\nMessage: $msg\nError: $err" | \
      mail -s "🚨 TITAN Error Alert" ubuntu@localhost 2>/dev/null || true
  fi
  
  # Send to system log
  logger -t titan-error "ERROR in TITAN Backend: $msg"
}

# Wait for log file to exist
while [ ! -f "$LOG_FILE" ]; do
  echo "Waiting for log file $LOG_FILE to exist..."
  sleep 5
done

log_alert "🔍 TITAN Error Watch started"

# Monitor log file
tail -Fn0 "$LOG_FILE" | while read -r line; do
  # Check if line contains error level (50 in pino)
  if echo "$line" | grep -qE '"level":(50|60)|"level":"error"|"level":"fatal"'; then
    send_alert "$line"
  fi
done
