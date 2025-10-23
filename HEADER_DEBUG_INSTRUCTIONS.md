# 🔍 Header Debugging Instructions - Step by Step

**Date:** 2025-10-20  
**Issue:** HSTS and security headers configured but not appearing in responses  
**Status:** Ready for diagnostic testing

---

## 📋 Quick Summary

You've successfully applied the Nginx configuration and reloaded without errors, but HSTS and security headers aren't appearing. This guide will help you:

1. ✅ Verify which server block is active
2. ✅ Determine if Nginx is sending headers
3. ✅ Identify if Cloudflare is stripping headers
4. ✅ Fix any configuration issues

---

## 🚀 Quick Start (Run This First)

### Step 1: Apply Updated Config with Diagnostic Header

```bash
# Copy the updated configuration (includes X-Titan-Config diagnostic header)
sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### Step 2: Run Automatic Diagnostic

```bash
# Run the diagnostic script
cd /home/ubuntu/Titan
./scripts/diagnose-nginx.sh
```

This will automatically check:
- ✅ Nginx service status
- ✅ Configuration files and symlinks
- ✅ Server name conflicts
- ✅ Headers in local tests (bypass Cloudflare)
- ✅ Headers in external tests (through Cloudflare)
- ✅ Recent errors
- ✅ Worker processes

---

## 🔬 Manual Testing (If Needed)

### Test 1: Verify Diagnostic Header (Most Important!)

```bash
# Test direct to Nginx (bypasses Cloudflare)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "x-titan"
```

**Expected Result:**
```
x-titan-config: zala-ssl-enhanced-v2
```

**Interpretation:**
- ✅ **Header appears:** Configuration is active → Continue to Test 2
- ❌ **Header missing:** Wrong server block active → See [Troubleshooting Section](#wrong-server-block)

---

### Test 2: Check HSTS Header Locally

```bash
# Test HSTS header (direct to Nginx)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "strict-transport"
```

**Expected Result:**
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**Interpretation:**
- ✅ **Header appears:** Nginx is working correctly → Check Cloudflare
- ❌ **Header missing:** Despite X-Titan-Config being present → See [Advanced Troubleshooting](#headers-missing-locally)

---

### Test 3: Check Headers Externally (Through Cloudflare)

```bash
# Test through Cloudflare
curl -I https://www.zala.ir | grep -i "strict-transport"
```

**Interpretation:**
- ✅ **Header appears:** Everything working! ✨
- ❌ **Header missing but present locally:** Cloudflare is removing it → See [Cloudflare Configuration](#cloudflare-stripping-headers)

---

## 🛠️ Troubleshooting Scenarios

### Scenario A: X-Titan-Config Header Missing {#wrong-server-block}

**Problem:** Configuration isn't being used at all.

**Diagnosis Steps:**

1. **Check symlink:**
   ```bash
   ls -la /etc/nginx/sites-enabled/ | grep zala
   readlink -f /etc/nginx/sites-enabled/zala
   ```
   
   Expected: `/etc/nginx/sites-enabled/zala -> /etc/nginx/sites-available/zala`

2. **Check server_name:**
   ```bash
   grep "server_name" /etc/nginx/sites-available/zala
   ```
   
   Expected: `server_name zala.ir www.zala.ir;`

3. **Check for conflicts:**
   ```bash
   # Look for default_server that might catch requests
   grep -r "default_server" /etc/nginx/sites-enabled/
   
   # Look for duplicate server_name
   grep -r "server_name.*zala.ir" /etc/nginx/sites-enabled/
   ```

**Solutions:**

- **Missing symlink:**
  ```bash
  sudo ln -sf /etc/nginx/sites-available/zala /etc/nginx/sites-enabled/zala
  sudo nginx -t && sudo systemctl reload nginx
  ```

- **Duplicate configs:**
  ```bash
  # Remove duplicate
  sudo rm /etc/nginx/sites-enabled/[duplicate-file]
  sudo systemctl reload nginx
  ```

- **Force restart (if reload didn't work):**
  ```bash
  sudo systemctl restart nginx
  ```

---

### Scenario B: X-Titan-Config Present, But HSTS Missing {#headers-missing-locally}

**Problem:** Configuration is active but headers aren't being added.

**Diagnosis Steps:**

1. **Check different endpoints:**
   ```bash
   # Test root
   curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/
   
   # Test API
   curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/api/health
   
   # Test static file
   curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/index.html
   ```

2. **Check error log:**
   ```bash
   sudo tail -30 /var/log/nginx/error.log | grep -v "ssl_stapling"
   ```

**Solutions:**

- **Restart Nginx completely:**
  ```bash
  sudo systemctl restart nginx
  
  # Wait 2 seconds
  sleep 2
  
  # Test again
  curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/ | grep -iE "(x-titan|strict-transport)"
  ```

- **Check if backend is overriding:**
  ```bash
  # Test Nginx health endpoint (doesn't proxy to backend)
  curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/nginx-health
  ```
  
  If headers appear here but not on `/`, backend might be interfering.

---

### Scenario C: Headers Work Locally, Missing Externally {#cloudflare-stripping-headers}

**Problem:** Cloudflare is removing security headers.

**✅ This is EXPECTED behavior** - Cloudflare handles security at the edge.

**Solution: Enable in Cloudflare Dashboard**

1. **Go to Cloudflare Dashboard:**
   - Domain: zala.ir
   - Section: **SSL/TLS** → **Edge Certificates**

2. **Enable HSTS:**
   - Toggle: **HSTS (HTTP Strict Transport Security)** → ON
   - Settings:
     - Max Age: **31536000** seconds (1 year)
     - Include subdomains: ✅
     - Preload: ✅
     - No-Sniff Header: ✅

3. **Alternative: Transform Rules** (for other headers)
   - Go to: **Rules** → **Transform Rules** → **HTTP Response Header Modification**
   - Add rules for:
     - X-Frame-Options: SAMEORIGIN
     - X-Content-Type-Options: nosniff
     - X-XSS-Protection: 1; mode=block
     - Referrer-Policy: strict-origin-when-cross-origin

4. **Document in PR:**
   - Note that security headers are managed at Cloudflare edge
   - This is acceptable and actually preferred for CDN-backed sites

---

## 🧪 Run Fixed Test Suite

After resolving issues, run the updated test suite:

```bash
cd /home/ubuntu/Titan
./scripts/test-ssl-acceptance-fixed.sh
```

**Changes in Fixed Version:**
- ✅ Health endpoint: Expects `{"ok": true}` instead of `{"data":{"status":"healthy"}}`
- ✅ Auth endpoint: Tries multiple paths (`/api/v1/auth/login`, `/api/auth/login`, etc.)
- ✅ Authenticated endpoints: Tries multiple common endpoints
- ✅ Adds diagnostic test (Test 9) that checks X-Titan-Config header
- ✅ Shows full response headers for debugging

---

## 📊 Decision Matrix

Based on test results, follow this decision tree:

```
Test X-Titan-Config header locally
│
├─ ❌ Missing
│   └─> [Scenario A] Wrong server block
│       └─> Check symlink, server_name, conflicts
│
├─ ✅ Present
    │
    └─> Test HSTS header locally
        │
        ├─ ❌ Missing
        │   └─> [Scenario B] Headers not being added
        │       └─> Restart Nginx, check error logs
        │
        └─ ✅ Present
            │
            └─> Test HSTS header externally (through Cloudflare)
                │
                ├─ ❌ Missing
                │   └─> [Scenario C] Cloudflare stripping headers
                │       └─> Enable HSTS in Cloudflare Dashboard
                │       └─> This is NORMAL and ACCEPTABLE
                │
                └─ ✅ Present
                    └─> 🎉 SUCCESS! All working correctly
```

---

## 🎯 Expected Final State

### Local Test (Direct to Nginx)
```bash
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir
```

**Should show:**
```
HTTP/2 200
server: nginx
date: Sun, 20 Oct 2025 16:40:00 GMT
content-type: text/html
x-titan-config: zala-ssl-enhanced-v2
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
```

### External Test (Through Cloudflare)
```bash
curl -I https://www.zala.ir
```

**Should show (if Cloudflare HSTS enabled):**
```
HTTP/2 200
date: Sun, 20 Oct 2025 16:40:00 GMT
content-type: text/html
strict-transport-security: max-age=31536000; includeSubDomains; preload
cf-ray: ...
cf-cache-status: ...
```

**Note:** Other headers might be missing externally - this is OK if managed by Cloudflare.

---

## 📝 Commands Cheat Sheet

```bash
# 1. Apply updated config
sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala
sudo nginx -t && sudo systemctl reload nginx

# 2. Run diagnostic
cd /home/ubuntu/Titan
./scripts/diagnose-nginx.sh

# 3. Quick header check (local)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -iE "(x-titan|strict-transport|x-frame|x-content|x-xss|referrer)"

# 4. Quick header check (external)
curl -I https://www.zala.ir | grep -iE "(strict-transport|x-frame)"

# 5. Check Nginx status
sudo systemctl status nginx

# 6. View recent errors
sudo tail -30 /var/log/nginx/error.log | grep -v "ssl_stapling"

# 7. Restart Nginx (if needed)
sudo systemctl restart nginx

# 8. Run fixed test suite
./scripts/test-ssl-acceptance-fixed.sh
```

---

## 🆘 If Still Stuck

Generate a diagnostic report:

```bash
cd /home/ubuntu/Titan
./scripts/diagnose-nginx.sh > nginx-diagnostic-report.txt

# Share the report
cat nginx-diagnostic-report.txt
```

Or share these outputs:

```bash
# Configuration
cat /etc/nginx/sites-available/zala | head -80

# Sites enabled
ls -la /etc/nginx/sites-enabled/

# Local header test
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir

# Recent errors
sudo tail -30 /var/log/nginx/error.log
```

---

## 📚 Related Files

- **Updated Config:** `/home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf` ⬅️ Apply this
- **Active Config:** `/etc/nginx/sites-available/zala`
- **Diagnostic Guide:** `/home/ubuntu/Titan/NGINX_HEADER_DIAGNOSTIC.md`
- **Diagnostic Script:** `/home/ubuntu/Titan/scripts/diagnose-nginx.sh` ⬅️ Run this
- **Fixed Test Script:** `/home/ubuntu/Titan/scripts/test-ssl-acceptance-fixed.sh` ⬅️ Run this

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ X-Titan-Config header appears in local tests
2. ✅ HSTS header appears in local tests
3. ✅ Security headers appear in local tests
4. ✅ HSTS enabled in Cloudflare Dashboard (external test)
5. ✅ Test script passes (at least 7/9 tests)
6. ✅ No errors in Nginx logs (except OCSP stapling warning)

---

**Good luck! 🚀**

If you encounter any issues not covered here, share the output from `./scripts/diagnose-nginx.sh`
