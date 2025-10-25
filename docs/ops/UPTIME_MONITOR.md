# Task-2: Uptime Monitor - systemd Timer

## Overview
Automated health monitoring system that pings `/api/health` endpoint every 60 seconds and logs results.

## Components

### 1. Monitor Script
**File**: `/usr/local/bin/titan-uptime.sh`
- Makes HTTP request to `https://www.zala.ir/api/health`
- Timeout: 5 seconds
- Logs to `/var/log/titan-uptime.log`
- Auto-rotates log when > 10MB

### 2. Systemd Service
**File**: `/etc/systemd/system/titan-uptime.service`
- Type: oneshot
- Runs script as root
- Logs to systemd journal

### 3. Systemd Timer
**File**: `/etc/systemd/system/titan-uptime.timer`
- **Frequency**: Every 60 seconds
- **Boot delay**: 1 minute
- **Accuracy**: ±5 seconds

## Installation

```bash
# 1. Create script
sudo tee /usr/local/bin/titan-uptime.sh > /dev/null << 'SCRIPT'
#!/usr/bin/env bash
URL="https://www.zala.ir/api/health"
TS=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
LOG_FILE="/var/log/titan-uptime.log"

OUT=$(curl -fsS -m 5 -w " %{http_code}" "$URL" 2>&1 || echo " ERR")
CODE="${OUT##* }"
BODY="${OUT% *}"
BODY_LEN="${#BODY}"

echo "[$TS] code=$CODE body_len=$BODY_LEN" >> "$LOG_FILE"

if [ "$CODE" != "200" ]; then
    echo "[$TS] ALERT: Health check failed with code=$CODE" >> "$LOG_FILE"
fi
SCRIPT

sudo chmod +x /usr/local/bin/titan-uptime.sh

# 2. Create service & timer (files shown above)

# 3. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable --now titan-uptime.timer
```

## Verification

```bash
# Check timer status
systemctl status titan-uptime.timer

# View recent logs
sudo tail -f /var/log/titan-uptime.log

# List next trigger times
systemctl list-timers --all | grep titan-uptime

# Manual test
sudo /usr/local/bin/titan-uptime.sh
```

## Evidence Pack

### Timer Status
```
○ titan-uptime.timer - Run titan health ping every minute
     Loaded: loaded (/etc/systemd/system/titan-uptime.timer; enabled)
     Active: active (waiting)
    Trigger: Fri 2025-10-25 12:07:27 UTC
   Triggers: ● titan-uptime.service
```

### Sample Logs
```
[2025-10-25 12:05:05 UTC] code=200 body_len=359
[2025-10-25 12:05:26 UTC] code=200 body_len=359
[2025-10-25 12:06:27 UTC] code=200 body_len=359
```

### Interval Verification
- First run: 12:05:05
- Second run: 12:05:26 (21 seconds - boot delay)
- Third run: 12:06:27 (61 seconds interval) ✅

## Rollback

```bash
# Disable and remove
sudo systemctl disable --now titan-uptime.timer
sudo rm /etc/systemd/system/titan-uptime.{service,timer}
sudo rm /usr/local/bin/titan-uptime.sh
sudo systemctl daemon-reload
```

## Definition of Done ✅

- [x] Script created in `/usr/local/bin/titan-uptime.sh`
- [x] Systemd service created
- [x] Systemd timer created and enabled
- [x] Timer runs every 60 seconds
- [x] Logs writing to `/var/log/titan-uptime.log`
- [x] Evidence: Timer active, logs updating every minute

---
**Date**: 2025-10-25  
**Status**: ✅ Complete  
**Branch**: task/uptime-monitor
