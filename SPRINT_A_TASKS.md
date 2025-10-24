# 🚀 Sprint A: Front/Back Alignment & Infrastructure

**Start Date:** 2025-10-23  
**Duration:** 2 weeks  
**Priority:** High (No waiting - Start immediately)

---

## 📋 Overview

This sprint focuses on:
1. **Contracts Documentation** - Map all API endpoints
2. **Real API Integration** - Remove mocks from Dashboard
3. **Trading Panel Phase 1** - Manual order placement
4. **PM2 Migration** - Production-grade process management
5. **Uptime Monitoring** - Systemd timer-based health checks
6. **CSP Enforcement** - Content Security Policy hardening
7. **Architecture Documentation** - Comprehensive project analysis

---

## [A] Contracts Map

### Objective:
Create comprehensive API contract documentation for all major pages/tabs.

### Task:
Create file: `docs/contracts-map.md`

### Required Information for Each Page:

| Page | Endpoint | Method | Auth | Query/Params | Sample Request/Response | SLA |
|------|----------|--------|------|--------------|------------------------|-----|
| ... | ... | ... | ... | ... | ... | ... |

### Pages to Document:
1. **Dashboard** - Portfolio overview, charts, activities
2. **Trading** - Order placement, positions, history
3. **Portfolio** - Holdings, P&L, allocation
4. **Alerts** - Price alerts, notifications
5. **News** - Market news, sentiment analysis
6. **Analytics** - Performance metrics, reports
7. **Settings** - User preferences, security
8. **AI/Artemis** - AI insights, predictions

### Format Template:

```markdown
## Dashboard

### GET /api/dashboard/portfolio-real
**Auth:** Required (JWT)  
**Query Params:** 
- `period` (optional): `1d`, `1w`, `1m`, `3m`, `1y`
- `currency` (optional): `USD`, `EUR`, `IRR`

**Sample Request:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://www.zala.ir/api/dashboard/portfolio-real?period=1w"
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 125000.50,
    "currency": "USD",
    "change24h": {
      "amount": 2500.30,
      "percentage": 2.04
    },
    "assets": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "amount": 0.5,
        "value": 25000,
        "change24h": 1.5
      }
    ]
  }
}
```

**SLA:** 
- Response Time: p95 < 500ms
- Availability: 99.9%
- Rate Limit: 100 req/min per user
```

### Deliverables:
- ✅ Complete `docs/contracts-map.md` file
- ✅ Separate PR with clear title: `docs: Add API contracts map for all pages`
- ✅ Include screenshots of actual API responses (using Postman/curl)
- ✅ Include sample JSON files in `docs/api-samples/`

### Acceptance Criteria:
- [ ] All 8 pages documented
- [ ] All endpoints include Method, Auth, Params, Sample Request/Response, SLA
- [ ] JSON samples are valid and match actual API responses
- [ ] PR includes screenshots/proof of testing

---

## [B] Dashboard Aligned with Real API

### Objective:
Remove all mock data from Dashboard and integrate with real backend APIs.

### Current State Issues:
- Dashboard uses mock/hardcoded data
- No real-time updates from backend
- Mismatch between UI schema and API responses

### Required API Endpoints:

1. **Portfolio Summary**
   - Endpoint: `GET /api/dashboard/portfolio-real`
   - Data: Total value, 24h change, asset breakdown

2. **Trading Stats**
   - Endpoint: `GET /api/dashboard/trading-real`
   - Data: Open positions, today's P&L, order history

3. **Charts**
   - Endpoint: `GET /api/dashboard/charts-real`
   - Data: Portfolio value over time, asset allocation

4. **Recent Activities**
   - Endpoint: `GET /api/dashboard/activities-real`
   - Data: Latest trades, deposits, withdrawals

### Implementation Steps:

1. **Backend** (if APIs don't exist):
   ```typescript
   // Example: /api/dashboard/portfolio-real
   router.get('/dashboard/portfolio-real', authenticate, async (req, res) => {
     const { period = '1d', currency = 'USD' } = req.query;
     const userId = req.user.id;
     
     // Fetch real data from database
     const portfolio = await getPortfolioData(userId, period, currency);
     
     res.json({
       success: true,
       data: portfolio
     });
   });
   ```

2. **Frontend** (remove mocks):
   ```typescript
   // BEFORE (with mock)
   const portfolioData = MOCK_PORTFOLIO_DATA;
   
   // AFTER (real API)
   const { data, isLoading, error } = useQuery({
     queryKey: ['dashboard', 'portfolio'],
     queryFn: () => api.get('/api/dashboard/portfolio-real'),
     refetchInterval: 30000 // Refresh every 30s
   });
   ```

3. **Schema Alignment**:
   - If API response schema differs from UI expectations:
     - **Option A:** Update UI to match API schema (preferred)
     - **Option B:** Create adapter/transformer layer
   - Document any schema changes in PR

### Deliverables:
- ✅ Remove all `MOCK_*` data from Dashboard components
- ✅ Integrate 4 real API endpoints
- ✅ Handle loading states (spinners/skeletons)
- ✅ Handle error states (user-friendly messages)
- ✅ Include before/after JSON samples in PR description

### Acceptance Criteria:
- [ ] 4 main KPIs showing real data (total value, 24h change, positions, P&L)
- [ ] 2 charts with real data (portfolio value over time, asset allocation)
- [ ] Activity feed shows real transactions
- [ ] No console errors
- [ ] p95 response time < 500ms
- [ ] Loading states during data fetch
- [ ] Error handling with user-friendly messages

### Testing Checklist:
```bash
# Test each endpoint
curl -H "Authorization: Bearer TOKEN" https://www.zala.ir/api/dashboard/portfolio-real
curl -H "Authorization: Bearer TOKEN" https://www.zala.ir/api/dashboard/trading-real
curl -H "Authorization: Bearer TOKEN" https://www.zala.ir/api/dashboard/charts-real
curl -H "Authorization: Bearer TOKEN" https://www.zala.ir/api/dashboard/activities-real

# All should return HTTP 200 with valid JSON
```

---

## [C] Trading Panel - Phase 1 (Orders & Positions)

### Objective:
Implement manual order placement and position viewing.

### Frontend Requirements:

**Order Form:**
```typescript
interface OrderForm {
  symbol: string;        // e.g., "BTCUSDT"
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;        // Required for LIMIT orders
}
```

**Validation Rules:**
- Symbol: Required, must exist in available symbols
- Side: Required, must be 'BUY' or 'SELL'
- Quantity: Required, must be > 0
- Price: Required for LIMIT orders, must be > 0
- For MARKET orders: Price is ignored

**UI Components:**
1. Symbol selector (dropdown or search)
2. Buy/Sell toggle buttons
3. Order type tabs (Market/Limit)
4. Quantity input (with max balance button)
5. Price input (shown only for Limit orders)
6. Submit button (with confirmation dialog)

### Backend Requirements:

**1. Place Order Endpoint:**
```typescript
// POST /api/trading/manual/order
router.post('/trading/manual/order', authenticate, async (req, res) => {
  const { symbol, side, orderType, quantity, price } = req.body;
  const userId = req.user.id;
  
  // Validation
  if (!symbol || !side || !orderType || !quantity) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  if (orderType === 'LIMIT' && !price) {
    return res.status(400).json({
      success: false,
      error: 'Price is required for LIMIT orders'
    });
  }
  
  // Check balance
  const hasBalance = await checkUserBalance(userId, symbol, quantity, side);
  if (!hasBalance) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient balance'
    });
  }
  
  // Place order
  const order = await placeOrder({
    userId,
    symbol,
    side,
    orderType,
    quantity,
    price
  });
  
  res.json({
    success: true,
    data: {
      orderId: order.id,
      status: order.status,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      createdAt: order.createdAt
    }
  });
});
```

**2. Get Positions Endpoint:**
```typescript
// GET /api/trading/manual/positions
router.get('/trading/manual/positions', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  const positions = await getUserPositions(userId);
  
  res.json({
    success: true,
    data: {
      positions: positions.map(p => ({
        symbol: p.symbol,
        side: p.side,
        quantity: p.quantity,
        entryPrice: p.entryPrice,
        currentPrice: p.currentPrice,
        unrealizedPnL: p.unrealizedPnL,
        unrealizedPnLPercent: p.unrealizedPnLPercent,
        openedAt: p.openedAt
      }))
    }
  });
});
```

### User Flow:

1. User selects symbol (e.g., "BTCUSDT")
2. User selects side (BUY or SELL)
3. User selects order type (MARKET or LIMIT)
4. User enters quantity
5. If LIMIT: User enters price
6. User clicks "Submit"
7. Frontend shows confirmation dialog
8. User confirms
9. Frontend sends POST request
10. Backend validates and places order
11. Frontend shows success message
12. Frontend refreshes positions list

### Error Handling:

**Frontend should display user-friendly messages for:**
- Validation errors: "Please enter a valid quantity"
- Insufficient balance: "You don't have enough balance to place this order"
- Network errors: "Unable to connect to server. Please try again."
- Server errors: "Order placement failed. Please try again later."

**Backend should return structured errors:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance to place order",
    "details": {
      "required": 1000,
      "available": 500
    }
  }
}
```

### Deliverables:
- ✅ Frontend: Order form with validation
- ✅ Backend: POST `/api/trading/manual/order` endpoint
- ✅ Backend: GET `/api/trading/manual/positions` endpoint
- ✅ Integration: Successful order placement → position appears in list
- ✅ Error handling: User-friendly error messages
- ✅ PR includes 3 sample cURL commands

### Acceptance Criteria:
- [ ] User can place MARKET and LIMIT orders
- [ ] Order form validates all fields before submission
- [ ] Successful order appears in positions list immediately
- [ ] Failed orders show clear error messages
- [ ] No console errors
- [ ] Backend logs all order attempts (for audit)

### Sample cURL Commands (include in PR):

```bash
# 1. Place MARKET BUY order
curl -X POST https://www.zala.ir/api/trading/manual/order \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "BUY",
    "orderType": "MARKET",
    "quantity": 0.01
  }'

# 2. Place LIMIT SELL order
curl -X POST https://www.zala.ir/api/trading/manual/order \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "SELL",
    "orderType": "LIMIT",
    "quantity": 0.01,
    "price": 50000
  }'

# 3. Get current positions
curl https://www.zala.ir/api/trading/manual/positions \
  -H "Authorization: Bearer TOKEN"
```

---

## [D] PM2 Migration (Operational Task)

### Objective:
Migrate from basic PM2 setup to production-grade configuration with clustering, log rotation, and auto-restart.

### Current State:
```bash
# Current (basic)
pm2 start dist/index.js --name titan-backend
```

### Target State:

**1. Create `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'titan-backend',
    script: './dist/index.js',
    instances: 'max',          // Use all CPU cores
    exec_mode: 'cluster',      // Cluster mode for load balancing
    watch: false,              // Don't watch in production
    max_memory_restart: '500M', // Restart if memory > 500MB
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      // Load from .env file (don't hardcode here)
    },
    error_file: '/var/log/titan/backend-error.log',
    out_file: '/var/log/titan/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Log rotation
    log_type: 'json',
    log_file_max_size: '10M',
    log_file_retention: 7,
    // Auto restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

**2. Update Start Commands:**
```bash
# Start in production
pm2 start ecosystem.config.js --env production

# Reload without downtime
pm2 reload ecosystem.config.js --env production

# Save configuration (persists across reboots)
pm2 save

# Setup startup script (auto-start on boot)
pm2 startup systemd
# Then run the generated command
```

**3. Create Log Directory:**
```bash
sudo mkdir -p /var/log/titan
sudo chown ubuntu:ubuntu /var/log/titan
```

**4. Load Environment from .env:**
```javascript
// In ecosystem.config.js
require('dotenv').config();

module.exports = {
  apps: [{
    // ...
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      REDIS_HOST: process.env.REDIS_HOST,
      REDIS_PORT: process.env.REDIS_PORT,
      // ... other env vars
    }
  }]
};
```

### Documentation Update:

Add to `README.md` under **Operations** section:

```markdown
## Operations

### Starting the Application

**Production:**
```bash
# Start with ecosystem config
pm2 start ecosystem.config.js --env production

# Reload without downtime (zero-downtime deployment)
pm2 reload ecosystem.config.js --env production

# Check status
pm2 status
pm2 logs titan-backend --lines 50
pm2 monit
```

**Development:**
```bash
npm run dev
```

### Process Management

**View Logs:**
```bash
# Real-time logs
pm2 logs titan-backend

# Last 100 lines
pm2 logs titan-backend --lines 100

# Error logs only
pm2 logs titan-backend --err

# JSON logs
tail -f /var/log/titan/backend-out.log
```

**Monitoring:**
```bash
# Dashboard
pm2 monit

# Status
pm2 status

# Detailed info
pm2 show titan-backend
```

**Restart/Reload:**
```bash
# Graceful reload (zero downtime)
pm2 reload titan-backend

# Hard restart
pm2 restart titan-backend

# Stop
pm2 stop titan-backend

# Delete from PM2
pm2 delete titan-backend
```

### Auto-Start on Boot

```bash
# Generate startup script
pm2 startup systemd

# Save current process list
pm2 save

# Test (reboot server and check)
sudo reboot
# After reboot:
pm2 status  # Should show titan-backend running
```
```

### Deliverables:
- ✅ `ecosystem.config.js` with clustering and log rotation
- ✅ Log directory created: `/var/log/titan/`
- ✅ Environment variables loaded from `.env`
- ✅ Documentation updated in `README.md`
- ✅ PM2 startup script configured
- ✅ Separate PR: `ops: Migrate PM2 to production configuration`

### Acceptance Criteria:
- [ ] `pm2 reload` works without downtime
- [ ] All CPU cores utilized (cluster mode)
- [ ] Logs rotated automatically
- [ ] Auto-restart on crash
- [ ] Auto-start on server reboot
- [ ] `pm2 save` persists configuration
- [ ] Documentation complete in README

### Testing:
```bash
# 1. Test reload without downtime
pm2 reload titan-backend
curl https://www.zala.ir/api/health  # Should work during reload

# 2. Test crash recovery
pm2 list
pm2 stop titan-backend
sleep 2
pm2 status  # Should show auto-restarted

# 3. Test reboot persistence
sudo reboot
# After reboot:
pm2 status  # Should show titan-backend running

# 4. Test clustering
pm2 show titan-backend | grep "exec mode"
# Should show: exec mode: cluster_mode
# Should show: instances: N (where N = number of CPU cores)
```

---

## [E] Uptime Monitor (Systemd Timer)

### Objective:
Implement automated health monitoring using systemd timer (replacing cron).

### Implementation:

**1. Health Check Script: `/usr/local/bin/uptime-monitor.sh`**
```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="https://www.zala.ir/api/health"
LOG_FILE="/var/log/titan/uptime-monitor.log"
ALERT_THRESHOLD=3  # Alert after 3 consecutive failures

log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $*" >> "$LOG_FILE"
}

check_health() {
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "\n%{http_code}" --max-time 10 "$HEALTH_URL" 2>&1)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)
    local end_time=$(date +%s%3N)
    local latency=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        log "✅ HEALTHY | HTTP $http_code | ${latency}ms | $body"
        echo "0" > /tmp/uptime-monitor-failures
    else
        log "❌ UNHEALTHY | HTTP $http_code | ${latency}ms | $body"
        local failures=$(cat /tmp/uptime-monitor-failures 2>/dev/null || echo "0")
        failures=$((failures + 1))
        echo "$failures" > /tmp/uptime-monitor-failures
        
        if [ "$failures" -ge "$ALERT_THRESHOLD" ]; then
            log "🚨 ALERT: Service unhealthy for $failures consecutive checks"
            # TODO: Send alert (Telegram/Slack) - will implement later
        fi
    fi
}

# Initialize failure counter
[ ! -f /tmp/uptime-monitor-failures ] && echo "0" > /tmp/uptime-monitor-failures

log "Starting uptime check..."
check_health
```

**2. Systemd Service: `infra/systemd/uptime-monitor.service`**
```ini
[Unit]
Description=Titan Trading Platform Uptime Monitor
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/uptime-monitor.sh
StandardOutput=journal
StandardError=journal
User=ubuntu
Group=ubuntu

# Security hardening
PrivateTmp=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/log/titan /tmp
```

**3. Systemd Timer: `infra/systemd/uptime-monitor.timer`**
```ini
[Unit]
Description=Run uptime monitor every minute
Requires=uptime-monitor.service

[Timer]
OnCalendar=*:0/1
# Run every minute at :00 seconds
# Examples: 10:00:00, 10:01:00, 10:02:00, etc.

AccuracySec=1s
Persistent=true

[Install]
WantedBy=timers.target
```

**4. Installation Script: `infra/systemd/install-uptime-monitor.sh`**
```bash
#!/bin/bash
set -e

echo "Installing Uptime Monitor..."

# Create log directory
sudo mkdir -p /var/log/titan
sudo chown ubuntu:ubuntu /var/log/titan

# Copy script
sudo cp uptime-monitor.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/uptime-monitor.sh

# Copy systemd units
sudo cp uptime-monitor.service /etc/systemd/system/
sudo cp uptime-monitor.timer /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start timer
sudo systemctl enable uptime-monitor.timer
sudo systemctl start uptime-monitor.timer

# Show status
echo ""
echo "✅ Installation complete!"
echo ""
echo "Check status:"
echo "  sudo systemctl status uptime-monitor.timer"
echo ""
echo "View logs:"
echo "  tail -f /var/log/titan/uptime-monitor.log"
echo ""
echo "Manual test:"
echo "  sudo /usr/local/bin/uptime-monitor.sh"
```

### Documentation Update:

Add to `README.md`:

```markdown
## Monitoring

### Uptime Monitor

Automated health checks run every minute via systemd timer.

**Installation:**
```bash
cd infra/systemd
chmod +x install-uptime-monitor.sh
./install-uptime-monitor.sh
```

**Check Status:**
```bash
# Timer status
sudo systemctl status uptime-monitor.timer

# View next scheduled run
sudo systemctl list-timers uptime-monitor.timer

# View logs
tail -f /var/log/titan/uptime-monitor.log

# Manual test
sudo /usr/local/bin/uptime-monitor.sh
```

**Logs Format:**
```
[2025-10-23 18:00:00 UTC] Starting uptime check...
[2025-10-23 18:00:00 UTC] ✅ HEALTHY | HTTP 200 | 145ms | {"status":"healthy"}
[2025-10-23 18:01:00 UTC] Starting uptime check...
[2025-10-23 18:01:00 UTC] ✅ HEALTHY | HTTP 200 | 132ms | {"status":"healthy"}
```
```

### Deliverables:
- ✅ Script: `/usr/local/bin/uptime-monitor.sh`
- ✅ Service: `infra/systemd/uptime-monitor.service`
- ✅ Timer: `infra/systemd/uptime-monitor.timer`
- ✅ Installation script: `infra/systemd/install-uptime-monitor.sh`
- ✅ Documentation in `README.md`
- ✅ Separate PR: `ops: Add systemd-based uptime monitoring`

### Acceptance Criteria:
- [ ] Health check runs every 1 minute automatically
- [ ] Logs include timestamp, status, HTTP code, latency
- [ ] Failure counter tracks consecutive failures
- [ ] Timer survives server reboot
- [ ] No cron dependencies

### Testing:
```bash
# 1. Install
cd infra/systemd
./install-uptime-monitor.sh

# 2. Check timer is active
sudo systemctl status uptime-monitor.timer
# Should show: Active: active (waiting)

# 3. Check logs after 5 minutes
tail -f /var/log/titan/uptime-monitor.log
# Should show 5 entries (one per minute)

# 4. Test manual run
sudo /usr/local/bin/uptime-monitor.sh
# Should log one entry immediately

# 5. Check next scheduled run
sudo systemctl list-timers uptime-monitor.timer
# Should show next run in ~1 minute

# 6. Test reboot persistence
sudo reboot
# After reboot:
sudo systemctl status uptime-monitor.timer
# Should show: Active: active (waiting)
```

**Note:** Telegram/Slack alerting will be added in a future sprint.

---

## [F] CSP Enforcement (Two-Phase Approach)

### Objective:
Implement Content Security Policy (CSP) to prevent XSS and other injection attacks.

### Phase 1: Report-Only Mode (This Sprint)

**1. Add CSP Header in Report-Only Mode:**

In Nginx config (`nginx-zala-ssl-enhanced.conf`):
```nginx
# Inside server block (HTTPS)
location / {
    # ... existing config ...
    
    # CSP Report-Only (Phase 1 - Monitoring)
    add_header Content-Security-Policy-Report-Only 
        "default-src 'self'; 
         script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; 
         style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
         font-src 'self' https://fonts.gstatic.com; 
         img-src 'self' data: https:; 
         connect-src 'self' https://api.zala.ir wss://api.zala.ir; 
         frame-src 'none'; 
         object-src 'none'; 
         base-uri 'self'; 
         form-action 'self'; 
         report-uri /api/csp-report;" 
        always;
}
```

**2. Create CSP Report Endpoint:**

Backend (`src/routes/csp.ts`):
```typescript
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

router.post('/csp-report', async (req, res) => {
  try {
    const report = req.body;
    const logFile = path.join(__dirname, '../../logs/csp-reports.log');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      report
    };
    
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
    
    console.log('CSP Violation:', JSON.stringify(report, null, 2));
    
    res.status(204).send();
  } catch (error) {
    console.error('CSP report error:', error);
    res.status(500).send();
  }
});

export default router;
```

**3. Collect Reports for 1 Week:**
```bash
# Monitor CSP reports
tail -f logs/csp-reports.log

# Analyze violations
cat logs/csp-reports.log | jq '.report."violated-directive"' | sort | uniq -c | sort -rn
```

### Phase 2: Enforcement (Next Sprint - After Analysis)

**After 1 week of monitoring:**

1. **Analyze Reports:**
   - Identify legitimate violations (need to allow)
   - Identify malicious attempts (should block)
   - Identify false positives (refine policy)

2. **Refine Policy:**
   - Remove `'unsafe-inline'` where possible
   - Remove `'unsafe-eval'` where possible
   - Whitelist only necessary domains
   - Add nonce/hash for inline scripts

3. **Switch to Enforcement:**
```nginx
# Remove Report-Only, switch to enforce
add_header Content-Security-Policy 
    "default-src 'self'; 
     script-src 'self' 'nonce-RANDOM' https://cdnjs.cloudflare.com; 
     style-src 'self' 'nonce-RANDOM' https://fonts.googleapis.com; 
     ..." 
    always;
```

4. **Test Thoroughly:**
   - All pages load correctly
   - No console errors
   - All functionality works

### Deliverables (Phase 1 Only):
- ✅ CSP header in Report-Only mode
- ✅ CSP report endpoint: `POST /api/csp-report`
- ✅ Log file: `logs/csp-reports.log`
- ✅ Documentation on how to analyze reports
- ✅ Separate PR: `security: Add CSP in Report-Only mode`

### Acceptance Criteria (Phase 1):
- [ ] CSP-Report-Only header present in all HTTPS responses
- [ ] CSP violations logged to `logs/csp-reports.log`
- [ ] No impact on user experience (Report-Only doesn't block)
- [ ] Documentation includes:
  - How to view reports
  - How to analyze violations
  - When to move to enforcement (after 1 week + analysis)

### Acceptance Criteria (Phase 2 - Future):
- [ ] Zero critical errors after enforcement
- [ ] All UI functionality works
- [ ] Inline scripts use nonce
- [ ] No `'unsafe-inline'` or `'unsafe-eval'` (or minimal usage)

### Testing (Phase 1):
```bash
# 1. Check CSP header is present
curl -I https://www.zala.ir/ | grep -i content-security-policy
# Should show: Content-Security-Policy-Report-Only: ...

# 2. Trigger violation (intentional)
# In browser console:
eval('console.log("test")');
# Should generate CSP report

# 3. Check report was logged
tail -f logs/csp-reports.log
# Should show the violation

# 4. Analyze violations after 24 hours
cat logs/csp-reports.log | jq '.report."violated-directive"' | sort | uniq -c
# Shows frequency of each violation type
```

---

## [G] Architecture Documentation

### Objective:
Create comprehensive project documentation covering architecture, risks, technical debt, and release roadmap.

### Task:
Create file: `docs/architecture/overview.md`

### Required Sections:

#### 1. Architecture Diagram

```
┌─────────────┐
│   Client    │ (Browser/Mobile)
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│  Cloudflare │ (CDN, DDoS Protection, WAF)
└──────┬──────┘
       │ HTTPS (Origin Pull)
       ▼
┌─────────────┐
│    Nginx    │ (Reverse Proxy, TLS, Rate Limiting)
│             │ Port: 443
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│     PM2     │ (Process Manager, Clustering)
│             │
│  ┌───────┐  │
│  │ Node  │  │ Instance 1
│  │ App   │  │
│  └───┬───┘  │
│      │      │
│  ┌───┴───┐  │
│  │ Node  │  │ Instance N (cluster)
│  │ App   │  │
│  └───┬───┘  │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │    Redis    │
│   :5433     │    │    :6379    │
└─────────────┘    └─────────────┘
```

#### 2. Module Overview

**Backend Modules:**
- `src/routes/` - API endpoints
- `src/lib/database.ts` - PostgreSQL connection pool
- `src/lib/redis.ts` - Redis client
- `src/middleware/` - Auth, validation, rate limiting
- `src/services/` - Business logic
- `src/types/` - TypeScript definitions

**Frontend Modules:**
- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/services/api.ts` - API client
- `src/store/` - State management (if using Redux/Zustand)

**Infrastructure:**
- `nginx-zala-ssl-enhanced.conf` - Nginx configuration
- `ecosystem.config.js` - PM2 configuration
- `fail2ban-*.conf` - Fail2ban filters and jails
- `infra/systemd/` - Systemd units (CF IP update, uptime monitor)

#### 3. Dependencies

**Runtime:**
- Node.js 20.x
- PostgreSQL 14+
- Redis 7+
- Nginx 1.24+
- PM2 5.x

**Key npm Packages:**
- Express (web framework)
- pg (PostgreSQL client)
- ioredis (Redis client)
- jsonwebtoken (JWT auth)
- bcrypt (password hashing)
- ... (list all major dependencies)

#### 4. Risks & Mitigation

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Database connection pool exhaustion | High | Medium | Monitor pool usage, set max connections, implement connection timeouts |
| Redis failure (cache unavailable) | Medium | Low | Implement fallback to direct DB queries, use Redis Sentinel for HA |
| PM2 process crash loop | High | Low | Implement proper error handling, use max_restarts, monitor with uptime checks |
| Cloudflare IP changes (rate limiting fails) | Medium | Low | Automated weekly updates via systemd timer |
| DDoS attack | High | Medium | Cloudflare protection + Nginx rate limiting + Fail2ban |
| Unauthorized access to /api/health/full | Low | Medium | Basic Auth implemented ✅ |
| XSS attacks | Medium | Medium | CSP in Report-Only, moving to enforcement |
| SQL injection | High | Low | Use parameterized queries (pg library) |
| Environment variable leakage | High | Low | .env in .gitignore, no credentials in code |
| SSL certificate expiration | Medium | Low | Cloudflare managed SSL (auto-renewal) |

#### 5. Technical Debt

**Current Technical Debt:**

1. **Mock Data in Frontend** (High Priority)
   - Issue: Dashboard and other pages use hardcoded mock data
   - Impact: No real-time updates, testing difficult
   - Effort: 2 weeks
   - Plan: Sprint A task [B]

2. **Basic PM2 Configuration** (Medium Priority)
   - Issue: Not using clustering, no log rotation
   - Impact: Single point of failure, log disk usage
   - Effort: 1 day
   - Plan: Sprint A task [D]

3. **No API Documentation** (Medium Priority)
   - Issue: No OpenAPI/Swagger docs
   - Impact: Frontend/backend coordination difficult
   - Effort: 1 week
   - Plan: Sprint A task [A] (contracts map)

4. **No Automated Testing** (High Priority)
   - Issue: No unit tests, integration tests, or E2E tests
   - Impact: High risk of regressions
   - Effort: 3 weeks
   - Plan: Sprint B (after Sprint A completion)

5. **Inline Secrets in .env** (Low Priority - Partially Fixed)
   - Issue: Database password in .env on server
   - Impact: Risk if server is compromised
   - Effort: 2 days
   - Plan: Migrate to secret manager (AWS Secrets Manager, HashiCorp Vault)

6. **No CI/CD Pipeline** (Medium Priority)
   - Issue: Manual builds and deployments
   - Impact: Slow releases, human error risk
   - Effort: 1 week
   - Plan: Sprint B (GitHub Actions)

7. **CSP Not Enforced** (Medium Priority - In Progress)
   - Issue: XSS risk
   - Impact: Potential for injection attacks
   - Effort: 2 weeks (monitoring + enforcement)
   - Plan: Sprint A task [F] Phase 1 → Sprint B Phase 2

#### 6. Release Roadmap (Next 2 Weeks)

**Week 1 (Sprint A - Part 1):**
- [A] API Contracts Documentation
- [B] Dashboard Real API Integration
- [C] Trading Panel Phase 1
- [D] PM2 Migration
- [E] Uptime Monitor

**Week 2 (Sprint A - Part 2):**
- [F] CSP Report-Only Monitoring
- [G] Architecture Documentation (this file)
- Testing & Bug Fixes
- PR Reviews & Merges

**Post-Sprint A (Sprint B):**
- CSP Enforcement (after 1 week monitoring)
- Automated Testing (unit + integration)
- CI/CD Pipeline (GitHub Actions)
- Cloudflare Authenticated Origin Pulls
- PostgreSQL Hardening (scram-sha-256)
- Redis Hardening (ACL, requirepass)

### Deliverables:
- ✅ `docs/architecture/overview.md` with all sections
- ✅ Architecture diagram (ASCII or Mermaid)
- ✅ Module list with brief descriptions
- ✅ Dependency list
- ✅ Risk assessment table
- ✅ Technical debt inventory with effort estimates
- ✅ 2-week release roadmap
- ✅ Separate PR: `docs: Add comprehensive architecture documentation`

### Acceptance Criteria:
- [ ] Diagram clearly shows all components and data flow
- [ ] All major modules documented
- [ ] All runtime dependencies listed
- [ ] At least 10 risks identified with mitigations
- [ ] At least 5 technical debt items with effort estimates
- [ ] 2-week roadmap aligns with Sprint A tasks

---

## 📊 Execution Order & PRs

### Execution Order:

**Sequential (Dependencies):**
1. **[A] Contracts Map** → Creates foundation for API integration
2. **[B] Dashboard Real API** → Uses contracts from [A]
3. **[C] Trading Panel** → Uses contracts from [A], similar patterns as [B]

**Parallel (No Dependencies):**
- **[D] PM2 Migration** - Can run anytime (infrastructure)
- **[E] Uptime Monitor** - Can run anytime (monitoring)
- **[F] CSP Report-Only** - Can run anytime (security)
- **[G] Architecture Docs** - Can run anytime (documentation)

### PR Strategy:

**Option 1: Combined API PRs (Recommended)**
- PR #1: [A] + [B] + [C] - "feat: API contracts + Dashboard + Trading integration"
  - Reason: These are related and easier to review together
  - Size: Large but cohesive

**Option 2: Separate PRs**
- PR #1: [A] - "docs: API contracts map"
- PR #2: [B] - "feat: Dashboard real API integration"
- PR #3: [C] - "feat: Trading panel phase 1"
  - Reason: Easier to review, but more PR overhead

**Infrastructure PRs (Separate & Parallel):**
- PR #4: [D] - "ops: PM2 production configuration"
- PR #5: [E] - "ops: Systemd uptime monitoring"
- PR #6: [F] - "security: CSP Report-Only mode"
- PR #7: [G] - "docs: Architecture overview"

### Recommended Approach:
- **Week 1:**
  - Day 1-2: [A] Contracts Map (PR #1)
  - Day 3-4: [B] Dashboard + [C] Trading (PR #2)
  - Day 5: [D] PM2 + [E] Uptime (PR #3, PR #4)

- **Week 2:**
  - Day 1-2: [F] CSP + [G] Docs (PR #5, PR #6)
  - Day 3-4: Testing, Bug Fixes, PR Reviews
  - Day 5: Final Merge & Sprint Retrospective

---

## 🔐 Critical Security Note

### ⚠️ DO NOT Commit Secrets to Repository

**Forbidden:**
```bash
# ❌ DO NOT DO THIS
git add .env
git commit -m "Add environment variables"
git push
```

**Current Secrets to Protect:**
1. **Database Password**: `Titan@2024!Strong`
2. **Health Endpoint Password**: `TitanHealth@2024!Secure`
3. **JWT Secret** (if exists)
4. **API Keys** (if exists)
5. **Redis Password** (if configured)

**How to Handle:**
- Keep `.env` in `.gitignore` (already configured ✅)
- Use `.env.example` with dummy values
- Document required env vars in README
- For health endpoint monitoring without dialog:
  - Option A: Use `/api/health` (public, no auth)
  - Option B: Implement token-based auth (future sprint)
  - Option C: IP whitelist for monitoring tools (future sprint)

### `.env.example` Format:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USER=your_db_user
DB_PASSWORD=your_strong_password_here
DB_NAME=your_db_name

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# Application
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_here

# Health Endpoint (for reference only - stored in /etc/nginx/.htpasswd_health)
# HEALTH_ADMIN_USERNAME=admin
# HEALTH_ADMIN_PASSWORD=your_health_password_here
```

---

## 📞 Communication

### Questions?
- Review task descriptions above
- Check `docs/` folder for detailed documentation
- Ask in project channel before starting implementation

### PR Reviews:
- Tag @raeisisep-star for review
- Include screenshots/cURL examples
- Document any breaking changes
- Update README if needed

### Status Updates:
- Daily standup: Share progress on current task
- Blocked? Report immediately with details
- PR ready? Request review in project channel

---

## ✅ Sprint Success Criteria

**Sprint A is complete when:**
- [ ] All 7 tasks (A-G) have merged PRs
- [ ] Dashboard shows real data (no mocks)
- [ ] Trading panel can place orders
- [ ] PM2 runs in cluster mode
- [ ] Uptime monitor logs every minute
- [ ] CSP reports being collected
- [ ] Architecture docs are comprehensive
- [ ] Zero critical bugs introduced
- [ ] All tests pass (when CI is added)

---

**Start Date:** 2025-10-23  
**Target End Date:** 2025-11-06 (2 weeks)  
**Review Meeting:** 2025-11-07  

**Good luck! 🚀**
