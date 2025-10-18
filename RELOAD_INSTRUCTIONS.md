# 🔄 دستورالعمل Reload کردن سیستم

## ⚠️ مشکل فعلی
فایل‌های فرانت‌اند آپدیت شده‌اند ولی برای اینکه تغییرات نمایان شوند نیاز است:

1. ✅ **Backend restart شد** (PM2 restart شد)
2. ❌ **Nginx reload شود** (نیاز به sudo دارد)
3. ❌ **Browser cache پاک شود** (توسط کاربر)

---

## 🚀 راه‌حل 1: Reload کردن Nginx (توصیه می‌شود)

### روی سرور production اجرا کنید:

```bash
cd /tmp/webapp/Titan
sudo systemctl reload nginx
```

یا:

```bash
sudo nginx -s reload
```

### بررسی وضعیت nginx:

```bash
sudo systemctl status nginx
sudo nginx -t  # بررسی کانفیگ
```

---

## 🚀 راه‌حل 2: استفاده از صفحه تست Force Reload

### بدون reload nginx:

1. مرورگر را در حالت **Incognito/Private** باز کنید
2. به این آدرس بروید:
   ```
   https://zala.ir/force-reload.html
   ```
3. دکمه "Test Dashboard Now" را بزنید
4. نتایج را بررسی کنید

---

## 🚀 راه‌حل 3: پاک کردن Cache مرورگر

### Chrome/Edge:
1. `Ctrl + Shift + Delete` را بزنید
2. "Cached images and files" را انتخاب کنید
3. "Clear data" را بزنید
4. سایت را دوباره باز کنید

### Firefox:
1. `Ctrl + Shift + Delete` را بزنید
2. "Cache" را انتخاب کنید
3. "Clear Now" را بزنید

### یا Hard Refresh:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

## 🧪 تست کردن تغییرات

### روش 1: صفحه تست Debug
```
https://zala.ir/test-debug-dashboard.html
```

### روش 2: صفحه Force Reload (جدید)
```
https://zala.ir/force-reload.html
```

### روش 3: Dashboard اصلی
```
https://zala.ir
```
با F12 console را باز کنید و log‌ها را بررسی کنید.

---

## ✅ نشانه‌های موفقیت

در console مرورگر باید ببینید:

```
🎯 [Comprehensive Adapter] Starting data fetch...
   USE_MOCK: false
   Token: Present
🎯 [Comprehensive Adapter] Strategy 1: Trying /api/dashboard/comprehensive-real...
✅ [Comprehensive Adapter] Got data from comprehensive endpoint
```

اگر این را ندیدید و mock data می‌بینید:
- Cache مرورگر پاک نشده
- یا Nginx reload نشده

---

## 🔍 دیباگ کردن

### بررسی backend:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/dashboard/comprehensive-real
```

### بررسی nginx logs:
```bash
sudo tail -f /var/log/nginx/titan-ssl-access.log
sudo tail -f /var/log/nginx/titan-ssl-error.log
```

### بررسی PM2:
```bash
pm2 status
pm2 logs titan-backend --lines 50
```

---

## 📝 فایل‌های آپدیت شده

- ✅ `public/index.html` - ENV config + cache busting
- ✅ `public/static/lib/http.js` - Enhanced logging
- ✅ `public/static/data/dashboard/comprehensive.adapter.js` - Detailed logs
- ✅ `public/static/modules/dashboard.js` - Cache busting
- ✅ `public/test-debug-dashboard.html` - Test page
- ✅ `public/force-reload.html` - Force reload page
- ✅ `server-real-v3.js` - Admin login fix

---

## 🎯 خلاصه

**سریع‌ترین راه:**
```bash
sudo systemctl reload nginx
```

سپس مرورگر را در حالت Incognito باز کرده و https://zala.ir/force-reload.html را تست کنید.
