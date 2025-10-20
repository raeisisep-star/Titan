# 🔐 Phase 4 SSL Full (strict) - Operational Deployment Guide

## Overview

This guide enables SSL Full (strict) with Cloudflare Origin Certificate on the production server.

**Estimated Time**: 30-45 minutes  
**Required Access**: SSH to server + Cloudflare Dashboard  
**Risk Level**: Low (with quick rollback)

---

## ✅ Prerequisites

- [ ] SSH access to server (with sudo)
- [ ] Access to Cloudflare Dashboard (domain zala.ir)
- [ ] Access to PostgreSQL database
- [ ] Install jq on server: `sudo apt-get install -y jq`

---

## 📋 Pre-flight Checklist

Run automated pre-deployment check:

```bash
cd /opt/titan
./scripts/pre-ssl-check.sh
```

This will verify:
- Root/sudo access
- Required project files
- Nginx status and configuration
- PM2 and backend status
- Database connectivity
- Required dependencies (jq, openssl, curl)
- Current site status
- Git repository status

**All critical checks must pass before proceeding!**

Manual checks:

```bash
# 1. Verify Nginx is running
sudo systemctl status nginx

# 2. Verify Backend is running
pm2 status

# 3. Verify database is accessible
psql -h localhost -U titan_user -d titan_trading -c "SELECT 1;" 

# 4. Verify project files
ls -la /opt/titan/docs/ops/SSL_SETUP.md
ls -la /opt/titan/scripts/test-ssl-acceptance.sh
ls -la /opt/titan/infra/nginx-ssl-strict.conf

# 5. Test current site
curl -I https://www.zala.ir/api/health
```

---

## 🚀 Deployment Steps

### Step 1: Update Code from GitHub

```bash
# Navigate to project directory
cd /opt/titan

# Stash any local changes
git stash

# Pull latest changes
git checkout main
git pull origin main

# Verify new files
ls -la docs/ops/SSL_SETUP.md
ls -la scripts/test-ssl-acceptance.sh
ls -la infra/nginx-ssl-strict.conf
ls -la database/migrations/003_ensure_admin_role.sql
```

✅ **Expected Result**: All files above should exist

---

### Step 2: Run Database Migration

```bash
cd /opt/titan

# Run migration to ensure admin role
# Note: This migration is idempotent and can be run multiple times

# Replace with your database credentials from .env
export PGPASSWORD='YOUR_DB_PASSWORD'
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -f database/migrations/003_ensure_admin_role.sql

# Verify admin role
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -c "SELECT username, role FROM users WHERE username='admin';"
```

✅ **Expected Result**:
```
 username | role  
----------+-------
 admin    | admin
```

---

### Step 3: Generate Cloudflare Origin Certificate

#### 3.1 Access Cloudflare Dashboard

1. Open: https://dash.cloudflare.com
2. Select domain: `zala.ir`
3. Navigate to: **SSL/TLS** → **Origin Server**
4. Click: **Create Certificate**

#### 3.2 Certificate Configuration

```
Certificate Type: Generate private key and CSR with Cloudflare
Key Type: RSA (2048)
Hostnames:
  - zala.ir
  - *.zala.ir
  - www.zala.ir
Validity: 15 years
```

#### 3.3 Save Certificate and Private Key

⚠️ **CRITICAL**: These files are shown only once!

1. Copy **Origin Certificate** (including BEGIN/END CERTIFICATE)
2. Copy **Private Key** (including BEGIN/END PRIVATE KEY)

---

### Step 4: Install Certificates on Server

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/cloudflare
sudo chmod 755 /etc/ssl/cloudflare

# Install Origin Certificate
sudo nano /etc/ssl/cloudflare/origin-cert.pem
# Paste certificate content
# Save: Ctrl+O, Enter, Ctrl+X

# Set permissions
sudo chmod 644 /etc/ssl/cloudflare/origin-cert.pem
sudo chown root:root /etc/ssl/cloudflare/origin-cert.pem

# Install Private Key
sudo nano /etc/ssl/cloudflare/origin-key.pem
# Paste private key content
# Save: Ctrl+O, Enter, Ctrl+X

# Set strict permissions (very important!)
sudo chmod 600 /etc/ssl/cloudflare/origin-key.pem
sudo chown root:root /etc/ssl/cloudflare/origin-key.pem

# Verify files
ls -la /etc/ssl/cloudflare/
# Should show:
# -rw-r--r-- 1 root root [size] origin-cert.pem
# -rw------- 1 root root [size] origin-key.pem
```

#### 4.1 Test Certificates

```bash
# Test certificate
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -text -noout | head -20

# Test private key
sudo openssl rsa -in /etc/ssl/cloudflare/origin-key.pem -check -noout
# Should show: RSA key ok
```

✅ **Expected Result**: "RSA key ok"

---

### Step 5: Backup and Update Nginx Configuration

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/titan \
  /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)

# Copy new config from template
sudo cp /opt/titan/infra/nginx-ssl-strict.conf \
  /etc/nginx/sites-available/titan

# Edit config if necessary (adjust paths)
sudo nano /etc/nginx/sites-available/titan

# Key points to verify:
# - root path: /opt/titan/public (or /tmp/webapp/Titan/public)
# - backend port: 5000
# - certificate paths: /etc/ssl/cloudflare/...

# Test Nginx config
sudo nginx -t
```

✅ **Expected Result**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### 5.1 Reload Nginx

```bash
# Reload Nginx (zero downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Check logs
sudo tail -30 /var/log/nginx/error.log
```

✅ **Expected Result**: Nginx reloaded successfully without errors

---

### Step 6: Pre-Switch Tests

```bash
cd /opt/titan

# Run automated SSL acceptance tests
chmod +x scripts/test-ssl-acceptance.sh
./scripts/test-ssl-acceptance.sh
```

✅ **Expected Result**: All tests should **PASS**

If any test **FAILS**:

1. Read the test output
2. Debug with manual tests:
   ```bash
   # Manual health test
   curl -sS https://www.zala.ir/api/health | jq '.'
   
   # Manual login test
   curl -sS -X POST https://www.zala.ir/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"admin123"}' | jq '.'
   ```
3. Check logs:
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   pm2 logs titan-backend --lines 50
   ```

---

### Step 7: Switch Cloudflare to Full (strict)

⚠️ **Only proceed if all tests in Step 6 passed!**

#### 7.1 Change SSL Mode

1. Login to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select domain: `zala.ir`
3. Navigate to: **SSL/TLS** → **Overview**
4. **SSL/TLS encryption mode**: Change from **Full** to **Full (strict)**
5. Click: **Confirm**

#### 7.2 Wait for Propagation

```bash
# Wait 1-2 minutes for global propagation
sleep 120
```

---

### Step 8: Final Verification

```bash
cd /opt/titan

# Re-run automated tests
./scripts/test-ssl-acceptance.sh
```

✅ **All tests must PASS**

#### 8.1 Additional Manual Tests

```bash
# 1. Test certificate chain
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | grep "Verify return code"
# Expected: Verify return code: 0 (ok)

# 2. Test HSTS header
curl -I https://www.zala.ir | grep -i strict-transport-security
# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# 3. Test health endpoint
curl -sS https://www.zala.ir/api/health | jq '.data.status'
# Expected: "healthy"

# 4. Test authentication and real data
TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

curl -sS -H "Authorization: Bearer $TOKEN" \
  https://www.zala.ir/api/dashboard/portfolio-real | jq '.meta.source'
# Expected: "real"

# 5. Test HTTP to HTTPS redirect
curl -I http://www.zala.ir
# Expected: HTTP/1.1 301 Moved Permanently + Location: https://www.zala.ir/
```

---

## 🎉 Congratulations! Phase 4 Complete

If all tests passed, your system is now running with SSL Full (strict):

✅ End-to-end encryption  
✅ Certificate validation  
✅ HSTS enabled with preload  
✅ Modern TLS (1.2/1.3 only)  
✅ Security headers active  

---

## 🔙 Rollback Procedure

If any issues occur:

### Step 1: Revert Cloudflare

```
Cloudflare Dashboard → SSL/TLS → Overview
Change: Full (strict) → Full
```

### Step 2: Restore Nginx Config

```bash
# List backups
ls -lt /etc/nginx/sites-available/titan.backup.*

# Restore latest backup
sudo cp /etc/nginx/sites-available/titan.backup.YYYYMMDD_HHMMSS \
  /etc/nginx/sites-available/titan

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### Step 3: Verify Health

```bash
curl -sS https://www.zala.ir/api/health | jq '.'
```

---

## 📊 Post-Deployment Monitoring

### Daily Checks

```bash
# Check certificate expiry
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -noout -dates

# Check SSL Labs Score (weekly)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=www.zala.ir

# Check Nginx logs
sudo tail -100 /var/log/nginx/error.log | grep -i ssl
```

### Alerts

1. Certificate Expiry: Set reminder 6 months before expiration
2. SSL Labs Grade: Should be A or A+
3. HSTS Preload: Consider submitting to HSTS preload list: https://hstspreload.org/

---

## 🆘 Troubleshooting

### Issue: "502 Bad Gateway" after changes

```bash
# Check backend
pm2 status
pm2 logs titan-backend --lines 50

# Restart backend
pm2 restart titan-backend

# Test backend directly
curl http://localhost:5000/api/health
```

### Issue: "Verify return code: 21"

```bash
# This is normal before switching to Full (strict)
# After switch, should be 0
```

### Issue: HSTS header not appearing

```bash
# Check Nginx config
sudo nginx -t

# Check add_header in config
sudo grep -n "Strict-Transport-Security" /etc/nginx/sites-available/titan

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📝 Security Notes

⚠️ **NEVER commit to Git**:
- `/etc/ssl/cloudflare/origin-cert.pem`
- `/etc/ssl/cloudflare/origin-key.pem`
- Any files containing private keys

✅ **Best Practices**:
- Private key with permission 600 only
- Certificate with permission 644
- Both files owned by root:root
- Encrypted backups in secure vault

---

## 📚 Additional Documentation

- **Quick Reference**: `PHASE4_QUICK_CHECKLIST.md`
- **Detailed Setup**: `docs/ops/SSL_SETUP.md`
- **Pre-deployment Check**: Run `./scripts/pre-ssl-check.sh`
- **Acceptance Tests**: Run `./scripts/test-ssl-acceptance.sh`

---

## 📞 Support

If you need help:

1. Save output of `./scripts/test-ssl-acceptance.sh`
2. Check Nginx logs: `sudo tail -100 /var/log/nginx/error.log`
3. Check Backend logs: `pm2 logs titan-backend --lines 100`
4. Screenshot Cloudflare SSL settings

---

**Version**: 1.0  
**Date**: 2025-10-20  
**Maintained By**: DevOps Team

🔐 **SSL Full (strict) - End-to-End Encryption Activated** 🔐
