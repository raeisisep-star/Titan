# Nginx Header Diagnostic Guide
**Date:** 2025-10-20  
**Issue:** HSTS and security headers not appearing in HTTP responses despite configuration

---

## 🔍 Current Status

### ✅ What's Working
- Nginx configuration was successfully applied to `/etc/nginx/sites-available/zala`
- `nginx -t` passed without errors
- `systemctl reload nginx` completed successfully
- No syntax errors in configuration

### ❌ What's Not Working
- HSTS header (`Strict-Transport-Security`) not appearing in responses
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.) not appearing
- Headers configured with `always` directive but still missing

---

## 🛠️ Diagnostic Steps

### Step 1: Add Diagnostic Header

**Purpose:** Verify the correct Nginx server block is being used.

**Action Required:**
```bash
# The updated configuration file already has X-Titan-Config header added
# Copy the updated config
sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

**Expected Result:** `X-Titan-Config: zala-ssl-enhanced-v2` should appear in all responses.

---

### Step 2: Test Headers Locally (Bypass Cloudflare)

**Purpose:** Determine if Nginx is sending headers or if Cloudflare is stripping them.

**Commands:**
```bash
# Test direct to Nginx (bypasses Cloudflare)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir

# Check for specific headers
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "x-titan"
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "strict-transport"
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "x-frame"
```

**Interpretation:**
- **If headers appear locally:** Cloudflare is stripping them → Enable in Cloudflare Edge
- **If headers DON'T appear locally:** Nginx configuration issue → Continue to Step 3

---

### Step 3: Check Nginx Configuration Files

**Purpose:** Ensure there are no conflicting configurations.

**Commands:**
```bash
# Check which configs are enabled
ls -la /etc/nginx/sites-enabled/

# Verify symlink points to correct file
readlink -f /etc/nginx/sites-enabled/zala

# Check server_name directives
grep -nH "server_name" /etc/nginx/sites-available/zala

# Check for any default_server directives that might be catching requests
grep -r "default_server" /etc/nginx/sites-enabled/

# Search for any other server blocks listening on port 443
grep -r "listen.*443" /etc/nginx/sites-enabled/
```

**Look for:**
- ✅ Symlink exists: `/etc/nginx/sites-enabled/zala` → `/etc/nginx/sites-available/zala`
- ✅ `server_name zala.ir www.zala.ir;` matches your domain
- ❌ No other server blocks claiming `default_server` on port 443
- ❌ No duplicate server_name directives

---

### Step 4: Check Nginx Error Logs

**Purpose:** Identify any warnings or errors.

**Commands:**
```bash
# Check for OCSP stapling errors
sudo tail -50 /var/log/nginx/error.log | grep -i "ssl_stapling"

# Check for any SSL-related errors
sudo tail -50 /var/log/nginx/error.log | grep -i "ssl"

# Check zala-specific error log
sudo tail -50 /var/log/nginx/zala-error.log
```

**Known Issues:**
- **OCSP Stapling Warning:** `ssl_stapling ignored, issuer certificate not found`
  - **Impact:** Does NOT affect security headers
  - **Solution:** Can be disabled or fixed by adding full certificate chain

---

### Step 5: Test with Different Locations

**Purpose:** Check if headers appear on different endpoints.

**Commands:**
```bash
# Test root path
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/

# Test API path
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/api/health

# Test static file path
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/index.html

# Test nginx health endpoint
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/nginx-health
```

**Interpretation:**
- If headers appear on some paths but not others → Location-specific override issue
- If headers don't appear anywhere → Server block not being used

---

### Step 6: Verify Nginx Process

**Purpose:** Ensure Nginx reloaded correctly.

**Commands:**
```bash
# Check Nginx is running
sudo systemctl status nginx

# Check master and worker processes
ps aux | grep nginx

# Force full restart (if reload didn't work)
sudo systemctl restart nginx

# Verify again
sudo nginx -t && sudo systemctl status nginx
```

---

## 🔧 Common Issues and Solutions

### Issue 1: Wrong Server Block Active

**Symptom:** X-Titan-Config header doesn't appear

**Cause:** Different server block catching requests (wrong server_name or default_server)

**Solutions:**
1. Check for `default_server` directive conflicts:
   ```bash
   grep -r "default_server" /etc/nginx/sites-enabled/
   ```

2. Ensure no duplicate server_name:
   ```bash
   grep -r "server_name.*zala.ir" /etc/nginx/sites-enabled/
   ```

3. Make sure only one config is enabled for zala.ir:
   ```bash
   ls -la /etc/nginx/sites-enabled/ | grep zala
   ```

---

### Issue 2: Cloudflare Stripping Headers

**Symptom:** Headers appear locally but not when accessing from internet

**Cause:** Cloudflare proxy removes certain headers by default

**Solutions:**
1. **Enable HSTS in Cloudflare Dashboard:**
   - Go to: SSL/TLS → Edge Certificates
   - Enable "HSTS" with max-age=31536000, includeSubDomains, preload

2. **Use Transform Rules:**
   - Go to: Rules → Transform Rules → HTTP Response Header Modification
   - Add custom headers that Cloudflare preserves

3. **Alternative:** Disable Cloudflare proxy (orange cloud → grey cloud) for testing

---

### Issue 3: add_header Inheritance Issue

**Symptom:** Headers work in some locations but not others

**Cause:** `add_header` in child location blocks overrides parent headers

**Solution:** Ensure `always` parameter is used (already done in config):
```nginx
add_header Strict-Transport-Security "..." always;
```

---

### Issue 4: Nginx Cache

**Symptom:** Old headers still appearing after config change

**Cause:** Nginx cache or browser cache

**Solutions:**
1. Clear Nginx cache:
   ```bash
   sudo rm -rf /var/cache/nginx/*
   sudo systemctl restart nginx
   ```

2. Test with cache-busting:
   ```bash
   curl -I -H "Cache-Control: no-cache" https://www.zala.ir
   ```

---

## 🎯 Quick Diagnostic Script

Run this all-in-one diagnostic:

```bash
#!/bin/bash
echo "=== Nginx Diagnostic Report ==="
echo ""

echo "1. Nginx Status:"
sudo systemctl status nginx --no-pager | head -5
echo ""

echo "2. Sites Enabled:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "3. Server Name Configuration:"
grep -nH "server_name" /etc/nginx/sites-available/zala
echo ""

echo "4. Local Header Test (Direct to Nginx):"
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir 2>/dev/null | grep -iE "(x-titan|strict-transport|x-frame)"
echo ""

echo "5. Recent Nginx Errors:"
sudo tail -20 /var/log/nginx/error.log | grep -v "ssl_stapling"
echo ""

echo "6. Nginx Worker Processes:"
ps aux | grep "nginx: worker" | head -3
echo ""
```

Save as `/home/ubuntu/Titan/scripts/diagnose-nginx.sh` and run:
```bash
chmod +x /home/ubuntu/Titan/scripts/diagnose-nginx.sh
./scripts/diagnose-nginx.sh
```

---

## 📋 Troubleshooting Checklist

- [ ] X-Titan-Config header appears in local tests
- [ ] X-Titan-Config header appears in external tests
- [ ] HSTS header appears in local tests
- [ ] HSTS header appears in external tests (or enabled in Cloudflare)
- [ ] Security headers appear in local tests
- [ ] Only one server block for zala.ir is enabled
- [ ] No default_server conflicts
- [ ] Nginx error log is clean (except OCSP warning)
- [ ] Symlink is correct: `/etc/nginx/sites-enabled/zala`

---

## 🚀 Next Steps

### If Headers Appear Locally But Not Externally:
→ **Cloudflare is stripping them**
1. Enable HSTS in Cloudflare Dashboard (SSL/TLS → Edge Certificates)
2. Use Cloudflare Transform Rules for other headers
3. Document in PR that edge security is handled by Cloudflare

### If Headers Don't Appear Locally:
→ **Nginx configuration issue**
1. Verify server block is active (X-Titan-Config test)
2. Check for conflicting configurations
3. Review location block hierarchy
4. Test with minimal config

### If X-Titan-Config Doesn't Appear:
→ **Wrong server block is active**
1. Check server_name matches exactly
2. Look for default_server conflicts
3. Verify no other configs are catching requests
4. Check Nginx reload actually happened

---

## 📞 Support Commands

Share these outputs for further assistance:

```bash
# Full diagnostic package
{
    echo "=== NGINX CONFIG ==="
    cat /etc/nginx/sites-available/zala
    echo ""
    echo "=== SITES ENABLED ==="
    ls -la /etc/nginx/sites-enabled/
    echo ""
    echo "=== LOCAL HEADER TEST ==="
    curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir
    echo ""
    echo "=== ERROR LOG ==="
    sudo tail -30 /var/log/nginx/error.log
} > /home/ubuntu/Titan/nginx-diagnostic-report.txt

cat /home/ubuntu/Titan/nginx-diagnostic-report.txt
```

---

## 🔗 Related Files

- **Enhanced Config:** `/home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf`
- **Active Config:** `/etc/nginx/sites-available/zala`
- **Symlink:** `/etc/nginx/sites-enabled/zala`
- **Error Log:** `/var/log/nginx/error.log`
- **Access Log:** `/var/log/nginx/zala-access.log`
- **Fixed Test Script:** `/home/ubuntu/Titan/scripts/test-ssl-acceptance-fixed.sh`

---

**Last Updated:** 2025-10-20  
**Status:** Awaiting diagnostic test results
