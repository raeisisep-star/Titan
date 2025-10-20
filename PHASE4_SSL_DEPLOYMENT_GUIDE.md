# 🔐 راهنمای اجرایی Phase 4: SSL Full (strict) - نسخه فارسی

## تصویر کلی

این راهنما برای فعال‌سازی SSL Full (strict) با Cloudflare Origin Certificate روی سرور production است.

**زمان تقریبی**: 30-45 دقیقه  
**دسترسی مورد نیاز**: SSH به سرور + دسترسی Cloudflare Dashboard  
**ریسک**: پایین (با rollback سریع)

---

## ✅ پیش‌نیازها

- [ ] دسترسی SSH به سرور (با sudo)
- [ ] دسترسی به Cloudflare Dashboard (دامنه zala.ir)
- [ ] دسترسی به دیتابیس PostgreSQL
- [ ] نصب jq روی سرور: `sudo apt-get install -y jq`

---

## 📋 چک‌لیست قبل از شروع

```bash
# 1. بررسی Nginx در حال اجرا است
sudo systemctl status nginx

# 2. بررسی Backend در حال اجرا است
pm2 status

# 3. بررسی دیتابیس در دسترس است
psql -h localhost -U titan_user -d titan_trading -c "SELECT 1;" 

# 4. بررسی فایل‌های پروژه در مسیر صحیح
ls -la /opt/titan/docs/ops/SSL_SETUP.md
ls -la /opt/titan/scripts/test-ssl-acceptance.sh
ls -la /opt/titan/infra/nginx-ssl-strict.conf

# 5. تست سایت فعلی
curl -I https://www.zala.ir/api/health
```

---

## 🚀 مراحل اجرا (Step by Step)

### مرحله 1: به‌روزرسانی کد از GitHub

```bash
# رفتن به دایرکتوری پروژه
cd /opt/titan

# ذخیره تغییرات احتمالی
git stash

# Pull آخرین تغییرات
git checkout main
git pull origin main

# بررسی فایل‌های جدید
ls -la docs/ops/SSL_SETUP.md
ls -la scripts/test-ssl-acceptance.sh
ls -la infra/nginx-ssl-strict.conf
ls -la database/migrations/003_ensure_admin_role.sql
```

✅ **نتیجه مورد انتظار**: فایل‌های بالا باید وجود داشته باشند

---

### مرحله 2: اجرای Migration دیتابیس

```bash
cd /opt/titan

# اجرای migration برای اطمینان از نقش admin
# توجه: این migration idempotent است و می‌تواند چند بار اجرا شود

# مقادیر را از .env خود جایگزین کنید:
export PGPASSWORD='YOUR_DB_PASSWORD'
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -f database/migrations/003_ensure_admin_role.sql

# بررسی نقش admin
psql -h localhost -p 5433 -U titan_user -d titan_trading \
  -c "SELECT username, role FROM users WHERE username='admin';"
```

✅ **نتیجه مورد انتظار**:
```
 username | role  
----------+-------
 admin    | admin
```

---

### مرحله 3: صدور Cloudflare Origin Certificate

#### 3.1 ورود به Cloudflare Dashboard

1. باز کنید: https://dash.cloudflare.com
2. انتخاب دامنه: `zala.ir`
3. رفتن به: **SSL/TLS** → **Origin Server**
4. کلیک: **Create Certificate**

#### 3.2 تنظیمات Certificate

```
Certificate Type: Generate private key and CSR with Cloudflare
Key Type: RSA (2048)
Hostnames:
  - zala.ir
  - *.zala.ir
  - www.zala.ir
Validity: 15 years
```

#### 3.3 ذخیره Certificate و Private Key

⚠️ **مهم**: این فایل‌ها فقط یک بار نمایش داده می‌شوند!

1. **Origin Certificate** را کپی کنید (شامل BEGIN/END CERTIFICATE)
2. **Private Key** را کپی کنید (شامل BEGIN/END PRIVATE KEY)

---

### مرحله 4: نصب Certificate روی سرور

```bash
# ایجاد دایرکتوری SSL
sudo mkdir -p /etc/ssl/cloudflare
sudo chmod 755 /etc/ssl/cloudflare

# نصب Origin Certificate
sudo nano /etc/ssl/cloudflare/origin-cert.pem
# محتویات گواهی را Paste کنید
# ذخیره: Ctrl+O, Enter, Ctrl+X

# تنظیم permissions
sudo chmod 644 /etc/ssl/cloudflare/origin-cert.pem
sudo chown root:root /etc/ssl/cloudflare/origin-cert.pem

# نصب Private Key
sudo nano /etc/ssl/cloudflare/origin-key.pem
# محتویات private key را Paste کنید
# ذخیره: Ctrl+O, Enter, Ctrl+X

# تنظیم permissions (خیلی مهم!)
sudo chmod 600 /etc/ssl/cloudflare/origin-key.pem
sudo chown root:root /etc/ssl/cloudflare/origin-key.pem

# بررسی فایل‌ها
ls -la /etc/ssl/cloudflare/
# باید ببینید:
# -rw-r--r-- 1 root root [size] origin-cert.pem
# -rw------- 1 root root [size] origin-key.pem
```

#### 4.1 تست Certificate

```bash
# تست certificate
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -text -noout | head -20

# تست private key
sudo openssl rsa -in /etc/ssl/cloudflare/origin-key.pem -check -noout
# باید ببینید: RSA key ok
```

✅ **نتیجه مورد انتظار**: "RSA key ok"

---

### مرحله 5: بکاپ و به‌روزرسانی Nginx

```bash
# بکاپ از کانفیگ فعلی
sudo cp /etc/nginx/sites-available/titan \
  /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)

# کپی کانفیگ جدید از template
sudo cp /opt/titan/infra/nginx-ssl-strict.conf \
  /etc/nginx/sites-available/titan

# ویرایش کانفیگ (در صورت نیاز به تغییر مسیرها)
sudo nano /etc/nginx/sites-available/titan

# نکات کلیدی برای بررسی:
# - مسیر root: /opt/titan/public (یا /tmp/webapp/Titan/public)
# - پورت backend: 5000
# - مسیرهای certificate: /etc/ssl/cloudflare/...

# تست کانفیگ Nginx
sudo nginx -t
```

✅ **نتیجه مورد انتظار**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### 5.1 Reload Nginx

```bash
# Reload Nginx (بدون downtime)
sudo systemctl reload nginx

# بررسی status
sudo systemctl status nginx

# بررسی لاگ‌ها
sudo tail -30 /var/log/nginx/error.log
```

✅ **نتیجه مورد انتظار**: Nginx reload شده بدون خطا

---

### مرحله 6: تست‌های پیش از سوییچ به Full (strict)

```bash
cd /opt/titan

# اجرای تست‌های خودکار
chmod +x scripts/test-ssl-acceptance.sh
./scripts/test-ssl-acceptance.sh
```

✅ **نتیجه مورد انتظار**: همه تست‌ها باید **PASS** شوند

اگر تستی **FAIL** شد:

1. خروجی تست را بخوانید
2. با دستور زیر مشکل را بررسی کنید:
   ```bash
   # تست دستی health
   curl -sS https://www.zala.ir/api/health | jq '.'
   
   # تست دستی login
   curl -sS -X POST https://www.zala.ir/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"admin123"}' | jq '.'
   ```
3. لاگ‌های Nginx و Backend را بررسی کنید:
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   pm2 logs titan-backend --lines 50
   ```

---

### مرحله 7: سوییچ Cloudflare به Full (strict)

⚠️ **فقط اگر همه تست‌ها در مرحله 6 پاس شدند، ادامه دهید!**

#### 7.1 تغییر SSL Mode

1. ورود به Cloudflare Dashboard: https://dash.cloudflare.com
2. انتخاب دامنه: `zala.ir`
3. رفتن به: **SSL/TLS** → **Overview**
4. **SSL/TLS encryption mode**: تغییر از **Full** به **Full (strict)**
5. کلیک: **Confirm**

#### 7.2 انتظار برای Propagation

```bash
# صبر کنید 1-2 دقیقه
sleep 120
```

---

### مرحله 8: تست‌های نهایی

```bash
cd /opt/titan

# اجرای مجدد تست‌های خودکار
./scripts/test-ssl-acceptance.sh
```

✅ **همه تست‌ها باید PASS شوند**

#### 8.1 تست‌های دستی اضافی

```bash
# 1. تست زنجیره گواهی
openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null 2>&1 | grep "Verify return code"
# باید ببینید: Verify return code: 0 (ok)

# 2. تست HSTS header
curl -I https://www.zala.ir | grep -i strict-transport-security
# باید ببینید: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# 3. تست health
curl -sS https://www.zala.ir/api/health | jq '.data.status'
# باید ببینید: "healthy"

# 4. تست authentication و real data
TOKEN=$(curl -sS -X POST https://www.zala.ir/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

curl -sS -H "Authorization: Bearer $TOKEN" \
  https://www.zala.ir/api/dashboard/portfolio-real | jq '.meta.source'
# باید ببینید: "real"

# 5. تست HTTP to HTTPS redirect
curl -I http://www.zala.ir
# باید ببینید: HTTP/1.1 301 Moved Permanently + Location: https://www.zala.ir/
```

---

## 🎉 تبریک! Phase 4 تکمیل شد

اگر همه تست‌ها پاس شدند، سیستم شما حالا با SSL Full (strict) در حال اجرا است:

✅ End-to-end encryption  
✅ Certificate validation  
✅ HSTS enabled with preload  
✅ Modern TLS (1.2/1.3 only)  
✅ Security headers active  

---

## 🔙 رول‌بک (در صورت مشکل)

اگر هر مشکلی پیش آمد:

### گام 1: Revert Cloudflare

```
Cloudflare Dashboard → SSL/TLS → Overview
Change: Full (strict) → Full
```

### گام 2: Restore Nginx Config

```bash
# لیست بکاپ‌ها
ls -lt /etc/nginx/sites-available/titan.backup.*

# Restore آخرین بکاپ
sudo cp /etc/nginx/sites-available/titan.backup.YYYYMMDD_HHMMSS \
  /etc/nginx/sites-available/titan

# تست و reload
sudo nginx -t && sudo systemctl reload nginx
```

### گام 3: بررسی Health

```bash
curl -sS https://www.zala.ir/api/health | jq '.'
```

---

## 📊 مانیتورینگ پس از Deployment

### چک‌های روزانه

```bash
# چک certificate expiry
sudo openssl x509 -in /etc/ssl/cloudflare/origin-cert.pem -noout -dates

# چک SSL Labs Score (هفتگی)
# بازدید: https://www.ssllabs.com/ssltest/analyze.html?d=www.zala.ir

# چک لاگ‌های Nginx
sudo tail -100 /var/log/nginx/error.log | grep -i ssl
```

### هشدارها

1. Certificate Expiry: تنظیم یادآوری 6 ماه قبل از انقضا (حتی اگر 15 ساله است)
2. SSL Labs Grade: باید A یا A+ باشد
3. HSTS Preload: می‌توانید دامنه را به لیست HSTS Preload اضافه کنید: https://hstspreload.org/

---

## 🆘 Troubleshooting

### مشکل: "502 Bad Gateway" پس از تغییرات

```bash
# چک backend
pm2 status
pm2 logs titan-backend --lines 50

# رستارت backend
pm2 restart titan-backend

# تست مستقیم backend
curl http://localhost:5000/api/health
```

### مشکل: "Verify return code: 21"

```bash
# این طبیعی است قبل از سوییچ به Full (strict)
# بعد از سوییچ، باید 0 شود
```

### مشکل: HSTS header ظاهر نمی‌شود

```bash
# بررسی کانفیگ Nginx
sudo nginx -t

# چک add_header در کانفیگ
sudo grep -n "Strict-Transport-Security" /etc/nginx/sites-available/titan

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📝 یادداشت‌های امنیتی

⚠️ **هرگز این موارد را commit نکنید به Git**:
- `/etc/ssl/cloudflare/origin-cert.pem`
- `/etc/ssl/cloudflare/origin-key.pem`
- هر فایل حاوی private key

✅ **بهترین روش‌ها**:
- Private key فقط با permission 600
- Certificate فقط با permission 644
- هر دو فایل با owner root:root
- بکاپ encrypted در vault امن

---

## 📞 پشتیبانی

اگر به کمک نیاز دارید:

1. خروجی `./scripts/test-ssl-acceptance.sh` را ذخیره کنید
2. لاگ‌های Nginx را بررسی کنید: `sudo tail -100 /var/log/nginx/error.log`
3. لاگ‌های Backend را بررسی کنید: `pm2 logs titan-backend --lines 100`
4. اسکرین‌شات Cloudflare SSL settings را بگیرید

---

**نسخه**: 1.0  
**تاریخ**: 2025-10-20  
**نگهداری**: DevOps Team

🔐 **SSL Full (strict) - End-to-End Encryption Activated** 🔐
