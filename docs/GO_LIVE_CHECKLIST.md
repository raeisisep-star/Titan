# Go-Live Checklist - Titan/Zala Production Deployment

**Version**: 1.0  
**Last Updated**: November 1, 2025  
**Status**: Ready for Production Deployment

---

## Overview

This checklist ensures a safe, monitored, and reversible production deployment. Follow each step sequentially and verify completion before proceeding.

**Estimated Total Time**: 4-6 hours (including 24-48h monitoring window)

---

## Phase 1: Pre-Deployment Verification (1 hour)

### ✅ 1.1 SSL/HSTS Configuration

- [ ] **Verify SSL Certificate**
  ```bash
  # Check certificate validity
  echo | openssl s_client -servername www.zala.ir -connect www.zala.ir:443 2>/dev/null | openssl x509 -noout -dates
  
  # Expected: notAfter should be > 30 days from now
  ```

- [ ] **Verify HSTS Header**
  ```bash
  # Check HSTS on production
  curl -sI https://www.zala.ir/api/health | grep -i "strict-transport-security"
  
  # Expected: strict-transport-security: max-age=31536000; includeSubDomains; preload
  ```

- [ ] **Verify Security Headers** (from Phase 5)
  ```bash
  # Check all security headers
  curl -sI https://www.zala.ir/api/health | grep -E "(x-frame-options|x-content-type-options|content-security-policy)"
  
  # Expected: x-frame-options: DENY, x-content-type-options: nosniff, CSP present
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 1.2 Environment Variables & Secrets

- [ ] **Production .env Validation**
  ```bash
  cd /home/ubuntu/Titan
  node -e "['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','DATABASE_URL','REDIS_URL','JWT_SECRET'].forEach(k=>{if(!process.env[k]){console.error('❌ MISSING',k);process.exit(1)}});console.log('✅ ENV OK')"
  ```

- [ ] **Staging .env Validation**
  ```bash
  cd /home/ubuntu/Titan-staging
  node -e "['DATABASE_URL','REDIS_URL','JWT_SECRET'].forEach(k=>{if(!process.env[k]){console.error('❌ MISSING',k);process.exit(1)}});console.log('✅ ENV OK')"
  ```

- [ ] **Verify No Hardcoded Secrets**
  ```bash
  # Search for potential hardcoded secrets
  cd /home/ubuntu/Titan
  grep -r "AKIAIOSFODNN7EXAMPLE\|sk_live_\|password.*=" --include="*.js" --include="*.ts" . || echo "✅ No hardcoded secrets found"
  ```

- [ ] **Telegram Alert Test** (if configured)
  ```bash
  /home/ubuntu/Titan/scripts/send_telegram.sh "🚀 Pre-deployment test from Go-Live checklist"
  
  # Verify message received in Telegram
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 1.3 System Resources & Capacity

- [ ] **Check Server Resources**
  ```bash
  # CPU cores
  echo "CPU Cores: $(nproc)"
  
  # Memory
  free -h
  
  # Disk space
  df -h /
  
  # Expected minimums:
  # - CPU: ≥ 2 vCPUs
  # - Memory: ≥ 4GB total, < 80% used
  # - Disk: < 70% used, ≥ 20GB free
  ```

- [ ] **Verify Alert Thresholds** (from Phase 5)
  ```bash
  # Check health-checks.sh thresholds
  grep -E "(DISK_FREE|MEM_USED_PCT|CPU_LOAD)" /home/ubuntu/Titan/scripts/health-checks.sh
  
  # Expected:
  # - Disk: warn >70%, critical >80%
  # - Memory: alert >85%
  # - CPU: alert if load > number of cores
  ```

- [ ] **Database Connection Pool**
  ```bash
  # Check PostgreSQL max_connections
  psql $DATABASE_URL -c "SHOW max_connections;"
  
  # Verify backend pool size (max: 20 per instance)
  grep "max.*20" /home/ubuntu/Titan/server-real-v3.js
  
  # Expected: max_connections ≥ 50 (20 prod + 20 staging + buffer)
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 1.4 Backup & Restore Readiness

- [ ] **Verify Production Backup Cron**
  ```bash
  crontab -l | grep "backup-production-db.sh"
  
  # Expected: 0 2 * * * /home/ubuntu/Titan/scripts/backup-production-db.sh
  ```

- [ ] **Check Latest Backup**
  ```bash
  # List recent backups
  ls -lht /home/ubuntu/backups/production/ | head -5
  
  # Expected: At least one backup from last 24 hours
  ```

- [ ] **Dry-Run Restore Test on Staging**
  ```bash
  # Create test restore
  LATEST_BACKUP=$(ls -t /home/ubuntu/backups/production/*.sql.gz | head -1)
  echo "Testing restore of: $LATEST_BACKUP"
  
  # Dry-run (check file integrity)
  gunzip -t "$LATEST_BACKUP" && echo "✅ Backup file integrity OK"
  
  # Optional: Full restore to staging (only if critical)
  # psql $STAGING_DATABASE_URL < <(gunzip -c "$LATEST_BACKUP")
  ```

- [ ] **Verify Backup Retention**
  ```bash
  # Check backup count (should be ≤ 30 for production)
  BACKUP_COUNT=$(ls -1 /home/ubuntu/backups/production/*.sql.gz | wc -l)
  echo "Production backups: $BACKUP_COUNT"
  
  # Expected: 7-30 backups (depending on age)
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 1.5 CI/CD Pipeline Verification

- [ ] **Check GitHub Actions Status**
  ```bash
  cd /home/ubuntu/Titan
  gh run list --limit 5
  
  # Expected: Recent runs should be passing
  ```

- [ ] **Verify Staging Auto-Deployment**
  ```bash
  # Check last staging deployment
  gh run list --workflow=deploy-staging.yml --limit 1
  
  # Expected: Successful deployment on last main push
  ```

- [ ] **Verify Production Workflow Exists**
  ```bash
  # Check production deployment workflow
  cat .github/workflows/deploy-prod.yml | grep -E "(workflow_dispatch|push.*tags)"
  
  # Expected: Manual approval or tag-triggered deployment
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 2: Deployment Preparation (30 minutes)

### ✅ 2.1 Code Freeze & Communication

- [ ] **Announce Code Freeze**
  - Notify team: "Code freeze for production deployment starting [TIME]"
  - Duration: 2-4 hours (deployment + initial monitoring)
  - Channels: Slack/Telegram/Email

- [ ] **Create Release Tag**
  ```bash
  # Use release tagging script (from Phase 6C)
  cd /home/ubuntu/Titan
  ./scripts/release-tag.sh v1.0.0
  
  # Or manually:
  git checkout main
  git pull origin main
  git tag -a v1.0.0 -m "Release v1.0.0: Production Go-Live"
  git push origin v1.0.0
  ```

- [ ] **Update CHANGELOG.md**
  - Document release version and date
  - List major features and fixes
  - Reference PR #44 (Phase 5) and other completed phases

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 2.2 Pre-Deployment Database Backup

- [ ] **Manual Pre-Deployment Backup**
  ```bash
  # Run production backup manually before deployment
  /home/ubuntu/Titan/scripts/backup-production-db.sh
  
  # Wait for completion and verify
  ls -lh /home/ubuntu/backups/production/ | head -3
  
  # Tag backup file as pre-deployment
  BACKUP_FILE=$(ls -t /home/ubuntu/backups/production/*.sql.gz | head -1)
  cp "$BACKUP_FILE" "${BACKUP_FILE%.sql.gz}_PRE_DEPLOY_v1.0.0.sql.gz"
  ```

- [ ] **Verify Backup Integrity**
  ```bash
  # Test backup file
  BACKUP_FILE=$(ls -t /home/ubuntu/backups/production/*.sql.gz | head -1)
  gunzip -t "$BACKUP_FILE" && echo "✅ Backup integrity verified"
  
  # Record backup size
  du -h "$BACKUP_FILE"
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 2.3 Health Check Baseline

- [ ] **Record Pre-Deployment Metrics**
  ```bash
  # System metrics
  echo "=== Pre-Deployment Baseline ==="
  echo "Timestamp: $(date -u)"
  echo "Disk: $(df -h / | awk 'NR==2 {print $5}')"
  echo "Memory: $(free | awk '/Mem:/ {printf("%.0f%%", $3/$2*100)}')"
  echo "CPU Load: $(awk '{print $1}' /proc/loadavg)"
  
  # Application metrics
  curl -s http://localhost:5000/api/health | jq
  
  # Database size
  psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
  
  # PM2 status
  pm2 list
  ```

- [ ] **Save Baseline to File**
  ```bash
  # Create baseline snapshot
  cat > /home/ubuntu/Titan/logs/pre-deployment-baseline-$(date +%Y%m%d-%H%M%S).txt << EOF
  Timestamp: $(date -u)
  Disk: $(df -h / | awk 'NR==2 {print $5}')
  Memory: $(free | awk '/Mem:/ {printf("%.0f%%", $3/$2*100)}')
  CPU Load: $(awk '{print $1}' /proc/loadavg)
  Health: $(curl -s http://localhost:5000/api/health | jq -c)
  EOF
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 3: Deployment Execution (30 minutes)

### ✅ 3.1 Deploy to Production

- [ ] **Merge Release PR to Main**
  ```bash
  # If using PR-based workflow
  gh pr merge <PR_NUMBER> --squash --delete-branch
  
  # Or directly push tag (if using tag-triggered deployment)
  git push origin v1.0.0
  ```

- [ ] **Monitor GitHub Actions Deployment**
  ```bash
  # Watch deployment workflow
  gh run watch
  
  # Or manually check
  gh run list --workflow=deploy-prod.yml --limit 1
  ```

- [ ] **Verify PM2 Restart**
  ```bash
  # Check PM2 status after deployment
  pm2 list
  
  # Expected: titan-backend processes restarted recently (uptime < 5 minutes)
  
  # Check for errors
  pm2 logs titan-backend --nostream --lines 50 | tail -20
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 3.2 Immediate Post-Deployment Checks (First 5 Minutes)

- [ ] **Health Endpoint Verification**
  ```bash
  # Check production health
  curl -s https://www.zala.ir/api/health | jq
  
  # Expected: {"success":true, "data":{"status":"healthy", ...}}
  ```

- [ ] **Security Headers Verification**
  ```bash
  # Verify Phase 5 security headers deployed
  curl -sI https://www.zala.ir/api/health | grep -E "(strict-transport-security|x-frame-options|x-content-type-options)"
  
  # Expected: All headers present
  ```

- [ ] **Database Connectivity**
  ```bash
  # Test database from backend
  curl -s https://www.zala.ir/api/health | jq '.data.services.database'
  
  # Expected: {"status":"connected","type":"postgresql","latency":<10ms}
  ```

- [ ] **Redis Connectivity**
  ```bash
  # Test Redis from backend
  curl -s https://www.zala.ir/api/health | jq '.data.services.redis'
  
  # Expected: {"status":"connected","latency":<5ms}
  ```

- [ ] **Rate Limiting Functional**
  ```bash
  # Test rate limiting (should see X-RateLimit headers)
  curl -sI https://www.zala.ir/api/health | grep -i "x-ratelimit"
  
  # Expected: X-RateLimit-Remaining, X-RateLimit-Reset headers
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 3.3 Smoke Tests (First 15 Minutes)

- [ ] **Authentication Flow** (if applicable)
  ```bash
  # Test login endpoint (if public)
  # curl -X POST https://www.zala.ir/api/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
  
  # Expected: Proper response (200 or 401)
  ```

- [ ] **Critical API Endpoints** (if applicable)
  ```bash
  # Test key endpoints (adjust based on your APIs)
  # curl -s https://www.zala.ir/api/markets | jq
  # curl -s https://www.zala.ir/api/portfolio | jq
  
  # Expected: Proper responses without 500 errors
  ```

- [ ] **Frontend Load Test** (if applicable)
  ```bash
  # Check frontend serving (if backend serves frontend)
  curl -sI https://www.zala.ir/ | head -1
  
  # Expected: HTTP/2 200
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 4: Initial Monitoring (First 2 Hours)

### ✅ 4.1 Error Monitoring

- [ ] **Monitor Application Logs**
  ```bash
  # Watch for errors in real-time
  pm2 logs titan-backend --lines 100 | grep -E "(ERROR|FAIL|Exception)"
  
  # Expected: No critical errors
  ```

- [ ] **Monitor Nginx Error Logs**
  ```bash
  # Check Nginx errors
  sudo tail -f /var/log/nginx/error.log
  
  # Expected: No 5xx errors
  ```

- [ ] **Monitor System Logs**
  ```bash
  # Check system logs for issues
  sudo journalctl -u nginx -u pm2-ubuntu --since "10 minutes ago" --no-pager
  
  # Expected: No critical failures
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 4.2 Performance Monitoring

- [ ] **Response Time Tracking**
  ```bash
  # Monitor response times
  for i in {1..10}; do 
    curl -w "\nTime: %{time_total}s\n" -s https://www.zala.ir/api/health -o /dev/null
    sleep 5
  done
  
  # Expected: Response time < 500ms consistently
  ```

- [ ] **Resource Usage Tracking**
  ```bash
  # Monitor every 5 minutes for first 2 hours
  watch -n 300 'echo "=== $(date) ==="; free -h; df -h /; pm2 list; echo "CPU: $(awk "{print \$1}" /proc/loadavg)"'
  
  # Expected: Memory < 85%, Disk < 75%, CPU load < cores
  ```

- [ ] **Database Performance**
  ```bash
  # Check active connections
  psql $DATABASE_URL -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"
  
  # Expected: < 30 active connections
  
  # Check slow queries (if pg_stat_statements enabled)
  psql $DATABASE_URL -c "SELECT substring(query, 1, 50), calls, round(mean_exec_time::numeric, 2) FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 4.3 Alert Verification

- [ ] **Verify Monitoring Cron Jobs Running**
  ```bash
  # Check recent cron job executions
  tail -50 /home/ubuntu/Titan/logs/health-checks.log
  
  # Expected: Regular health checks every 5 minutes, all passing
  ```

- [ ] **Test Alert Delivery** (if Telegram configured)
  ```bash
  # Trigger test alert
  /home/ubuntu/Titan/scripts/send_telegram.sh "✅ Post-deployment alert test: All systems operational"
  
  # Verify message received
  ```

- [ ] **Verify PM2 Watchdog**
  ```bash
  # Check PM2 watchdog logs
  tail -20 /home/ubuntu/Titan/logs/pm2-watchdog.log
  
  # Expected: All processes online
  ```

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 5: Extended Monitoring (24-48 Hours)

### ✅ 5.1 Daily Health Checks

**Day 1 (First 24 Hours)**

- [ ] **Morning Check (8:00 AM)** - Record metrics:
  - Health endpoint status
  - System resources (CPU/Memory/Disk)
  - Error log review
  - PM2 status and restart counts

- [ ] **Midday Check (12:00 PM)** - Record metrics:
  - Response time samples
  - Database connections
  - Redis performance

- [ ] **Evening Check (6:00 PM)** - Record metrics:
  - Peak load performance
  - Any error spikes
  - Resource trends

- [ ] **Night Check (10:00 PM)** - Record metrics:
  - End-of-day summary
  - Backup completion
  - Cron job execution logs

**Day 2 (Second 24 Hours)**

- [ ] **Morning Check (8:00 AM)** - Compare with Day 1
- [ ] **Evening Check (6:00 PM)** - Final verification
- [ ] **Sign-off** - Declare deployment successful

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 5.2 Issue Tracking & Resolution

- [ ] **Document Any Issues**
  - Create GitHub issues for any problems found
  - Tag with `post-deployment` label
  - Assign priority (P0-P3)

- [ ] **Track Resolution**
  - Link issues to follow-up PRs
  - Document workarounds if needed
  - Update runbooks

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 6: Post-Deployment Actions

### ✅ 6.1 Documentation Updates

- [ ] **Update CHANGELOG.md**
  - Record deployment date and time
  - Document any deployment issues
  - List post-deployment patches

- [ ] **Update Deployment Docs**
  - Record lessons learned
  - Update runbooks with new findings
  - Improve this checklist for next release

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 6.2 Team Communication

- [ ] **Announce Successful Deployment**
  - Send summary to team
  - Include key metrics (uptime, response times)
  - Thank contributors

- [ ] **Lift Code Freeze**
  - Announce: "Code freeze lifted, deployments resumed"
  - Resume normal development workflow

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

### ✅ 6.3 Cleanup & Optimization

- [ ] **Review Logs for Cleanup**
  ```bash
  # Check log sizes
  du -sh /home/ubuntu/Titan/logs/*
  
  # Clean old logs if needed (logrotate should handle this)
  ```

- [ ] **Optimize Based on Findings**
  - Tune database queries if needed
  - Adjust rate limits if traffic different than expected
  - Scale resources if needed

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Rollback Plan

**If critical issues occur during deployment, follow the Rollback Plan:**

See: [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md)

**Quick Rollback Command**:
```bash
# Rollback to previous tag
cd /home/ubuntu/Titan
git fetch --tags
git checkout tags/v0.9.0  # Previous stable version
pm2 restart titan-backend
pm2 restart reconciler

# Restore database if needed (from pre-deployment backup)
BACKUP_FILE="/home/ubuntu/backups/production/*_PRE_DEPLOY_*.sql.gz"
gunzip -c $BACKUP_FILE | psql $DATABASE_URL
```

---

## Success Criteria

**Deployment is considered successful when:**

1. ✅ All health checks passing for 48 hours
2. ✅ No critical errors in application logs
3. ✅ Response times within acceptable range (p95 < 800ms)
4. ✅ System resources stable (CPU < 80%, Memory < 85%, Disk < 75%)
5. ✅ No unplanned service restarts
6. ✅ All monitoring and alerting operational
7. ✅ Zero data loss incidents
8. ✅ Security headers confirmed in production

---

## Deployment Record

**Deployment Details**:
- **Version**: v1.0.0
- **Deployment Date**: _____________
- **Deployed By**: _____________
- **PR Numbers**: #44 (Phase 5), #__ (Phase 6)
- **Tag**: v1.0.0
- **Deployment Duration**: _______ minutes
- **Downtime**: _______ minutes (target: 0)

**Sign-off**:
- [ ] Technical Lead: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______
- [ ] QA: _________________ Date: _______

---

**End of Go-Live Checklist**
