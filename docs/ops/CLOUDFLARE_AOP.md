# Task-4: Cloudflare Authenticated Origin Pulls (AOP) - Preparation

## Overview
Cloudflare Authenticated Origin Pulls (AOP) ensures that ONLY Cloudflare can connect to your origin server by requiring client certificate verification.

## Status: PREPARED (Not Active)
⚠️ **Configuration is ready but DISABLED** - Awaiting approval for activation

## Components

### 1. Cloudflare Origin CA Certificate
**Location**: `/etc/ssl/cloudflare/origin_ca_rsa_root.pem`
**Purpose**: Validates that incoming connections are from Cloudflare
**Permissions**: `644 root:root`

```bash
ls -l /etc/ssl/cloudflare/origin_ca_rsa_root.pem
# -rw-r--r-- 1 root root 1.5K Oct 22 16:58
```

### 2. Existing Origin Certificates
**Server Certificate**: `/etc/ssl/cloudflare/zala.ir.origin.fullchain.crt`
**Private Key**: `/etc/ssl/cloudflare/zala.ir.origin.key` (600 root:root)

Already in use for SSL/TLS termination.

### 3. Nginx Configuration (PREPARED - COMMENTED OUT)

**File**: `/etc/nginx/sites-available/zala`

**Lines to ADD** (currently commented for safety):
```nginx
# Cloudflare Authenticated Origin Pulls (AOP)
# ACTIVATION: Remove comments below when ready to switch

# ssl_client_certificate /etc/ssl/cloudflare/origin_ca_rsa_root.pem;
# ssl_verify_client on;  # Require valid CF client certificate
```

**Location**: Inside `server { ... listen 443 ssl; ... }` block, after ssl_certificate directives.

## Activation Plan

### Prerequisites
✅ Cloudflare Origin CA certificate present
✅ Nginx configuration prepared
✅ Rollback plan documented
⏳ Cloudflare dashboard: AOP enabled for zala.ir domain

### Activation Steps (Low-Risk Window Required)

1. **Enable in Cloudflare Dashboard**:
   - Go to SSL/TLS → Origin Server
   - Enable "Authenticated Origin Pulls"
   - Wait 30 seconds for propagation

2. **Activate Nginx Config**:
   ```bash
   # Uncomment the two lines in /etc/nginx/sites-available/zala
   sudo sed -i 's/^# ssl_client_certificate/ssl_client_certificate/' /etc/nginx/sites-available/zala
   sudo sed -i 's/^# ssl_verify_client on/ssl_verify_client on/' /etc/nginx/sites-available/zala
   
   # Test and reload
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Verify**:
   ```bash
   # Should work (through Cloudflare)
   curl -I https://www.zala.ir
   
   # Should FAIL (direct to origin without CF cert)
   curl -I https://ORIGIN_IP --resolve www.zala.ir:443:ORIGIN_IP
   # Expected: SSL handshake failure or 400 Bad Request
   ```

4. **Monitor**:
   ```bash
   # Watch nginx error log for SSL issues
   sudo tail -f /var/log/nginx/zala-error.log
   ```

### Rollback (One-Line)
```bash
sudo sed -i 's/^ssl_client_certificate/# ssl_client_certificate/' /etc/nginx/sites-available/zala && sudo sed -i 's/^ssl_verify_client on/# ssl_verify_client on/' /etc/nginx/sites-available/zala && sudo nginx -t && sudo systemctl reload nginx
```

## Benefits

1. **Origin Protection**: Direct IP access blocked
2. **DDoS Mitigation**: All traffic MUST go through Cloudflare
3. **Certificate Pinning**: Only Cloudflare's client cert accepted
4. **Zero Trust**: Even with origin IP exposed, connection refused

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Misconfiguration locks out all traffic | Test in low-traffic window, rollback ready |
| Cloudflare outage = site down | Accept trade-off (Cloudflare has 99.99% uptime) |
| Certificate rotation | Cloudflare manages CA cert, auto-renewed |

## Testing Before Activation

**Current State** (AOP disabled):
```bash
# Direct origin access works (should be blocked after AOP)
curl -k -I https://SERVER_IP
# Returns: 200 OK (currently allowed)
```

**After AOP Activation** (expected):
```bash
# Direct origin access blocked
curl -k -I https://SERVER_IP
# Returns: SSL handshake failure or 400 (✅ blocked)

# Cloudflare proxy works
curl -I https://www.zala.ir
# Returns: 200 OK (✅ allowed through CF)
```

## Evidence Pack

### 1. Certificates Present
```bash
sudo ls -lh /etc/ssl/cloudflare/
# origin_ca_rsa_root.pem ✅
# zala.ir.origin.fullchain.crt ✅
# zala.ir.origin.key ✅ (600 permissions)
```

### 2. Nginx Config Ready
```bash
sudo grep -n "ssl_client_certificate" /etc/nginx/sites-available/zala
# (commented lines present and ready)
```

### 3. Current Nginx Test Passes
```bash
sudo nginx -t
# nginx: configuration file test is successful ✅
```

## Definition of Done ✅

- [x] Cloudflare Origin CA certificate verified at `/etc/ssl/cloudflare/origin_ca_rsa_root.pem`
- [x] Nginx config prepared with commented AOP directives
- [x] Activation plan documented (step-by-step)
- [x] Rollback command tested and verified
- [x] Switch plan includes low-risk window requirement
- [x] Benefits and risks documented
- [ ] **NOT ACTIVATED** - Awaiting user approval

## Approval Required

**To activate AOP, user must**:
1. Confirm low-traffic maintenance window
2. Enable AOP in Cloudflare dashboard
3. Grant approval to uncomment nginx directives
4. Monitor first 5 minutes after activation

---
**Date**: 2025-10-25  
**Status**: ✅ Prepared (Not Active)  
**Branch**: task/cf-auth-origin-pulls  
**Risk Level**: Medium (reversible, test in low-traffic window)
