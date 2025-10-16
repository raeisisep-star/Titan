# 🚀 دستورالعمل Deploy کامل TITAN Frontend

## ✅ وضعیت فعلی

همه فایل‌های لازم آماده شده‌اند:
- ✅ `public/index.html` - HTML کامل application (12 KB)
- ✅ `public/static/` - 116 فایل (app.js, modules, icons, etc.)
- ✅ `public/config.js` - Configuration با HTTPS URLs
- ✅ `nginx-titan-updated.conf` - Nginx config جدید

## 🎯 مراحل Deploy (دستی)

### مرحله 1️⃣: Backup کردن Nginx Config

```bash
cd /tmp/webapp/Titan
sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)
```

✅ **بررسی**: لیست backup‌ها را ببینید
```bash
ls -lh /etc/nginx/sites-available/titan.backup.*
```

---

### مرحله 2️⃣: Deploy کردن Nginx Config جدید

```bash
cd /tmp/webapp/Titan
sudo cp nginx-titan-updated.conf /etc/nginx/sites-available/titan
```

✅ **بررسی**: محتوای فایل جدید را ببینید
```bash
grep "root /tmp/webapp/Titan" /etc/nginx/sites-available/titan
```

**باید نتیجه**: `root /tmp/webapp/Titan/public;` (نه `dist`)

---

### مرحله 3️⃣: Test کردن Nginx Config

```bash
sudo nginx -t
```

✅ **نتیجه مورد انتظار**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

❌ **اگر خطا دادید**: Backup را restore کنید
```bash
sudo cp /etc/nginx/sites-available/titan.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/titan
```

---

### مرحله 4️⃣: Reload کردن Nginx

```bash
sudo systemctl reload nginx
```

✅ **بررسی وضعیت**:
```bash
sudo systemctl status nginx
```

---

### مرحله 5️⃣: Verify کردن Deployment

#### بررسی Backend:
```bash
curl http://localhost:5000/health
```

✅ **نتیجه مورد انتظار**: JSON با `status: "healthy"`

#### بررسی Frontend (Local):
```bash
curl -I http://localhost:80/
```

✅ **نتیجه مورد انتظار**: `HTTP/1.1 301 Moved Permanently` (redirect به HTTPS)

#### بررسی HTTPS:
```bash
curl -I https://www.zala.ir/
```

✅ **نتیجه مورد انتظار**: `HTTP/2 200` و `content-type: text/html`

#### بررسی Static Files:
```bash
curl -I https://www.zala.ir/static/app.js
```

✅ **نتیجه مورد انتظار**: `HTTP/2 200` و `content-type: application/javascript`

---

## 🎉 تست نهایی در Browser

1. باز کنید: https://www.zala.ir
2. باید صفحه Login تایتان (🚀) را ببینید
3. دکمه "🔍 تست اتصال سیستم" را بزنید
4. باید پیام `✅ اتصال موفقیت آمیز!` را ببینید

---

## 🐛 عیب‌یابی (Troubleshooting)

### مشکل 1: صفحه قدیمی نمایش داده می‌شود

**علت**: Browser cache

**راه حل**:
1. `Ctrl + Shift + R` (Hard Refresh)
2. یا `Ctrl + F5`
3. یا در DevTools: Network tab → Disable cache

### مشکل 2: خطای 404 برای /static/

**بررسی**:
```bash
ls -la /tmp/webapp/Titan/public/static/app.js
```

**باید فایل را ببینید**. اگر ندیدید:
```bash
# بررسی کنید که public/static/ دارای فایل‌ها است
find /tmp/webapp/Titan/public/static -type f | wc -l
# باید 116 باشد
```

### مشکل 3: خطای API (CORS یا Connection)

**بررسی Backend**:
```bash
pm2 status
pm2 logs titan-backend --lines 50
```

**بررسی که پورت 5000 listening است**:
```bash
sudo netstat -tlnp | grep 5000
```

### مشکل 4: SSL/HTTPS مشکل دارد

**بررسی Certificate**:
```bash
sudo certbot certificates
```

**Renew کردن اگر expired است**:
```bash
sudo certbot renew
```

---

## 📊 لاگ‌های مفید

### Nginx Error Logs:
```bash
sudo tail -f /var/log/nginx/titan-ssl-error.log
```

### Nginx Access Logs:
```bash
sudo tail -f /var/log/nginx/titan-ssl-access.log
```

### Backend Logs:
```bash
pm2 logs titan-backend
```

### تمام Logs همزمان:
```bash
# Terminal 1
sudo tail -f /var/log/nginx/titan-ssl-error.log

# Terminal 2
pm2 logs titan-backend
```

---

## 🔄 Rollback (برگشت به نسخه قبل)

اگر مشکلی پیش آمد:

```bash
# پیدا کردن آخرین backup
ls -lt /etc/nginx/sites-available/titan.backup.* | head -1

# Restore کردن
sudo cp /etc/nginx/sites-available/titan.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/titan

# Test و Reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## ✅ Checklist نهایی

- [ ] Backup از nginx config گرفته شد
- [ ] nginx-titan-updated.conf به /etc/nginx/sites-available/titan کپی شد
- [ ] `nginx -t` موفقیت آمیز بود
- [ ] nginx reload شد
- [ ] Backend در حال اجرا است (pm2 status)
- [ ] https://www.zala.ir صفحه Login را نمایش می‌دهد
- [ ] دکمه "تست اتصال" کار می‌کند
- [ ] Static files (/static/app.js) load می‌شوند

---

## 🎯 دستور تک‌خطی (یک دستور کامل)

⚠️ **فقط اگر مطمئن هستید اجرا کنید**:

```bash
cd /tmp/webapp/Titan && \
sudo cp /etc/nginx/sites-available/titan /etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S) && \
sudo cp nginx-titan-updated.conf /etc/nginx/sites-available/titan && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "✅ Deployment complete! Open https://www.zala.ir"
```

---

## 📞 تماس با من

اگر هر مشکلی پیش آمد:
1. لاگ‌های nginx و backend را بررسی کنید
2. دستورات بالا را دنبال کنید
3. اگر نیاز به کمک بیشتر بود، لاگ‌ها را برایم ارسال کنید

---

**تاریخ**: 2025-10-14  
**نسخه**: 1.0.0  
**وضعیت**: آماده برای deployment ✅
