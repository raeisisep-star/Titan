# TITAN Trading System - SSL Full (strict) Setup Guide

## 🔐 Overview

This guide covers the setup of Cloudflare Origin Certificate with Nginx for SSL Full (strict) mode on zala.ir.

**Security Level**: Full (strict) - End-to-end encryption with validated origin certificate

---

## 📋 Prerequisites

- Root/sudo access to the server
- Cloudflare account with zala.ir domain
- Nginx installed and running
- Current SSL mode: Full (flexible)

---

## 🎯 Objectives

1. ✅ Install Cloudflare Origin Certificate
2. ✅ Configure Nginx with TLS 1.2/1.3
3. ✅ Enable HSTS with preload
4. ✅ Enable OCSP Stapling
5. ✅ Switch Cloudflare to Full (strict)
6. ✅ Validate SSL chain and security headers

---

## 📜 Step 1: Generate Cloudflare Origin Certificate

### 1.1 Access Cloudflare Dashboard

1. Login to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select domain: `zala.ir`
3. Navigate to: **SSL/TLS** → **Origin Server**
4. Click: **Create Certificate**

### 1.2 Certificate Configuration

```
Certificate Type: Generate private key and CSR with Cloudflare
Key Type: RSA (2048 or 4096 - both acceptable)
Hostnames: 
  - zala.ir
  - *.zala.ir
  - www.zala.ir
Validity: 15 years (maximum)
```

### 1.3 Save Certificate Files

**⚠️ CRITICAL**: Save both files securely. They will only be shown once!

- **Origin Certificate**: Copy to clipboard
- **Private Key**: Copy to clipboard

---

## 🔧 Step 2: Install Certificates on Server

### 2.1 Create SSL Directory

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo chmod 755 /etc/ssl/cloudflare
```

### 2.2 Install Origin Certificate

```bash
sudo nano /etc/ssl/cloudflare/origin-cert.pem
# Paste the Origin Certificate (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)
# Save and exit (Ctrl+O, Enter, Ctrl+X)

# Set secure permissions
sudo chmod 644 /etc/ssl/cloudflare/origin-cert.pem
sudo chown root:root /etc/ssl/cloudflare/origin-cert.pem
```

### 2.3 Install Private Key

```bash
sudo nano /etc/ssl/cloudflare/origin-key.pem
# Paste the Private Key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
# Save and exit

# Set STRICT permissions (private key must be protected)
sudo chmod 600 /etc/ssl/cloudflare/origin-key.pem
sudo chown root:root /etc/ssl/cloudflare/origin-key.pem
```

### 2.4 Verify Files

```bash
# Check files exist with correct permissions
ls -la /etc/ssl/cloudflare/
# Expected output:
# -rw-r--r-- 1 root root [size] [date] origin-cert.pem
# -rw------- 1 root root [size] [date] origin-key.pem

# Verify certificate content (should show certificate details)
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -text -noout | head -20

# Verify private key (should show RSA PRIVATE KEY)
sudo openssl rsa -in /etc/ssl/cloudflare/origin-key.pem -check -noout
# Expected: RSA key ok
```

---

## ⚙️ Step 3: Configure Nginx

### 3.1 Backup Current Configuration

```bash
sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)
```

### 3.2 Update Nginx Configuration

Create/update `/etc/nginx/sites-available/titan`:

```nginx
# =============================================================================
# TITAN Trading System - Nginx Configuration with SSL Full (strict)
# =============================================================================

# HTTP to HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name zala.ir www.zala.ir;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zala.ir www.zala.ir;

    # Root directory for static files
    root /tmp/webapp/Titan/public;
    index index.html;

    # =============================================================================
    # SSL Configuration (Cloudflare Origin Certificate)
    # =============================================================================
    
    ssl_certificate     /etc/ssl/cloudflare/origin-cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # SSL session settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 1.0.0.1 valid=300s;
    resolver_timeout 5s;

    # =============================================================================
    # Security Headers
    # =============================================================================
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Additional security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # =============================================================================
    # API Proxy (Backend)
    # =============================================================================
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # =============================================================================
    # Static Files
    # =============================================================================
    
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # =============================================================================
    # Error Pages
    # =============================================================================
    
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### 3.3 Test Configuration

```bash
# Test Nginx configuration syntax
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3.4 Reload Nginx

```bash
# Reload Nginx (graceful reload - no downtime)
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# Check for errors
sudo tail -50 /var/log/nginx/error.log
```

---

## ✅ Step 4: Validate SSL Configuration

### 4.1 Test SSL Chain (Before switching to Full strict)

```bash
# Test SSL certificate chain
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | tail -n 5

# Look for:
# Verify return code: 0 (ok)
# Or check last line shows certificate verification status
```

### 4.2 Test HSTS Header

```bash
# Check HSTS header
curl -I https://www.zala.ir | grep -i strict-transport-security

# Expected:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 4.3 Test Application Health

```bash
# Health check
curl -sS https://www.zala.ir/api/health | jq '.'

# Expected: {"success": true, "data": {"status": "healthy", ...}}

# Test authenticated endpoint
TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

curl -sS -H "Authorization: Bearer $TOKEN" \
  https://www.zala.ir/api/dashboard/portfolio-real | jq '.meta.source'

# Expected: "real"
```

### 4.4 Test HTTP to HTTPS Redirect

```bash
# Test redirect
curl -I http://www.zala.ir

# Expected:
# HTTP/1.1 301 Moved Permanently
# Location: https://www.zala.ir/
```

---

## 🔄 Step 5: Switch Cloudflare to Full (strict)

### ⚠️ Only proceed if all validations in Step 4 pass!

### 5.1 Access Cloudflare Dashboard

1. Login to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select domain: `zala.ir`
3. Navigate to: **SSL/TLS** → **Overview**

### 5.2 Change SSL Mode

1. Find: **SSL/TLS encryption mode**
2. Current mode: **Full**
3. Change to: **Full (strict)**
4. Click: **Confirm**

### 5.3 Wait for Propagation

Wait 1-2 minutes for Cloudflare to propagate the change globally.

### 5.4 Verify Full (strict) Mode

```bash
# Test SSL chain validation
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | grep "Verify return code"

# Expected:
# Verify return code: 0 (ok)

# If you see any other code, ROLLBACK immediately!
```

### 5.5 Final Application Test

```bash
# Run all acceptance tests
./scripts/test-ssl-acceptance.sh

# Or manually:
curl -sS https://www.zala.ir/api/health | jq '.data.status'
# Expected: "healthy"

TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

curl -sS -H "Authorization: Bearer $TOKEN" \
  https://www.zala.ir/api/dashboard/portfolio-real | jq '.meta.source'
# Expected: "real"
```

---

## 🔙 Rollback Procedure

### If Issues Occur After Switching to Full (strict):

### Immediate Rollback Steps:

1. **Revert Cloudflare SSL Mode**:
   - Go to Cloudflare Dashboard → SSL/TLS → Overview
   - Change from **Full (strict)** back to **Full**
   - Wait 1 minute for propagation

2. **Verify Application**:
   ```bash
   curl -sS https://www.zala.ir/api/health | jq '.data.status'
   # Should return "healthy"
   ```

3. **If Nginx Issues**:
   ```bash
   # Restore backup configuration
   sudo cp /etc/nginx/sites-available/titan.backup.[timestamp] /etc/nginx/sites-available/titan
   
   # Test and reload
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **Test Health**:
   ```bash
   # Repeat acceptance tests
   curl -sS https://www.zala.ir/api/health | jq '.'
   ```

---

## 📊 Monitoring & Maintenance

### SSL Certificate Expiry

Cloudflare Origin Certificates are valid for 15 years. Set a reminder to renew before expiration:

```bash
# Check certificate expiry
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -noout -dates

# Shows:
# notBefore=...
# notAfter=...
```

### Regular Security Checks

```bash
# Test SSL configuration monthly
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | grep "Verify return code"

# Check SSL Labs (quarterly)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=www.zala.ir
```

### Log Monitoring

```bash
# Monitor Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🔒 Security Best Practices

1. **Private Key Protection**:
   - NEVER commit private keys to git
   - Keep permissions at 600 (root only)
   - Store backups in encrypted vault

2. **Certificate Rotation**:
   - Rotate certificates every 1-2 years (even if valid for 15)
   - Document rotation procedure
   - Test in staging first

3. **Monitoring**:
   - Set up certificate expiry alerts
   - Monitor SSL/TLS errors in logs
   - Regular SSL Labs scans

4. **Access Control**:
   - Limit sudo access to SSL directory
   - Audit access logs
   - Use SSH keys instead of passwords

---

## 📝 Troubleshooting

### Issue: "Verify return code: 21 (unable to verify the first certificate)"

**Cause**: Cloudflare Origin Certificate not trusted by OpenSSL (expected with Full mode)

**Solution**: Switch to Full (strict) mode - this validates the origin certificate through Cloudflare's CA

### Issue: "SSL handshake failed"

**Causes**:
1. Certificate/key mismatch
2. Wrong file permissions
3. Nginx not reloaded

**Solutions**:
```bash
# Verify certificate matches key
sudo openssl x509 -noout -modulus -in /etc/ssl/cloudflare/origin-cert.pem | openssl md5
sudo openssl rsa -noout -modulus -in /etc/ssl/cloudflare/origin-key.pem | openssl md5
# Both MD5 hashes should match

# Check permissions
ls -la /etc/ssl/cloudflare/

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Issue: "502 Bad Gateway" after SSL changes

**Cause**: Backend not accessible

**Solutions**:
```bash
# Check backend is running
pm2 status

# Check backend logs
pm2 logs titan-backend --lines 50

# Test backend directly
curl http://localhost:5000/api/health

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log
```

---

## 📚 References

- [Cloudflare Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Testing](https://www.ssllabs.com/ssltest/)

---

## ✅ Checklist

Before deploying to production:

- [ ] Cloudflare Origin Certificate generated
- [ ] Certificates installed on server with correct permissions
- [ ] Nginx configuration updated and tested
- [ ] SSL chain validated (Verify return code: 0)
- [ ] HSTS header present
- [ ] HTTP to HTTPS redirect working
- [ ] Application health check passes
- [ ] Authentication works over HTTPS
- [ ] Cloudflare switched to Full (strict)
- [ ] Final acceptance tests pass
- [ ] Rollback procedure documented and tested
- [ ] Team notified of changes

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-20  
**Maintained By**: DevOps Team
