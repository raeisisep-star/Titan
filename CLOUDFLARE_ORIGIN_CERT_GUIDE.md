# 🔐 راهنمای نصب Cloudflare Origin Certificate

**هدف:** نصب گواهی معتبر Cloudflare برای فعال‌سازی Full (strict) mode

---

## 📋 مراحل اجرایی

### مرحله 1: دریافت Certificate از Cloudflare Dashboard

**شما باید این کار را انجام دهید (من دسترسی به Dashboard ندارم)**

1. **ورود به Cloudflare:**
   - برو به: https://dash.cloudflare.com
   - انتخاب domain: **zala.ir**

2. **ساخت Origin Certificate:**
   - بخش: **SSL/TLS** → **Origin Server**
   - کلیک: **"Create Certificate"**

3. **تنظیمات Certificate:**
   ```
   Private key type: RSA (2048)
   
   Hostnames:
   - zala.ir
   - *.zala.ir
   
   Certificate Validity: 15 years (توصیه می‌شود)
   ```

4. **دانلود:**
   - یک صفحه باز می‌شه با دو بخش:
     - **Origin Certificate** (بخش بالا)
     - **Private Key** (بخش پایین)
   - هر دو رو کپی کن (از `-----BEGIN...` تا `-----END...`)

---

### مرحله 2: نصب Certificate در سرور

**دو روش وجود داره:**

#### روش A: استفاده از اسکریپت آماده (توصیه می‌شود) ⭐

```bash
cd /home/ubuntu/Titan
sudo ./install-cloudflare-origin-cert.sh
```

**این اسکریپت:**
1. می‌پرسه Origin Certificate رو paste کنی
2. می‌پرسه Private Key رو paste کنی
3. فایل‌ها رو در `/etc/ssl/cloudflare/` ذخیره می‌کنه
4. Origin CA root رو دانلود می‌کنه
5. Full chain certificate می‌سازه
6. Permission ها رو درست تنظیم می‌کنه
7. Certificate رو verify می‌کنه

**چطور استفاده کنیم:**
```bash
# اجرای اسکریپت
sudo ./install-cloudflare-origin-cert.sh

# وقتی خواست، Origin Certificate رو paste کن
# (از Cloudflare Dashboard بخش "Origin Certificate")
# بعد Ctrl+D بزن

# وقتی خواست، Private Key رو paste کن  
# (از Cloudflare Dashboard بخش "Private Key")
# بعد Ctrl+D بزن

# بقیه کارها خودکار انجام می‌شه!
```

#### روش B: دستی (اگر اسکریپت کار نکرد)

```bash
# 1. ساخت فایل certificate
sudo nano /etc/ssl/cloudflare/zala.ir.origin.crt
# محتوای Origin Certificate رو paste کن
# Ctrl+X, Y, Enter برای ذخیره

# 2. ساخت فایل private key
sudo nano /etc/ssl/cloudflare/zala.ir.origin.key
# محتوای Private Key رو paste کن
# Ctrl+X, Y, Enter برای ذخیره

# 3. دانلود Origin CA root
sudo curl -sS https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem \
  -o /etc/ssl/cloudflare/origin_ca_rsa_root.pem

# 4. ساخت full chain
sudo bash -c 'cat /etc/ssl/cloudflare/zala.ir.origin.crt /etc/ssl/cloudflare/origin_ca_rsa_root.pem > /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt'

# 5. تنظیم permissions
sudo chmod 600 /etc/ssl/cloudflare/zala.ir.origin.key
sudo chmod 644 /etc/ssl/cloudflare/zala.ir.origin.crt
sudo chmod 644 /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt
sudo chmod 644 /etc/ssl/cloudflare/origin_ca_rsa_root.pem
sudo chown root:root /etc/ssl/cloudflare/zala.ir.origin.*
sudo chown root:root /etc/ssl/cloudflare/origin_ca_rsa_root.pem

# 6. Verify
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -issuer
# باید نشون بده: issuer=...CloudFlare...
```

---

### مرحله 3: آپدیت Nginx Configuration

بعد از نصب certificate، من می‌تونم Nginx رو آپدیت کنم. **به من بگید وقتی certificate نصب شد.**

---

## ⏸️ منتظر اقدام شما

**فعلاً من منتظرم تا شما:**

1. ✅ Certificate رو از Cloudflare Dashboard دریافت کنید
2. ✅ اسکریپت `install-cloudflare-origin-cert.sh` رو اجرا کنید
3. ✅ به من بگید که نصب تموم شد

**بعد از اینکه به من گفتید، من:**

1. ✅ Nginx config رو آپدیت می‌کنم (استفاده از certificate جدید)
2. ✅ OCSP stapling رو فعال می‌کنم
3. ✅ تست می‌کنم که origin درست کار می‌کنه
4. ✅ به شما می‌گم که Cloudflare رو Full (strict) کنید
5. ✅ تست نهایی می‌کنم
6. ✅ PR رو push می‌کنم

---

## 📝 دستورات سریع

```bash
# اجرای اسکریپت نصب
cd /home/ubuntu/Titan
sudo ./install-cloudflare-origin-cert.sh

# بعد از نصب، verify کن
ls -lh /etc/ssl/cloudflare/
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -issuer -subject -dates
```

---

## 🔍 چیزهایی که باید چک کنید

بعد از نصب certificate:

```bash
# 1. فایل‌ها وجود دارن؟
ls -lh /etc/ssl/cloudflare/
# باید این فایل‌ها رو ببینید:
# - zala.ir.origin.crt
# - zala.ir.origin.key
# - zala.ir.origin.fullchain.crt
# - origin_ca_rsa_root.pem

# 2. Issuer درسته؟
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -issuer
# باید شامل "CloudFlare" باشه

# 3. Subject درسته؟
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -subject
# باید شامل "zala.ir" یا "*.zala.ir" باشه

# 4. تاریخ انقضا
openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -dates
# باید یک تاریخ خیلی دور (15 سال) باشه
```

---

## ❓ سوالات متداول

**Q: آیا certificate قدیمی رو باید حذف کنم؟**
A: نه، Nginx به صورت خودکار certificate جدید رو استفاده می‌کنه. certificate قدیمی backup می‌مونه.

**Q: آیا باید Nginx رو restart کنم؟**
A: نه، `reload` کافیه. من این کار رو انجام میدم.

**Q: اگر اشتباهی certificate رو paste کردم چی؟**
A: اسکریپت رو دوباره اجرا کن. فایل‌های قدیمی overwrite می‌شن.

**Q: چرا باید full chain استفاده کنیم؟**
A: برای OCSP stapling و validation بهتر. با full chain، Nginx می‌تونه certificate chain کامل رو به client ارسال کنه.

---

## 🎯 بعد از نصب

وقتی به من گفتید که certificate نصب شد، من این کارها رو انجام میدم:

1. ✅ آپدیت `/home/ubuntu/Titan/infra/nginx-ssl-strict.conf`
2. ✅ آپدیت `/etc/nginx/sites-available/zala`
3. ✅ فعال‌سازی OCSP stapling (چون حالا certificate معتبره)
4. ✅ Test: `sudo nginx -t`
5. ✅ Reload: `sudo systemctl reload nginx`
6. ✅ Test origin: `curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir`
7. ✅ Verify: `openssl s_client -connect 127.0.0.1:443 -servername www.zala.ir`
8. ✅ گفتن به شما که Cloudflare رو Full (strict) کنید
9. ✅ Test external: `curl -I https://www.zala.ir`
10. ✅ Push و PR

---

**آماده‌ام! لطفاً certificate رو از Cloudflare دریافت کنید و اسکریپت رو اجرا کنید.** 🚀

بعد به من بگید تا ادامه بدم!
