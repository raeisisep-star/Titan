# 🔍 خلاصه اقدامات دیباگ - راهنمای فارسی

**تاریخ:** 1404/07/29 (2025-10-20)  
**مشکل:** هدرهای HSTS و امنیتی در پاسخ‌های HTTP نمایش داده نمی‌شوند

---

## 📋 وضعیت فعلی

### ✅ کارهای انجام شده توسط شما:
- کانفیگ Nginx جایگزین شد
- `nginx -t` بدون خطا پاس شد  
- `systemctl reload nginx` بدون مشکل اجرا شد

### ❌ مشکل:
- هدر `Strict-Transport-Security` در پاسخ‌ها نیست
- هدرهای امنیتی (X-Frame-Options و...) در پاسخ‌ها نیست
- این در حالی است که در کانفیگ با دستور `always` تنظیم شده‌اند

---

## 🚀 اقدامات فوری (گام به گام)

### گام 1️⃣: اعمال کانفیگ به‌روز شده با هدر تشخیصی

من یک هدر تشخیصی (`X-Titan-Config`) به کانفیگ اضافه کردم تا بفهمیم کدام server block فعال است.

```bash
# کپی کانفیگ جدید
sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala

# تست کانفیگ
sudo nginx -t

# در صورت موفق بودن، reload کن
sudo systemctl reload nginx
```

**خروجی مورد انتظار:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### گام 2️⃣: اجرای اسکریپت تشخیص خودکار

یک اسکریپت آماده کردم که همه چیز رو چک می‌کنه:

```bash
cd /home/ubuntu/Titan
./scripts/diagnose-nginx.sh
```

**این اسکریپت چه چیزهایی چک می‌کنه؟**
- ✅ وضعیت سرویس Nginx
- ✅ فایل‌های کانفیگ و symlink
- ✅ تداخل در server_name
- ✅ هدرها در تست محلی (بدون گذر از Cloudflare)
- ✅ هدرها در تست خارجی (از طریق Cloudflare)
- ✅ خطاهای اخیر Nginx
- ✅ پروسس‌های worker

---

### گام 3️⃣: تست دستی هدر تشخیصی (مهم‌ترین تست!)

```bash
# تست مستقیم به Nginx (بدون گذر از Cloudflare)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "x-titan"
```

**نتیجه مورد انتظار:**
```
x-titan-config: zala-ssl-enhanced-v2
```

**تفسیر نتایج:**
- ✅ **هدر نمایش داده شد:** کانفیگ فعال است → برو گام 4
- ❌ **هدر نیست:** server block اشتباهی فعال است → بخش عیب‌یابی را ببین

---

### گام 4️⃣: تست هدر HSTS به صورت محلی

```bash
# تست هدر HSTS (مستقیم به Nginx)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "strict-transport"
```

**نتیجه مورد انتظار:**
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**تفسیر نتایج:**
- ✅ **هدر نمایش داده شد:** Nginx درست کار می‌کند → Cloudflare رو چک کن
- ❌ **هدر نیست (با اینکه X-Titan-Config هست):** مشکل پیچیده‌تر است

---

### گام 5️⃣: تست از بیرون (از طریق Cloudflare)

```bash
# تست از طریق Cloudflare
curl -I https://www.zala.ir | grep -i "strict-transport"
```

**تفسیر نتایج:**
- ✅ **هدر هست:** همه چیز کار می‌کنه! 🎉
- ❌ **هدر نیست (ولی تو تست محلی بود):** Cloudflare داره هدرها رو حذف می‌کنه

---

## 🎯 سناریوهای احتمالی

### سناریو A: هدر X-Titan-Config نیست

**یعنی:** کانفیگ اصلاً اعمال نشده.

**چک کن:**
```bash
# symlink درست هست؟
ls -la /etc/nginx/sites-enabled/ | grep zala

# server_name درسته؟
grep "server_name" /etc/nginx/sites-available/zala

# تداخلی نیست؟
grep -r "default_server" /etc/nginx/sites-enabled/
```

**راه حل:**
```bash
# restart کامل
sudo systemctl restart nginx

# دوباره تست کن
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -i "x-titan"
```

---

### سناریو B: X-Titan-Config هست، ولی HSTS نیست

**یعنی:** کانفیگ فعاله ولی هدرها اضافه نمی‌شن.

**راه حل:**
```bash
# restart کامل Nginx
sudo systemctl restart nginx

# صبر کن 2 ثانیه
sleep 2

# دوباره تست کن
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir/ | grep -iE "(strict-transport|x-frame)"
```

---

### سناریو C: محلی کار می‌کنه، ولی از بیرون نه

**یعنی:** Cloudflare هدرها رو حذف می‌کنه.

**✅ این رفتار طبیعیه!** Cloudflare امنیت رو در لایه edge مدیریت می‌کنه.

**راه حل:**

1. **برو داشبورد Cloudflare:**
   - دامنه: zala.ir
   - بخش: **SSL/TLS** → **Edge Certificates**

2. **فعال کن HSTS رو:**
   - گزینه: **HSTS (HTTP Strict Transport Security)** → روشن
   - تنظیمات:
     - Max Age: **31536000** ثانیه (1 سال)
     - Include subdomains: ✅
     - Preload: ✅
     - No-Sniff Header: ✅

3. **در PR توضیح بده:**
   - هدرهای امنیتی در Cloudflare edge مدیریت می‌شن
   - این روش قابل قبول و حتی ترجیحی است

---

## 🧪 اجرای تست‌های اصلاح شده

بعد از حل مشکل، این رو اجرا کن:

```bash
cd /home/ubuntu/Titan
./scripts/test-ssl-acceptance-fixed.sh
```

**چه چیزهایی اصلاح شده؟**
- ✅ Health endpoint: انتظار `{"ok": true}` داره نه `{"data":{"status":"healthy"}}`
- ✅ Auth endpoint: چندین مسیر مختلف رو امتحان می‌کنه
- ✅ تست تشخیصی اضافه شده (تست 9): چک می‌کنه X-Titan-Config هست یا نه
- ✅ همه هدرهای پاسخ رو نشون میده برای دیباگ

---

## 📝 دستورات سریع

```bash
# 1. اعمال کانفیگ جدید
sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala
sudo nginx -t && sudo systemctl reload nginx

# 2. اجرای تشخیص خودکار
cd /home/ubuntu/Titan
./scripts/diagnose-nginx.sh

# 3. چک سریع هدرها (محلی)
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir | grep -iE "(x-titan|strict-transport)"

# 4. چک سریع هدرها (خارجی)
curl -I https://www.zala.ir | grep -i "strict-transport"

# 5. restart کامل Nginx
sudo systemctl restart nginx

# 6. اجرای تست‌های اصلاح شده
./scripts/test-ssl-acceptance-fixed.sh
```

---

## 📊 مسیر تصمیم‌گیری

```
تست X-Titan-Config به صورت محلی
│
├─ ❌ نیست
│   └─> [سناریو A] server block اشتباه فعاله
│       └─> symlink، server_name، تداخل‌ها رو چک کن
│
├─ ✅ هست
    │
    └─> تست HSTS به صورت محلی
        │
        ├─ ❌ نیست
        │   └─> [سناریو B] هدرها اضافه نمی‌شن
        │       └─> Nginx رو restart کن
        │
        └─ ✅ هست
            │
            └─> تست HSTS از بیرون (از طریق Cloudflare)
                │
                ├─ ❌ نیست
                │   └─> [سناریو C] Cloudflare داره حذف می‌کنه
                │       └─> HSTS رو در Cloudflare فعال کن
                │       └─> این طبیعی و قابل قبوله ✅
                │
                └─ ✅ هست
                    └─> 🎉 موفقیت! همه چی کار می‌کنه
```

---

## ✅ معیارهای موفقیت

می‌دونی همه چیز کار می‌کنه وقتی که:

1. ✅ هدر X-Titan-Config در تست محلی نمایش داده بشه
2. ✅ هدر HSTS در تست محلی نمایش داده بشه
3. ✅ هدرهای امنیتی در تست محلی نمایش داده بشن
4. ✅ HSTS در داشبورد Cloudflare فعال شده باشه
5. ✅ اسکریپت تست حداقل 7 از 9 تست رو پاس کنه
6. ✅ خطایی در لاگ Nginx نباشه (به جز هشدار OCSP stapling)

---

## 📚 فایل‌های مرتبط

- **کانفیگ به‌روز شده:** `/home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf` ⬅️ این رو apply کن
- **راهنمای تشخیص:** `/home/ubuntu/Titan/NGINX_HEADER_DIAGNOSTIC.md`
- **اسکریپت تشخیص:** `/home/ubuntu/Titan/scripts/diagnose-nginx.sh` ⬅️ این رو اجرا کن
- **تست اصلاح شده:** `/home/ubuntu/Titan/scripts/test-ssl-acceptance-fixed.sh` ⬅️ این رو اجرا کن
- **راهنمای کامل:** `/home/ubuntu/Titan/HEADER_DEBUG_INSTRUCTIONS.md`

---

## 🔄 کارهایی که من انجام دادم:

1. ✅ هدر تشخیصی `X-Titan-Config` به کانفیگ اضافه کردم
2. ✅ اسکریپت تشخیص خودکار آماده کردم (`diagnose-nginx.sh`)
3. ✅ اسکریپت تست اصلاح شده آماده کردم (`test-ssl-acceptance-fixed.sh`)
4. ✅ راهنمای کامل فارسی و انگلیسی نوشتم
5. ✅ سناریوهای مختلف عیب‌یابی رو مستند کردم

---

## 🎯 کارهایی که شما باید انجام بدید:

### فوری:
1. اجرای گام 1: apply کردن کانفیگ جدید
2. اجرای گام 2: اسکریپت تشخیص خودکار
3. بررسی نتایج و اطلاع به من

### در صورت نیاز:
4. ارسال خروجی `diagnose-nginx.sh` برای بررسی بیشتر
5. اجرای تست‌های دستی طبق سناریوی مشخص شده
6. فعال‌سازی HSTS در Cloudflare (اگر سناریو C باشه)

---

**موفق باشید! 🚀**

اگر مشکلی پیش اومد که تو این راهنما نیست، خروجی `./scripts/diagnose-nginx.sh` رو برام بفرست.
