# Load Testing with k6

This directory contains k6 load testing scripts for the Titan/Zala trading platform.

## Overview

We use [k6](https://k6.io/) for load testing because it's:
- **Fast**: Written in Go, handles high concurrency
- **Scriptable**: Tests written in JavaScript
- **Developer-friendly**: Easy to version control and integrate with CI/CD
- **Comprehensive**: Rich metrics and thresholds

---

## Test Types

### 1. Smoke Test (`k6-smoke.js`)

**Purpose**: Quick validation that system works under minimal load

**Configuration**:
- Duration: 1 minute
- VUs (Virtual Users): 10
- Target RPS: ~10 requests/second

**Thresholds**:
- Error rate < 1%
- p95 response time < 800ms
- p99 response time < 1500ms

**When to run**:
- Before every deployment
- After configuration changes
- Quick sanity checks

**Usage**:
```bash
# Run locally against staging
BASE_URL=https://staging.zala.ir k6 run ops/loadtest/k6-smoke.js

# Run against production (use with caution)
BASE_URL=https://www.zala.ir k6 run ops/loadtest/k6-smoke.js
```

---

### 2. Stress Test (`k6-stress.js`)

**Purpose**: Find breaking points by gradually increasing load

**Configuration**:
- Duration: 10 minutes
- VUs: 0 → 10 → 30 → 50 → 0 (gradual ramp)
- Target RPS: ~5 → ~50 requests/second

**Stages**:
1. Ramp up to 10 VUs (2 min)
2. Stay at 10 VUs (2 min)
3. Ramp up to 30 VUs (2 min)
4. Stay at 30 VUs (2 min)
5. Spike to 50 VUs (1 min)
6. Ramp down to 0 (1 min)

**Thresholds**:
- Error rate < 2% (more lenient under stress)
- p95 response time < 1000ms
- Average response time < 500ms

**When to run**:
- Before major releases
- After infrastructure changes
- Capacity planning

**Usage**:
```bash
# Run against staging (recommended)
BASE_URL=https://staging.zala.ir k6 run ops/loadtest/k6-stress.js

# Run with custom stages
k6 run --vus 10 --duration 5m ops/loadtest/k6-stress.js
```

---

### 3. Soak Test (`k6-soak.js`)

**Purpose**: Verify stability over extended period (endurance test)

**Configuration**:
- Duration: 30 minutes
- VUs: 5 constant
- Target RPS: ~5 requests/second

**What it detects**:
- Memory leaks
- Database connection pool exhaustion
- Gradual performance degradation
- Resource accumulation issues

**Thresholds**:
- Error rate < 0.5% (very strict)
- p95 response time < 600ms
- Average response time < 400ms
- Less than 50 requests > 1 second

**When to run**:
- Before production go-live
- Weekly on staging (automated)
- After suspected memory leak fixes

**Usage**:
```bash
# Run full 30-minute soak test
BASE_URL=https://staging.zala.ir k6 run ops/loadtest/k6-soak.js

# Run shorter version for quick test
k6 run --duration 5m --vus 5 ops/loadtest/k6-soak.js
```

---

## Installation

### Option 1: Using package manager (Linux/macOS)

```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS (Homebrew)
brew install k6
```

### Option 2: Using binary (Windows/Linux/macOS)

Download from: https://k6.io/docs/get-started/installation/

---

## Running Tests

### Local Execution

```bash
# Basic run
k6 run ops/loadtest/k6-smoke.js

# Custom target URL
BASE_URL=https://your-domain.com k6 run ops/loadtest/k6-smoke.js

# Save results to JSON
k6 run ops/loadtest/k6-smoke.js --out json=results.json

# Increase verbosity
k6 run ops/loadtest/k6-smoke.js --verbose

# Quiet mode (only errors)
k6 run ops/loadtest/k6-smoke.js --quiet
```

### GitHub Actions Execution

Tests are automatically triggered via GitHub Actions:

**Scheduled** (nightly at 2 AM UTC):
- Smoke test runs automatically on staging

**Manual trigger**:
```bash
# Using GitHub CLI
gh workflow run k6-load-test.yml \
  -f test_type=smoke \
  -f target_url=https://staging.zala.ir

# Via GitHub UI
# Go to Actions → k6 Load Testing → Run workflow
```

**On release tags** (optional):
- Uncomment the `push.tags` section in workflow file
- Smoke test runs automatically when you push a release tag

---

## Interpreting Results

### Key Metrics

1. **http_reqs**: Total number of HTTP requests made
2. **http_req_failed**: Percentage of failed requests
3. **http_req_duration**: Response time distribution
   - `avg`: Average response time
   - `p(50)` / `med`: Median (50th percentile)
   - `p(90)`: 90th percentile
   - `p(95)`: 95th percentile (SLA target)
   - `p(99)`: 99th percentile (worst-case)
   - `max`: Maximum response time

4. **vus**: Number of active virtual users
5. **iterations`: Number of script iterations completed

### Success Criteria

**Smoke Test**:
- ✅ Error rate < 1%
- ✅ p95 < 800ms
- ✅ All security headers present

**Stress Test**:
- ✅ Error rate < 2%
- ✅ p95 < 1000ms
- ✅ No significant degradation at peak load

**Soak Test**:
- ✅ Error rate < 0.5%
- ✅ p95 < 600ms
- ✅ No performance degradation over 30 minutes
- ✅ Less than 50 slow requests (>1s)

---

## Troubleshooting

### High Error Rates

**Symptoms**: `http_req_failed` > 2%

**Possible causes**:
1. Rate limiting triggered (check `X-RateLimit-*` headers)
2. Database connection pool exhausted
3. Server overload (check CPU/Memory on server)
4. Network issues

**Actions**:
- Check server logs: `pm2 logs titan-backend`
- Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`
- Verify rate limits: `redis-cli KEYS "rate-limit:*"`

### Slow Response Times

**Symptoms**: `http_req_duration` p95 > 1000ms

**Possible causes**:
1. Slow database queries
2. Insufficient server resources
3. Redis latency
4. Network latency

**Actions**:
- Check database slow queries (Phase 4 scripts)
- Monitor system resources: `htop`, `free -h`, `df -h`
- Check Redis performance: `redis-cli --latency`
- Profile application with Node.js profiler

### Test Failures

**Connection refused**:
```bash
# Verify service is running
curl https://staging.zala.ir/api/health

# Check firewall
sudo ufw status

# Check Nginx
sudo systemctl status nginx
```

**Certificate errors**:
```bash
# Verify SSL certificate
echo | openssl s_client -servername staging.zala.ir -connect staging.zala.ir:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Best Practices

### DO ✅

1. **Test against staging first**: Always run tests on staging before production
2. **Start small**: Run smoke test before stress/soak tests
3. **Monitor during tests**: Watch server metrics (CPU, Memory, Disk)
4. **Off-peak hours**: Run stress/soak tests during low-traffic periods
5. **Document baselines**: Record baseline metrics for comparison
6. **Gradual ramp-up**: Use stages to gradually increase load
7. **Realistic scenarios**: Model actual user behavior

### DON'T ❌

1. **Don't test production without approval**: Get explicit approval first
2. **Don't run stress tests during peak hours**: Avoid impacting real users
3. **Don't ignore warnings**: Investigate any anomalies immediately
4. **Don't test third-party APIs**: Mock external dependencies
5. **Don't run multiple tests simultaneously**: One test at a time
6. **Don't skip baseline metrics**: Always record pre-test state

---

## CI/CD Integration

Load tests are integrated with GitHub Actions:

**Workflow file**: `.github/workflows/k6-load-test.yml`

**Triggers**:
- Manual dispatch (any test type, any target)
- Scheduled (nightly smoke test on staging)
- Optional: On release tags

**Artifacts**:
- Raw results JSON
- Summary JSON
- Stored for 30 days

**Access results**:
```bash
# List recent test runs
gh run list --workflow=k6-load-test.yml --limit 5

# Download artifacts
gh run download <run-id>
```

---

## Advanced Usage

### Custom Scenarios

Create custom test scenarios by copying and modifying existing scripts:

```javascript
// custom-scenario.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,
  duration: '5m',
};

export default function () {
  // Your custom logic here
  const res = http.get('https://your-api.com/endpoint');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

### Environment Variables

All tests support environment variables:

```bash
BASE_URL=https://custom.url k6 run ops/loadtest/k6-smoke.js
```

### Output Formats

k6 supports multiple output formats:

```bash
# JSON output
k6 run --out json=results.json ops/loadtest/k6-smoke.js

# CSV output (metrics)
k6 run --out csv=metrics.csv ops/loadtest/k6-smoke.js

# Cloud output (requires k6 Cloud account)
k6 run --out cloud ops/loadtest/k6-smoke.js
```

---

## Further Reading

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [HTTP Performance Testing Guide](https://k6.io/docs/testing-guides/api-load-testing/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

---

## Support

For issues or questions:
1. Check [GO_LIVE_CHECKLIST.md](../../docs/GO_LIVE_CHECKLIST.md)
2. Review server logs and metrics
3. Consult [MONITORING_AND_SAFETY.md](../../docs/MONITORING_AND_SAFETY.md)
4. Create GitHub issue with test results attached

---

**Last Updated**: November 1, 2025  
**Phase**: 6B - Load Testing
