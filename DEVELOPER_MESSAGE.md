# 📨 Message for Developer - Sprint A Launch

Hi Team! 👋

We're launching **Sprint A** today - a 2-week sprint focused on Front/Back alignment and infrastructure improvements.

---

## 🎯 Sprint A Overview

**Duration:** 2 weeks (2025-10-23 to 2025-11-06)  
**Goal:** Remove mocks, integrate real APIs, improve infrastructure

**Tasks:** 7 main tasks (see `SPRINT_A_TASKS.md` for full details)

---

## 📋 Your Tasks (Quick Summary)

### [A] Contracts Map (2 days)
**File:** `docs/contracts-map.md`  
**Goal:** Document all API endpoints for 8 pages (Dashboard, Trading, Portfolio, Alerts, News, Analytics, Settings, AI)  
**Format:** Table with: Page | Endpoint | Method | Auth | Params | Sample Request/Response | SLA  
**Deliverable:** PR with screenshots + JSON samples

### [B] Dashboard Real API Integration (2 days)
**Goal:** Remove ALL mock data from Dashboard  
**APIs to integrate:**
- `GET /api/dashboard/portfolio-real`
- `GET /api/dashboard/trading-real`
- `GET /api/dashboard/charts-real`
- `GET /api/dashboard/activities-real`

**Acceptance Criteria:**
- 4 KPIs showing real data
- 2 charts with real data
- Activity feed with real transactions
- No console errors
- p95 < 500ms

### [C] Trading Panel - Phase 1 (2 days)
**Goal:** Implement manual order placement + position viewing

**Frontend:**
- Order form (symbol, side, type, quantity, price)
- Validation before submission
- User-friendly error messages

**Backend:**
- `POST /api/trading/manual/order`
- `GET /api/trading/manual/positions`

**Flow:** Place order → See in positions list

**Deliverable:** PR with 3 sample cURL commands

### [D] PM2 Migration (1 day)
**Goal:** Production-grade PM2 configuration

**Create:** `ecosystem.config.js`  
**Features:**
- Cluster mode (use all CPU cores)
- Log rotation
- Auto-restart on crash
- Auto-start on boot
- Load env from `.env`

**Commands:**
```bash
pm2 start ecosystem.config.js --env production
pm2 reload  # Zero-downtime reload
pm2 save    # Persist config
pm2 startup systemd  # Auto-start on boot
```

### [E] Uptime Monitor (1 day)
**Goal:** Systemd timer for health checks (every 1 minute)

**Files to create:**
- `/usr/local/bin/uptime-monitor.sh` - Health check script
- `infra/systemd/uptime-monitor.service` - Systemd service
- `infra/systemd/uptime-monitor.timer` - Systemd timer
- `infra/systemd/install-uptime-monitor.sh` - Installation script

**Logs:** `/var/log/titan/uptime-monitor.log`  
**Format:** Timestamp | Status | HTTP Code | Latency

### [F] CSP Enforcement - Phase 1 (1 day)
**Goal:** Enable CSP in Report-Only mode

**Nginx:** Add `Content-Security-Policy-Report-Only` header  
**Backend:** Create `POST /api/csp-report` endpoint  
**Log:** `logs/csp-reports.log`

**Phase 1:** Monitor for 1 week (no blocking)  
**Phase 2 (Sprint B):** Analyze + Enforce

### [G] Architecture Documentation (2 days)
**Goal:** Comprehensive project documentation

**File:** `docs/architecture/overview.md`

**Sections:**
1. Architecture diagram (Cloudflare → Nginx → PM2 → App → DB/Redis)
2. Module overview (backend, frontend, infrastructure)
3. Dependencies list
4. Risks & mitigation (at least 10 risks)
5. Technical debt inventory (at least 5 items with effort estimates)
6. 2-week release roadmap

---

## 🔄 Execution Order

**Sequential (must be in order):**
1. [A] Contracts Map → Creates API documentation
2. [B] Dashboard Real API → Uses contracts from [A]
3. [C] Trading Panel → Uses contracts from [A]

**Parallel (can do anytime):**
- [D] PM2 Migration
- [E] Uptime Monitor
- [F] CSP Report-Only
- [G] Architecture Docs

---

## 📦 PR Strategy

**Recommended:**
- PR #1: [A] Contracts Map
- PR #2: [B] Dashboard + [C] Trading (combined - they're related)
- PR #3: [D] PM2 Migration
- PR #4: [E] Uptime Monitor
- PR #5: [F] CSP Report-Only
- PR #6: [G] Architecture Docs

**OR:** Separate PRs for each task (7 PRs total)

---

## ⚠️ Critical Security Note

### DO NOT Commit These to Git:

❌ `.env` file  
❌ Database passwords  
❌ Health endpoint password (`TitanHealth@2024!Secure`)  
❌ JWT secrets  
❌ API keys  

✅ Use `.env.example` with dummy values  
✅ Keep `.env` in `.gitignore` (already configured)  
✅ Document required env vars in README  

---

## 📚 Full Details

See `SPRINT_A_TASKS.md` for:
- Detailed implementation steps
- Code examples
- Acceptance criteria
- Testing procedures
- Sample commands

---

## 🎯 Sprint Success Criteria

Sprint A is complete when:
- [ ] All 7 tasks have merged PRs
- [ ] Dashboard shows real data (zero mocks)
- [ ] Trading panel can place orders successfully
- [ ] PM2 runs in cluster mode with auto-restart
- [ ] Uptime monitor logs every minute
- [ ] CSP reports being collected
- [ ] Architecture docs are comprehensive
- [ ] Zero critical bugs

---

## 📞 Questions?

- Review `SPRINT_A_TASKS.md` first (detailed instructions)
- Check `docs/` folder for documentation
- Ask @raeisisep-star if blocked

---

## 🚀 Let's Ship It!

**Start:** Today (2025-10-23)  
**Finish:** 2025-11-06 (2 weeks)  
**Review:** 2025-11-07

Good luck! 💪

---

## 📊 Quick Checklist

Copy this to track your progress:

```
Sprint A Progress:
[ ] [A] Contracts Map - PR created
[ ] [B] Dashboard Real API - PR created
[ ] [C] Trading Panel Phase 1 - PR created
[ ] [D] PM2 Migration - PR created
[ ] [E] Uptime Monitor - PR created
[ ] [F] CSP Report-Only - PR created
[ ] [G] Architecture Docs - PR created

PRs Merged:
[ ] [A] Merged
[ ] [B] Merged
[ ] [C] Merged
[ ] [D] Merged
[ ] [E] Merged
[ ] [F] Merged
[ ] [G] Merged

Testing:
[ ] All tests pass
[ ] Zero console errors
[ ] p95 < 500ms
[ ] PM2 cluster mode active
[ ] Uptime monitor logging
[ ] CSP reports collecting
```

---

**Created:** 2025-10-23  
**By:** Claude AI Assistant  
**For:** Titan Trading Platform - Sprint A
