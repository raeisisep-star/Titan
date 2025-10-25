# مراحل نیازمند دسترسی Sudo - فاز 2

## 🔴 وضعیت فعلی

### ✅ آنچه که من انجام داده‌ام (بدون نیاز به sudo):

1. **✅ پیاده‌سازی 6 اندپوینت داشبورد با داده واقعی**
   - همه اندپوینت‌ها با `meta.source: "real"` کار می‌کنند
   - تست شده روی `localhost:5000`
   - کد commit و push شده به برنچ `genspark_ai_developer`

2. **✅ تغییرات دیتابیس**
   - ستون `total_pnl_percentage` اضافه شد
   - ویوهای `v_dashboard_portfolio` و `v_dashboard_trading` ایجاد شدند
   - 20 ترید نمونه سید شد

3. **✅ به‌روزرسانی فایل‌های backend**
   - `server-real-v3.js` (فایل اصلی PM2) به‌روز شد
   - `server.js` به‌روز شد
   - PM2 ری‌استارت شد و backend کار می‌کند

4. **✅ مستندسازی**
   - `PR_EVIDENCE.md` - شواهد تست
   - `PHASE2_COMPLETION_SUMMARY.md` - خلاصه کامل
   - `TEST_ENDPOINTS.sh` - اسکریپت تست سریع
   - `EXECUTE_NOW.md` - راهنمای اجرا

### ❌ آنچه که نیاز به sudo دارد و من نمی‌توانم انجام دهم:

## 1️⃣ توقف پروسس‌های Wrangler

**وضعیت**: 7 پروسس wrangler در حال اجرا با کاربر `root`

```bash
root     1674089  # esbuild (از Sep24 اجرا می‌شود)
root     3387782  # esbuild (از Oct14 اجرا می‌شود)
root     3388362  # esbuild (از Oct14 اجرا می‌شود)
root     3442830  # wrangler pages dev
root     3442837  # wrangler cli
root     3442872  # esbuild
root     3442911  # workerd
```

**دستورات مورد نیاز**:
```bash
# روش 1: Kill تمام پروسس‌ها
sudo pkill -9 -f wrangler

# روش 2: Kill با PID (اگر روش 1 کار نکرد)
sudo kill -9 1674089 3387782 3388362 3442830 3442837 3442872 3442911

# تأیید
ps aux | grep wrangler | grep -v grep
# باید خروجی خالی باشد
```

**چرا مهم است**:
- wrangler در حال سرو فایل‌های قدیمی از `dist/` است
- با nginx جدید تداخل دارد
- پورت 3000 را اشغال کرده است

---

## 2️⃣ به‌روزرسانی کانفیگ Nginx

**وضعیت**: کانفیگ فعلی cache-control ندارد و ممکن است Cloudflare کش کند

**کانفیگ آماده**: `/tmp/webapp/Titan/infra/nginx-production.conf`

**دستورات مورد نیاز**:
```bash
# 1. بکاپ از کانفیگ فعلی
sudo cp /etc/nginx/sites-enabled/zala \
   /etc/nginx/sites-enabled/zala.backup.$(date +%F_%H-%M-%S)

# 2. کپی کانفیگ جدید
sudo cp /tmp/webapp/Titan/infra/nginx-production.conf \
   /etc/nginx/sites-enabled/zala

# 3. تست کانفیگ
sudo nginx -t

# 4. ری‌لود nginx
sudo systemctl reload nginx
```

**تفاوت‌های کلیدی در کانفیگ جدید**:
```nginx
# برای /api/* - جلوگیری از کش
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    expires off;
}

# برای فرانت‌اند - سرو از public/
location / {
    root /tmp/webapp/Titan/public;
    try_files $uri $uri/ /index.html;
    
    # HTML - بدون کش
    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
        expires 0;
    }
    
    # استاتیک فایل‌ها - کش بلندمدت
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**چرا مهم است**:
- جلوگیری از کش شدن API responses در Cloudflare
- مطمئن شدن از اینکه `/api/health` بدون هدر خاص 200 برمی‌گرداند
- سرو صحیح فایل‌های استاتیک از `public/`

---

## 3️⃣ تست و تأیید نهایی

بعد از اجرای مراحل بالا:

### تست 1: Health endpoint روی دامنه
```bash
curl -i https://www.zala.ir/api/health

# انتظار:
# HTTP/2 200
# Content-Type: application/json
# بدون نیاز به هدر Cache-Control

# بررسی محتوا
curl -s https://www.zala.ir/api/health | jq '.data.status'
# باید "healthy" برگرداند
```

### تست 2: Dashboard endpoints روی دامنه
```bash
curl -s https://www.zala.ir/api/dashboard/portfolio-real | jq '.meta.source'
# باید "real" برگرداند
```

### تست 3: Badge در مرورگر
1. باز کردن `https://www.zala.ir/#dashboard`
2. بررسی badge پایین-چپ صفحه
3. باید متن **"منبع: REAL"** را نشان دهد (نه MOCK)

### تست 4: Network tab در DevTools
1. باز کردن DevTools > Network
2. Refresh صفحه dashboard
3. بررسی تمام درخواست‌های `/api/dashboard/*-real`
4. هر کدام باید:
   - Status: `200 OK`
   - Response Body: `meta.source: "real"`

---

## 📊 خلاصه وضعیت

| مرحله | وضعیت | نیاز به sudo |
|-------|-------|--------------|
| 6 اندپوینت داشبورد | ✅ کامل | ❌ |
| تغییرات دیتابیس | ✅ کامل | ❌ |
| به‌روزرسانی backend | ✅ کامل | ❌ |
| تست localhost | ✅ کامل | ❌ |
| Commit & Push | ✅ کامل | ❌ |
| توقف wrangler | ⏳ منتظر | ✅ نیاز دارد |
| کانفیگ nginx | ⏳ منتظر | ✅ نیاز دارد |
| تست دامنه | ⏳ منتظر | ✅ (بعد از nginx) |
| تأیید Badge | ⏳ منتظر | ✅ (بعد از nginx) |

---

## 🔑 رمز sudo

من **رمز sudo سرور را ندارم**. رمزی که در `.env` وجود دارد (`Titan@2024!Strong`) برای دیتابیس PostgreSQL است، نه برای کاربر `ubuntu` در سرور.

لطفاً یکی از این روش‌ها را امتحان کنید:

### گزینه 1: اجرای مستقیم (اگر passwordless sudo فعال است)
```bash
sudo whoami
# اگر بدون پرسیدن رمز "root" برگرداند، می‌توانید مستقیماً اجرا کنید
```

### گزینه 2: استفاده از رمز با stdin
```bash
echo "YOUR_SUDO_PASSWORD" | sudo -S pkill -9 -f wrangler
```

### گزینه 3: SSH تعاملی
اگر هیچکدام کار نکرد، باید به صورت تعاملی SSH کنید و دستورات را اجرا کنید.

---

## 🚀 دستورات کامل برای کپی-پیست

وقتی دسترسی sudo داشتید، این دستورات را اجرا کنید:

```bash
# =========================================
# مرحله 1: توقف Wrangler
# =========================================
sudo pkill -9 -f wrangler
sleep 2
ps aux | grep wrangler | grep -v grep || echo "✅ Wrangler stopped"

# =========================================
# مرحله 2: به‌روزرسانی Nginx
# =========================================
cd /tmp/webapp/Titan

# بکاپ
sudo cp /etc/nginx/sites-enabled/zala \
   /etc/nginx/sites-enabled/zala.backup.$(date +%F_%H-%M-%S)

# کپی کانفیگ جدید
sudo cp infra/nginx-production.conf /etc/nginx/sites-enabled/zala

# تست
sudo nginx -t

# ری‌لود
sudo systemctl reload nginx

echo "✅ Nginx updated"

# =========================================
# مرحله 3: تست
# =========================================

# تست health
curl -i https://www.zala.ir/api/health

# تست dashboard
curl -s https://www.zala.ir/api/dashboard/portfolio-real | jq '{success, meta}'

# تست تمام اندپوینت‌ها
bash TEST_ENDPOINTS.sh

echo "✅ All tests complete"
```

---

## 📸 شواهد مورد نیاز برای PR

بعد از اجرای موفق:

1. **اسکرین‌شات از خروجی دستورات**:
   ```bash
   # 1. وضعیت wrangler (باید خالی باشد)
   ps aux | grep wrangler | grep -v grep
   
   # 2. خروجی curl health
   curl -i https://www.zala.ir/api/health
   
   # 3. خروجی curl dashboard
   curl -s https://www.zala.ir/api/dashboard/comprehensive-real | jq '.meta'
   ```

2. **اسکرین‌شات مرورگر**:
   - صفحه dashboard با badge نشان‌دهنده "REAL"
   - DevTools Network tab با تمام `/api/dashboard/*` requests

3. **ویدئو کوتاه** (اختیاری اما خوب است):
   - Refresh صفحه dashboard
   - نمایش Network tab
   - نمایش badge

---

## ⚠️ نکات مهم

1. اگر nginx -t خطا داد، کانفیگ قبلی را بازگردانید:
   ```bash
   sudo cp /etc/nginx/sites-enabled/zala.backup.* /etc/nginx/sites-enabled/zala
   sudo systemctl reload nginx
   ```

2. اگر wrangler دوباره راه افتاد، بررسی کنید که سرویس systemd ندارد:
   ```bash
   sudo systemctl list-units | grep wrangler
   sudo systemctl disable wrangler
   ```

3. اگر دامنه 502 داد، بررسی کنید که backend (PM2) در حال اجرا است:
   ```bash
   pm2 status
   pm2 logs titan-backend --lines 20
   ```

---

**تهیه‌شده**: 2025-10-19 19:00 UTC  
**توسط**: Claude AI Assistant  
**وضعیت**: منتظر اجرای دستورات sudo توسط کاربر
