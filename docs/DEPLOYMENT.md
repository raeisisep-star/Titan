# 🚀 Deployment Playbook

This document defines the standard deployment process for the Titan Trading Platform.

## Table of Contents

- [Overview](#overview)
- [Environments](#environments)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Post-Deployment Verification](#post-deployment-verification)
- [Emergency Contacts](#emergency-contacts)

---

## Overview

The Titan platform uses a **GitFlow-based deployment model** with strict controls:

- **Staging**: Automatic deployment on merge to `main`
- **Production**: Manual approval required, triggered by release tags

### Key Principles

1. **All changes go through Pull Requests**
2. **Required CI checks must pass**
3. **At least 1 code review approval required**
4. **Staging deployment and testing before production**
5. **No direct pushes to main branch**
6. **Production deployments require manual approval**

---

## Environments

### Staging Environment

- **URL**: https://staging.zala.ir
- **Server**: Ubuntu 22.04 LTS
- **PM2 App Name**: `titan-backend-staging`
- **Database**: PostgreSQL (staging instance)
- **Redis**: Redis 7.x (staging instance)
- **Purpose**: Pre-production testing and validation

### Production Environment

- **URL**: https://www.zala.ir
- **Server**: Ubuntu 22.04 LTS
- **PM2 App Name**: `titan-backend`
- **Database**: PostgreSQL (production instance)
- **Redis**: Redis 7.x (production instance)
- **Purpose**: Live production system

---

## Deployment Process

### Step 1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Step 2: Develop and Test Locally

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run tests
npm test

# Build project
npm run build
```

### Step 3: Create Pull Request

1. Push your branch to GitHub
2. Create PR from your branch to `main`
3. Fill out PR template with:
   - Description of changes
   - Testing performed
   - Breaking changes (if any)
   - Related issues/tickets

### Step 4: Code Review & CI

**Required Checks (must pass):**
- ✅ Build
- ✅ Lint
- ✅ Test
- ✅ E2E (Staging)

**Required Reviews:**
- At least 1 approval from code owner (@raeisisep-star)

### Step 5: Merge to Main

Once approved and CI passes:

```bash
# GitHub UI: Click "Squash and merge"
# OR via CLI:
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Step 6: Automatic Staging Deployment

After merge, GitHub Actions automatically:

1. Deploys to staging server
2. Restarts PM2 process
3. Runs health checks
4. Triggers E2E smoke tests

**Monitor deployment:**
```bash
# Check deployment status
gh run list --limit 5

# Watch logs
gh run watch
```

### Step 7: Staging Verification

Verify deployment on staging:

```bash
# Health check
curl -s https://staging.zala.ir/api/health | jq

# Security headers
curl -sI https://staging.zala.ir/api/health | grep -i "strict-transport\|x-frame\|csp"

# Database connectivity
curl -s https://staging.zala.ir/api/health | jq '.data.services.database'

# Redis connectivity
curl -s https://staging.zala.ir/api/health | jq '.data.services.redis'
```

**Run E2E tests:**
```bash
gh workflow run e2e-staging.yml
```

**Run load tests (optional):**
```bash
# Smoke test (1 minute)
gh workflow run k6-load-test.yml -f test_type=smoke

# Stress test (10 minutes) - off-peak hours only
gh workflow run k6-load-test.yml -f test_type=stress
```

### Step 8: Create Release Tag

Once staging is verified:

```bash
cd /home/ubuntu/Titan
./scripts/release-tag.sh v1.x.x "Release notes here"
```

**Version Format:**
- Major: Breaking changes (v2.0.0)
- Minor: New features (v1.1.0)
- Patch: Bug fixes (v1.0.1)
- RC: Release candidates (v1.0.0-rc1)

### Step 9: Production Deployment (Manual)

Production deployment is triggered by release tags but **requires manual approval**:

1. **Trigger deployment:**
   ```bash
   # Push tag triggers production deployment workflow
   git push origin v1.x.x
   ```

2. **Approve deployment:**
   - Go to GitHub Actions
   - Find "Deploy to Production" workflow
   - Click "Review deployments"
   - Select "production" environment
   - Click "Approve and deploy"

3. **Monitor deployment:**
   ```bash
   # SSH to production server
   ssh ubuntu@production-server

   # Watch PM2 logs
   pm2 logs titan-backend --lines 50

   # Check PM2 status
   pm2 status
   ```

### Step 10: Production Verification

**Immediate checks (0-5 minutes):**

```bash
# Health endpoint
curl -s https://www.zala.ir/api/health | jq

# Security headers
curl -sI https://www.zala.ir/api/health | grep -i "strict-transport\|x-frame\|csp"

# Response time
time curl -s https://www.zala.ir/api/health > /dev/null

# Database connectivity
curl -s https://www.zala.ir/api/health | jq '.data.services.database'

# Redis connectivity
curl -s https://www.zala.ir/api/health | jq '.data.services.redis'
```

**Extended monitoring (2 hours):**

Monitor:
- Error rates (should be < 0.1%)
- Response times (p95 < 500ms)
- Database connections (should be stable)
- Redis connections (should be stable)
- Memory usage (should not grow continuously)
- CPU usage (should be < 70%)

**Tools:**
```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Database connections
cd /home/ubuntu/Titan && ./scripts/health-checks.sh

# Weekly PostgreSQL report
cd /home/ubuntu/Titan && ./scripts/pg-weekly-report.sh
```

### Step 11: Update CHANGELOG

After successful deployment:

```bash
# Update CHANGELOG.md
vi CHANGELOG.md

# Commit and push
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v1.x.x"
git push origin main
```

---

## Rollback Procedures

If deployment fails or critical issues are detected, follow rollback procedures in [docs/ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md).

**Quick rollback (emergency):**

```bash
# SSH to server
ssh ubuntu@production-server

# Rollback to previous tag
cd /home/ubuntu/Titan
git fetch --tags
git checkout tags/v1.0.0  # previous stable version
pm2 restart titan-backend

# Verify
curl -s https://www.zala.ir/api/health | jq
```

---

## Post-Deployment Verification

### Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Security headers present (HSTS, CSP, X-Frame-Options)
- [ ] Database connectivity OK
- [ ] Redis connectivity OK
- [ ] Response times < 500ms (p95)
- [ ] Error rate < 0.1%
- [ ] No memory leaks (stable memory usage)
- [ ] PM2 processes running (2 instances in cluster mode)
- [ ] Logs show no critical errors
- [ ] CHANGELOG.md updated

### Monitoring Windows

- **First 30 minutes**: Watch logs continuously
- **First 2 hours**: Check metrics every 15 minutes
- **First 24 hours**: Check metrics every hour
- **First 48 hours**: Check metrics every 4 hours

---

## Emergency Contacts

- **Primary**: @raeisisep-star (GitHub)
- **Telegram**: Configure alerts in .env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
- **Email**: Configure in monitoring system

---

## Related Documentation

- [Rollback Plan](./ROLLBACK_PLAN.md)
- [Go-Live Checklist](./GO_LIVE_CHECKLIST.md)
- [Monitoring & Safety](./MONITORING_AND_SAFETY.md)
- [Database Maintenance](./DATABASE_MAINTENANCE_PLAN.md)

---

**Last Updated**: 2025-11-01  
**Maintained By**: @raeisisep-star
