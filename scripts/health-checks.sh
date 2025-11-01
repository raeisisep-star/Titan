#!/usr/bin/env bash
set -euo pipefail

TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
LOG="/home/ubuntu/Titan/logs/health-checks.log"
ALERT="/home/ubuntu/Titan/scripts/send_telegram.sh"

ok() { echo "[$TS] OK   $1"    | tee -a "$LOG"; }
bad(){ echo "[$TS] FAIL $1"    | tee -a "$LOG"; [[ -x "$ALERT" ]] && "$ALERT" "⚠️ $1"; exit 1; }

# 1) Backend health (Prod)
if curl -m 5 -fsS http://127.0.0.1:5000/api/health 2>/dev/null | grep -q '"success":true'; then
  ok "backend:5000 healthy"
else
  bad "backend:5000 unhealthy"
fi

# 2) Backend health (Staging)
if curl -m 5 -fsS http://127.0.0.1:5001/api/health 2>/dev/null | grep -q '"success":true'; then
  ok "backend:5001 healthy"
else
  bad "backend:5001 unhealthy"
fi

# 3) Redis ping
if redis-cli -h 127.0.0.1 -p 6379 ping 2>/dev/null | grep -q PONG; then
  ok "redis healthy"
else
  bad "redis unhealthy"
fi

# 4) Postgres simple check
PG_URI_PROD="$(grep ^DATABASE_URL /home/ubuntu/Titan/.env | cut -d= -f2-)"
PG_URI_STAG="$(grep ^DATABASE_URL /home/ubuntu/Titan-staging/.env | cut -d= -f2-)"
psql "$PG_URI_PROD" -c "SELECT 1;" >/dev/null 2>&1 && ok "postgres prod ok" || bad "postgres prod fail"
psql "$PG_URI_STAG" -c "SELECT 1;" >/dev/null 2>&1 && ok "postgres stg ok"  || bad "postgres stg fail"

# 5) Nginx stub_status (will be enabled after A2)
if curl -m 5 -fsS http://127.0.0.1:8080/nginx_status 2>/dev/null | grep -q 'Active connections'; then
  ok "nginx stub_status ok"
else
  # Not critical yet, just log
  echo "[$TS] INFO nginx stub_status not yet configured" | tee -a "$LOG"
fi

# 6) Disk space check (warn if < 20% free)
DISK_FREE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [[ "$DISK_FREE" -gt 80 ]]; then
  bad "disk space critical: ${DISK_FREE}% used"
elif [[ "$DISK_FREE" -gt 70 ]]; then
  echo "[$TS] WARN disk space: ${DISK_FREE}% used" | tee -a "$LOG"
else
  ok "disk space ok: ${DISK_FREE}% used"
fi

# 7) CPU load check (alert if 1-min load > number of vCPUs)
CPU_CORES=$(nproc)
CPU_LOAD_1=$(awk '{print $1}' /proc/loadavg)
CPU_LOAD_INT=$(printf "%.0f" "$CPU_LOAD_1")
if [[ "$CPU_LOAD_INT" -gt "$CPU_CORES" ]]; then
  echo "[$TS] WARN CPU load high: $CPU_LOAD_1 (cores: $CPU_CORES)" | tee -a "$LOG"
  [[ -x "$ALERT" ]] && "$ALERT" "⚠️ CPU load high: $CPU_LOAD_1 (cores: $CPU_CORES)"
else
  ok "CPU load ok: $CPU_LOAD_1 (cores: $CPU_CORES)"
fi

# 8) Memory usage check (alert if > 85%)
MEM_USED_PCT=$(free | awk '/Mem:/ {printf("%.0f", $3/$2*100)}')
if [[ "$MEM_USED_PCT" -gt 85 ]]; then
  echo "[$TS] WARN Memory high: ${MEM_USED_PCT}% used" | tee -a "$LOG"
  [[ -x "$ALERT" ]] && "$ALERT" "⚠️ Memory usage high: ${MEM_USED_PCT}%"
else
  ok "memory usage ok: ${MEM_USED_PCT}%"
fi

ok "All health checks passed"
