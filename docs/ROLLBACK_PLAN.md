# Rollback Plan - Titan/Zala Trading Platform

**Version**: 1.0  
**Last Updated**: November 1, 2025  
**Severity**: CRITICAL - Follow precisely during incidents

---

## Overview

This document outlines procedures for rolling back failed deployments or recovering from critical issues in production. The plan covers multiple rollback strategies depending on the severity and nature of the issue.

**Response Time Targets**:
- **P0 (Critical)**: < 15 minutes to initiate rollback
- **P1 (High)**: < 30 minutes to initiate rollback
- **P2 (Medium)**: < 1 hour to initiate rollback

---

## Quick Reference

### Emergency Rollback (< 5 minutes)

```bash
# 1. Rollback to previous tag
cd /home/ubuntu/Titan
git fetch --tags
git checkout tags/v0.9.0  # Replace with your previous stable tag
pm2 restart all

# 2. Verify health
curl -s https://www.zala.ir/api/health | jq

# 3. Alert team
/home/ubuntu/Titan/scripts/send_telegram.sh "🚨 Emergency rollback to v0.9.0 completed"
```

---

## Rollback Decision Tree

### When to Rollback?

**Immediate Rollback (P0 - Critical)**:
- ❌ Service completely down (5xx errors > 50%)
- ❌ Database corruption or data loss
- ❌ Security vulnerability exploited
- ❌ Authentication system failure
- ❌ Critical business functionality broken

**Urgent Rollback (P1 - High)**:
- ⚠️ Error rate > 10%
- ⚠️ Response time p95 > 3 seconds
- ⚠️ Memory leak causing OOM
- ⚠️ Database connection pool exhaustion
- ⚠️ Third-party API failures causing cascade

**Planned Rollback (P2 - Medium)**:
- ⚠️ Non-critical feature broken
- ⚠️ Performance degradation (but still functional)
- ⚠️ Minor data inconsistencies
- ⚠️ UI/UX issues affecting user experience

**Monitor & Fix Forward (P3 - Low)**:
- ✅ Minor bugs with workarounds
- ✅ Cosmetic issues
- ✅ Non-critical logging errors
- ✅ Performance within acceptable range

---

## Rollback Strategies

### Strategy 1: Git Tag Rollback (Recommended)

**When to use**: Code deployment issues, logic errors, configuration problems

**Time**: ~5 minutes

**Steps**:

```bash
# 1. Identify last stable tag
cd /home/ubuntu/Titan
git fetch --tags
git tag --sort=-creatordate | head -5

# Example output:
# v1.0.0 (current - broken)
# v0.9.0 (last stable)
# v0.8.0
# ...

# 2. Checkout stable tag
STABLE_TAG="v0.9.0"
git checkout "tags/$STABLE_TAG"

# 3. Install dependencies (if package.json changed)
npm ci --production

# 4. Restart services with PM2
pm2 restart titan-backend
pm2 restart reconciler

# 5. Verify rollback
curl -s https://www.zala.ir/api/health | jq '.data.version'
# Expected: Shows v0.9.0

# 6. Check PM2 status
pm2 list

# 7. Monitor logs for errors
pm2 logs titan-backend --lines 50

# 8. Alert team
/home/ubuntu/Titan/scripts/send_telegram.sh "✅ Rolled back to $STABLE_TAG"
```

**Verification**:
- [ ] Health endpoint returns 200
- [ ] Version matches expected tag
- [ ] No critical errors in logs
- [ ] PM2 processes stable (no restarts)

---

### Strategy 2: Git Revert (For Merged PRs)

**When to use**: Specific commit introduced the issue, need to maintain git history

**Time**: ~10 minutes

**Steps**:

```bash
# 1. Identify the problematic merge commit
cd /home/ubuntu/Titan
git log --oneline --graph | head -20

# Example:
# * abc1234 (HEAD -> main) Merge PR #45 (BROKEN)
# * def5678 Fix: Something
# * ghi9012 Merge PR #44 (STABLE)

# 2. Revert the merge commit
MERGE_COMMIT="abc1234"
git revert -m 1 "$MERGE_COMMIT"

# -m 1 keeps the main branch parent
# This creates a new commit that undoes the merge

# 3. Push revert commit
git push origin main

# 4. Wait for CI/CD to deploy (or manual deploy)
gh workflow run deploy-prod.yml

# 5. Monitor deployment
gh run watch

# 6. Verify
curl -s https://www.zala.ir/api/health | jq
```

**Advantages**:
- ✅ Preserves git history
- ✅ Transparent to team
- ✅ Can be easily re-reverted if needed

**Disadvantages**:
- ⏳ Slower (requires CI/CD)
- ⏳ Needs git push access

---

### Strategy 3: Database Rollback

**When to use**: Database migration caused issues, data corruption

**Time**: ~15-30 minutes (depending on database size)

**⚠️  WARNING**: Database rollback may cause data loss for transactions after backup

**Steps**:

```bash
# 1. Identify last good backup
ls -lht /home/ubuntu/backups/production/ | head -5

# Example:
# titan_trading_2025-11-01_020000.sql.gz (current - possibly bad)
# titan_trading_2025-10-31_020000.sql.gz (pre-deployment backup)
# ...

# 2. Stop application (prevent new writes)
pm2 stop titan-backend
pm2 stop reconciler

# 3. Create safety backup of current state
BACKUP_DIR="/home/ubuntu/backups/production"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/emergency_backup_$TIMESTAMP.sql.gz"

# 4. Restore from backup
RESTORE_FILE="/home/ubuntu/backups/production/titan_trading_2025-10-31_020000.sql.gz"

# Drop and recreate database (DANGER!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE;"
psql $DATABASE_URL -c "CREATE SCHEMA public;"
psql $DATABASE_URL -c "GRANT ALL ON SCHEMA public TO titan_user;"

# Restore
gunzip -c "$RESTORE_FILE" | psql "$DATABASE_URL"

# 5. Verify restore
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM orders;"

# 6. Restart application
pm2 restart all

# 7. Verify application health
curl -s https://www.zala.ir/api/health | jq

# 8. Alert team about potential data loss
/home/ubuntu/Titan/scripts/send_telegram.sh "⚠️ Database rolled back to $(date -r $RESTORE_FILE)"
```

**Post-Rollback Actions**:
- [ ] Notify team of data loss window
- [ ] Review audit logs for affected transactions
- [ ] Contact affected users if necessary
- [ ] Investigate root cause before attempting re-deployment

---

### Strategy 4: Configuration Rollback

**When to use**: .env changes caused issues, configuration errors

**Time**: ~2 minutes

**Steps**:

```bash
# 1. Revert .env changes
cd /home/ubuntu/Titan
git checkout HEAD~1 -- .env

# OR restore from backup
cp /home/ubuntu/Titan/.env.backup /home/ubuntu/Titan/.env

# 2. Restart services
pm2 restart all

# 3. Verify
curl -s https://www.zala.ir/api/health | jq

# 4. Check environment variables
cd /home/ubuntu/Titan && node scripts/env-sanity-check.js
```

---

### Strategy 5: Nginx Configuration Rollback

**When to use**: Nginx changes caused issues, routing problems

**Time**: ~3 minutes

**Steps**:

```bash
# 1. Test current config
sudo nginx -t

# 2. Restore from backup (if available)
sudo cp /etc/nginx/sites-available/zala.backup /etc/nginx/sites-available/zala

# OR revert specific changes
sudo nano /etc/nginx/sites-available/zala

# 3. Test configuration
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Verify
curl -sI https://www.zala.ir/ | head -1
# Expected: HTTP/2 200

# 6. Check Nginx status
sudo systemctl status nginx
```

---

## Post-Rollback Checklist

### Immediate (Within 15 minutes)

- [ ] **Verify Health Endpoint**: `curl https://www.zala.ir/api/health`
- [ ] **Check Error Logs**: `pm2 logs --lines 100`
- [ ] **Monitor Metrics**:
  - Response times returning to normal
  - Error rate < 1%
  - CPU/Memory stable
  - Database connections normal
- [ ] **Alert Team**: Notify via Telegram/Slack
- [ ] **Update Status Page**: If public-facing

### Short-Term (Within 1 hour)

- [ ] **Document Incident**:
  - What went wrong?
  - When did it happen?
  - What was rolled back?
  - What data (if any) was lost?
  - Root cause analysis
- [ ] **Create GitHub Issue**: Track incident
- [ ] **Update Runbooks**: Document lessons learned
- [ ] **Review Monitoring**: Why didn't alerts catch it earlier?

### Medium-Term (Within 24 hours)

- [ ] **Root Cause Analysis**: Deep dive into what caused the issue
- [ ] **Fix and Test**: Prepare corrected deployment
- [ ] **Update Tests**: Add regression tests to prevent recurrence
- [ ] **Team Post-Mortem**: Blameless discussion of what happened

---

## Rollback Testing

**Monthly Drill** (scheduled):
1. Schedule test rollback during maintenance window
2. Follow rollback procedure on staging
3. Measure time to complete
4. Document any issues or improvements
5. Update this document

**Test Script**:
```bash
# Staging rollback test
cd /home/ubuntu/Titan-staging
CURRENT_TAG=$(git describe --tags)
PREV_TAG=$(git tag --sort=-creatordate | sed -n '2p')

echo "Current: $CURRENT_TAG"
echo "Rolling back to: $PREV_TAG"

git checkout "tags/$PREV_TAG"
pm2 restart titan-backend-staging

# Time this process
# Document duration
# Verify health
curl -s https://staging.zala.ir/api/health

# Rollback the rollback (return to current)
git checkout "tags/$CURRENT_TAG"
pm2 restart titan-backend-staging
```

---

## Communication Templates

### Telegram Alert (Rollback Initiated)

```
🚨 EMERGENCY ROLLBACK INITIATED

Environment: Production
From: v1.0.0
To: v0.9.0
Reason: High error rate (12%)
Time: 2025-11-01 14:30 UTC
Operator: @username

Status: In progress...
ETA: 5 minutes
```

### Telegram Alert (Rollback Complete)

```
✅ ROLLBACK COMPLETED

Environment: Production
Version: v0.9.0
Duration: 4 minutes
Downtime: < 1 minute

Health Check: ✅ PASS
Error Rate: 0.1% (normal)
Response Time: 250ms p95

Action Items:
- RCA scheduled for tomorrow 10 AM
- Fix branch: hotfix/v1.0.1
```

### Team Notification (Post-Mortem)

```
📋 Post-Mortem: Production Rollback (2025-11-01)

**Incident Summary**:
- Time: 14:30-14:35 UTC
- Duration: 5 minutes
- Severity: P1 (High)
- Impact: ~500 affected requests

**Root Cause**:
[Description of what went wrong]

**Resolution**:
Rolled back to v0.9.0

**Action Items**:
1. [ ] Add integration test for XYZ
2. [ ] Update deployment checklist
3. [ ] Improve monitoring alerts

**Lessons Learned**:
[Key takeaways]
```

---

## Contacts & Escalation

### Emergency Contacts

**On-Call Engineer**: [Phone/Telegram]
**Technical Lead**: [Phone/Telegram]
**DevOps**: [Phone/Telegram]
**Database Admin**: [Phone/Telegram]

### Escalation Path

1. **L1 (0-5 min)**: On-call engineer attempts rollback
2. **L2 (5-15 min)**: Escalate to technical lead if rollback fails
3. **L3 (15-30 min)**: Escalate to senior management for major incidents
4. **L4 (30+ min)**: All-hands emergency meeting

---

## Rollback Metrics

Track and review these metrics monthly:

- **Number of rollbacks**: Target < 1 per month
- **Average rollback time**: Target < 10 minutes
- **Rollback success rate**: Target > 95%
- **Mean Time To Detect (MTTD)**: Target < 5 minutes
- **Mean Time To Recover (MTTR)**: Target < 15 minutes

---

## Related Documents

- [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md) - Pre-deployment checklist
- [MONITORING_AND_SAFETY.md](./MONITORING_AND_SAFETY.md) - Monitoring setup
- [BACKUP_RESTORE_GUIDE.md](./BACKUP_RESTORE_GUIDE.md) - Database backup procedures

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-01 | Initial rollback plan created (Phase 6C) |

---

**Maintained by**: DevOps Team  
**Last Reviewed**: November 1, 2025  
**Next Review**: December 1, 2025

---

**⚠️  Remember**: Rollbacks are temporary solutions. Always follow up with root cause analysis and proper fixes.
