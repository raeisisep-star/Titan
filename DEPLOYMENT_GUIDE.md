# TITAN Dashboard v3.1.0 - Deployment Guide

**تاریخ**: 2025-11-15  
**Branch**: `genspark_ai_developer` → `main`  
**PR**: #76

---

## 📋 Pre-Deployment Checklist

### 1. Code Review

- [ ] Review all 12 commits in PR #76
- [ ] Verify no sensitive data in commits
- [ ] Check that all tests pass (if applicable)
- [ ] Confirm no debugging code left in production files

### 2. Database

- [ ] Verify `v_dashboard_portfolio` view exists and has data
- [ ] Verify `v_dashboard_trading` view exists and has data
- [ ] Check PostgreSQL connection string in `.env`
- [ ] Confirm database is accessible from backend

### 3. External APIs

- [ ] MEXC API accessible (no API key required for public endpoints)
- [ ] Fear & Greed Index API accessible: `https://api.alternative.me/fng/`
- [ ] CoinGecko API accessible: `https://api.coingecko.com/api/v3/global`

### 4. Environment Variables

Check `.env` file:

```bash
DATABASE_URL=postgresql://titan_user:password@localhost:5433/titan_trading
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=5000
```

---

## 🚀 Deployment Steps

### Step 1: Merge PR to Main

```bash
# On local machine or via GitHub UI:
1. Go to PR #76: https://github.com/raeisisep-star/Titan/pull/76
2. Review final changes
3. Click "Merge Pull Request"
4. Select "Squash and Merge" (recommended) or "Create a merge commit"
5. Confirm merge
```

### Step 2: Pull Latest Changes on Production Server

```bash
# SSH into production server
ssh user@your-server.com

# Navigate to project directory
cd /home/ubuntu/Titan

# Checkout main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify correct version
git log --oneline -1
# Should show: Merge pull request #76...
```

### Step 3: Install Dependencies (if needed)

```bash
# Only if package.json changed
npm install

# Verify no vulnerabilities
npm audit
```

### Step 4: Restart Backend with PM2

```bash
# Reload PM2 processes (zero-downtime)
pm2 reload titan-backend

# Or restart if reload fails
pm2 restart titan-backend

# Check status
pm2 status

# Check logs
pm2 logs titan-backend --lines 50 --nostream
```

### Step 5: Purge Cloudflare Cache

**Critical**: Cloudflare caches static files for 4 hours by default.

#### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to https://dash.cloudflare.com
2. Select domain: `zala.ir`
3. Navigate to: **Caching** → **Configuration**
4. Click: **Purge Everything**
5. Confirm purge
6. Wait 30-60 seconds for propagation

#### Option B: Via API (Automated)

```bash
# Requires Cloudflare API token
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
     -H "Authorization: Bearer {api_token}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
```

#### Option C: Development Mode (Testing)

1. Cloudflare Dashboard → **Caching** → **Configuration**
2. Enable **Development Mode** (bypasses cache for 3 hours)
3. Test the deployment
4. Disable Development Mode after verification

---

## ✅ Post-Deployment Verification

### 1. Backend Health Check

```bash
# Test API health
curl -s https://zala.ir/api/health | jq

# Expected response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": {"status": "connected"},
      "redis": {"status": "connected"},
      "market": {"status": "ok"}
    }
  }
}
```

### 2. Dashboard API Check

```bash
# Test comprehensive dashboard endpoint
curl -s https://zala.ir/api/dashboard/comprehensive-real | jq '.success, .data.market.btcPrice, .data.portfolio.totalBalance'

# Expected: true, <BTC price>, <balance>
```

### 3. Frontend Verification

#### Test in Browser (Incognito Mode):

1. Open Chrome/Firefox in **Incognito/Private mode**
2. Navigate to: `https://zala.ir`
3. Open DevTools (`F12`) → Console tab
4. Login with: `admin` / `admin`

#### Expected Console Output:

```
✅ TITAN Config loaded for: production
✅ Axios configured with baseURL: /api
✅ Token verified, user authenticated: admin
✅ Dashboard module loaded successfully
✅ Dashboard data loaded successfully
```

#### Expected Dashboard Display:

- ✅ Only 4 core widgets visible
- ✅ Real BTC price (~$96k-99k from MEXC)
- ✅ Real ETH price (~$3k-3.2k from MEXC)
- ✅ Fear & Greed Index (0-100)
- ✅ BTC Dominance percentage
- ✅ Portfolio balance from database
- ✅ Chart rendering correctly
- ❌ No AI agents visible
- ❌ No experimental widgets
- ❌ No 404 errors in Network tab

### 4. Performance Check

```bash
# Check PM2 status
pm2 status

# Check memory usage
pm2 info titan-backend | grep memory

# Check logs for errors
pm2 logs titan-backend --lines 100 --nostream | grep -i error
```

---

## 🐛 Troubleshooting

### Issue 1: Dashboard shows dashes (—) instead of data

**Cause**: API call failing or Cloudflare cache issue

**Solution**:

1. Check Network tab for failed API calls
2. Purge Cloudflare cache again
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Check backend logs: `pm2 logs titan-backend`

### Issue 2: Login works but dashboard doesn't load

**Cause**: Module loading error or 404 on JavaScript files

**Solution**:

1. Check Console for errors
2. Look for 404 errors in Network tab
3. Verify files exist: `ls -la /home/ubuntu/Titan/public/static/modules/`
4. Purge Cloudflare cache
5. Restart PM2: `pm2 restart titan-backend`

### Issue 3: 404 errors on `/api/api/...`

**Cause**: Double `/api` prefix (should be fixed in v3.1.0)

**Solution**:

1. Verify you're on latest commit: `git log --oneline -1`
2. Check files are updated: `grep "comprehensive-real" public/static/modules/dashboard.js`
3. Should show: `axios.get('/dashboard/comprehensive-real')` (no `/api` prefix)

### Issue 4: Cloudflare shows old version

**Cause**: Cache not purged or DNS propagation delay

**Solution**:

1. Purge cache again in Cloudflare
2. Wait 5-10 minutes
3. Test in Incognito mode
4. Check cache status in Network tab headers:
   - `cf-cache-status: HIT` → cached (old)
   - `cf-cache-status: MISS` → fresh (new)
   - `cf-cache-status: DYNAMIC` → not cached

---

## 📊 Monitoring

### After Deployment, Monitor:

1. **Error Logs**:

   ```bash
   tail -f /home/ubuntu/Titan/logs/backend-error.log
   ```

2. **Access Logs**:

   ```bash
   pm2 logs titan-backend --lines 100
   ```

3. **Database Connections**:

   ```bash
   # Check PostgreSQL connections
   PGPASSWORD=your_password psql -h localhost -U titan_user -d titan_db -c "SELECT count(*) FROM pg_stat_activity WHERE datname='titan_db';"
   ```

4. **Redis Status**:

   ```bash
   redis-cli ping
   # Expected: PONG
   ```

5. **API Response Times**:
   - Check `/api/health` response time
   - Should be < 500ms

---

## 🔄 Rollback Plan

If deployment fails, rollback to previous version:

```bash
# Find previous working commit
git log --oneline -10

# Rollback to specific commit (example)
git checkout c2bc9ba

# Restart PM2
pm2 restart titan-backend

# Purge Cloudflare cache again
```

Or use GitHub to revert the merge:

1. Go to PR #76
2. Click "Revert" button
3. Create new PR
4. Merge revert PR

---

## 📝 Post-Deployment Tasks

- [ ] Update version tag: `git tag v3.1.0 && git push origin v3.1.0`
- [ ] Notify team of deployment
- [ ] Update documentation if needed
- [ ] Monitor logs for 24 hours
- [ ] Plan next phase (other pages cleanup)

---

## 🎯 Success Criteria

Deployment is successful if:

- ✅ No 404 errors in browser console
- ✅ Dashboard loads within 2 seconds
- ✅ Real data displays (BTC ~$96k-99k, ETH ~$3k)
- ✅ Auto-refresh works every 30 seconds
- ✅ No backend errors in PM2 logs
- ✅ Database queries return data
- ✅ All 4 widgets display correctly

---

**Date**: 2025-11-15  
**Deployed By**: GenSpark AI Developer  
**Verified By**: ******\_******  
**Status**: ⬜ Pending / ✅ Complete / ❌ Failed
