# ✅ Phase 4 SSL Full (strict) - Quick Checklist

## قبل از شروع
- [ ] دسترسی SSH + sudo
- [ ] دسترسی Cloudflare Dashboard
- [ ] نصب jq: `sudo apt-get install -y jq`
- [ ] بررسی سلامت سیستم فعلی

## مراحل اجرا

### 1️⃣ Update Code
```bash
cd /opt/titan
git pull origin main
```

### 2️⃣ Run Migration
```bash
export PGPASSWORD='YOUR_PASSWORD'
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -f database/migrations/003_ensure_admin_role.sql
```

### 3️⃣ Generate Cloudflare Certificate
- Dashboard → zala.ir → SSL/TLS → Origin Server → Create Certificate
- Hostnames: zala.ir, *.zala.ir, www.zala.ir
- Key: RSA 2048
- **ذخیره cert و key**

### 4️⃣ Install Certificates
```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/origin-cert.pem  # paste & save
sudo nano /etc/ssl/cloudflare/origin-key.pem   # paste & save
sudo chmod 644 /etc/ssl/cloudflare/origin-cert.pem
sudo chmod 600 /etc/ssl/cloudflare/origin-key.pem
sudo chown root:root /etc/ssl/cloudflare/*
```

### 5️⃣ Update Nginx
```bash
sudo cp /etc/nginx/sites-available/titan \
  /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)
sudo cp /opt/titan/infra/nginx-ssl-strict.conf \
  /etc/nginx/sites-available/titan
sudo nginx -t
sudo systemctl reload nginx
```

### 6️⃣ Test Before Switch
```bash
cd /opt/titan
./scripts/test-ssl-acceptance.sh
```
**همه تست‌ها باید PASS شوند!**

### 7️⃣ Switch Cloudflare
- Dashboard → SSL/TLS → Overview
- Change: Full → **Full (strict)**
- Wait 2 minutes

### 8️⃣ Final Tests
```bash
./scripts/test-ssl-acceptance.sh

# Manual verification
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | grep "Verify return code"
# Expected: Verify return code: 0 (ok)

curl -I https://www.zala.ir | grep -i strict-transport-security
# Expected: max-age=31536000; includeSubDomains; preload

curl -sS https://www.zala.ir/api/health | jq '.data.status'
# Expected: "healthy"
```

## 🎉 موفق!

SSL Full (strict) فعال است!

## 🔙 Rollback (اگر مشکلی پیش آمد)

1. Cloudflare: Full (strict) → Full
2. ```bash
   sudo cp /etc/nginx/sites-available/titan.backup.* /etc/nginx/sites-available/titan
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

**برای جزئیات بیشتر**: `PHASE4_SSL_DEPLOYMENT_GUIDE.md`
