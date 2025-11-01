#!/usr/bin/env bash
set -euo pipefail

ALERT="/home/ubuntu/Titan/scripts/send_telegram.sh"
LOG="/home/ubuntu/Titan/logs/pm2-watchdog.log"

# Get list of processes that are not online
DOWN="$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.pm2_env.status!="online") | .name' 2>/dev/null || true)"

if [[ -n "$DOWN" ]]; then
  echo "[$(date -u)] ❌ PM2 processes down: $DOWN" | tee -a "$LOG"
  "$ALERT" "❌ PM2 process down: $DOWN - Attempting restart"
  
  # Restart each down process
  while read -r NAME; do
    if [[ -n "$NAME" ]]; then
      echo "[$(date -u)] Restarting $NAME..." | tee -a "$LOG"
      pm2 restart "$NAME" 2>&1 | tee -a "$LOG" || true
      sleep 2
    fi
  done <<< "$DOWN"
  
  # Check if restart was successful
  STILL_DOWN="$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.pm2_env.status!="online") | .name' 2>/dev/null || true)"
  if [[ -n "$STILL_DOWN" ]]; then
    "$ALERT" "🔴 CRITICAL: PM2 processes still down after restart: $STILL_DOWN"
  else
    "$ALERT" "✅ All PM2 processes recovered"
  fi
else
  echo "[$(date -u)] ✅ All PM2 processes online" | tee -a "$LOG"
fi

# Check for high restarts (> 10 restarts may indicate issues)
HIGH_RESTARTS="$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.pm2_env.restart_time > 10) | "\(.name): \(.pm2_env.restart_time) restarts"' 2>/dev/null || true)"

if [[ -n "$HIGH_RESTARTS" ]]; then
  echo "[$(date -u)] ⚠️  High restart count detected:" | tee -a "$LOG"
  echo "$HIGH_RESTARTS" | tee -a "$LOG"
  "$ALERT" "⚠️ High PM2 restart count detected:
$HIGH_RESTARTS"
fi
