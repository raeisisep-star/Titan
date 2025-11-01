#!/usr/bin/env bash
set -euo pipefail

ALERT="/home/ubuntu/Titan/scripts/send_telegram.sh"
LOG="/home/ubuntu/Titan/logs/external-synth.log"

check() {
  local URL="$1"
  local NAME="$2"
  
  echo "[$(date -u)] Checking $NAME ($URL)..." | tee -a "$LOG"
  
  if curl -m 10 -fsS "$URL" 2>/dev/null | grep -q '"success":true'; then
    echo "[$(date -u)] ✅ $NAME OK" | tee -a "$LOG"
    return 0
  else
    echo "[$(date -u)] ❌ $NAME FAILED" | tee -a "$LOG"
    "$ALERT" "🌐 External check failed: $NAME ($URL)"
    return 1
  fi
}

# Check production
check "https://www.zala.ir/api/health" "Production" || true

# Check staging
check "https://staging.zala.ir/api/health" "Staging" || true

echo "[$(date -u)] External checks completed" | tee -a "$LOG"
