# 🚀 Deployment Instructions - Token Management System

## 📦 فایل‌های جدید که باید آپلود شوند

### 1. فایل‌های جدید (NEW FILES):
```
public/static/lib/token-manager.js
public/static/lib/auth-wrapper.js
public/test-token-flow.html
```

### 2. فایل‌های به‌روزرسانی شده (UPDATED FILES):
```
public/index.html
public/static/lib/http.js
public/static/data/dashboard/comprehensive.adapter.js
```

---

## 🔧 دستورات Deploy روی سرور

### مرحله 1: آپلود فایل‌ها

از طریق SFTP یا SCP، فایل‌های بالا را به سرور منتقل کنید:

```bash
# از دایرکتوری محلی Titan
scp public/static/lib/token-manager.js root@zala.ir:/tmp/webapp/Titan/public/static/lib/
scp public/static/lib/auth-wrapper.js root@zala.ir:/tmp/webapp/Titan/public/static/lib/
scp public/test-token-flow.html root@zala.ir:/tmp/webapp/Titan/public/
scp public/index.html root@zala.ir:/tmp/webapp/Titan/public/
scp public/static/lib/http.js root@zala.ir:/tmp/webapp/Titan/public/static/lib/
scp public/static/data/dashboard/comprehensive.adapter.js root@zala.ir:/tmp/webapp/Titan/public/static/data/dashboard/
```

### مرحله 2: Restart PM2 و Nginx

```bash
ssh root@zala.ir

# Restart PM2 backend
cd /tmp/webapp/Titan
pm2 restart all

# Reload Nginx
sudo systemctl reload nginx

# یا اگر reload کار نکرد:
sudo systemctl restart nginx
```

---

## 🧪 تست عملکرد

### تست 1: Token Flow Debugger
1. باز کنید: `https://zala.ir/test-token-flow.html`
2. روی دکمه‌ها به ترتیب کلیک کنید:
   - Check localStorage Token
   - Login as admin/admin
   - Check Token Again (باید Token موجود باشد)
   - Call API (باید 200 OK بگیرد)

### تست 2: Dashboard اصلی
1. باز کنید: `https://zala.ir`
2. Login کنید با `admin/admin`
3. کنسول مرورگر (F12) را باز کنید
4. باید لاگ‌های زیر را ببینید:
```
🔐 [TokenManager] Initialized
✅ Token Manager module loaded
🔐 [AuthWrapper] Added token to axios request via interceptor
🔐 [App] Login successful, saving token...
✅ [App] Token saved successfully
```

5. Dashboard باید داده‌های واقعی نشان دهد (نه mock)

---

## 🔍 Troubleshooting

### اگر Token هنوز Missing است:

1. **Hard Refresh کنید** (Ctrl+Shift+R یا Cmd+Shift+R)
2. **Cache مرورگر را پاک کنید**:
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
3. **Incognito/Private Mode** را امتحان کنید
4. **Console logs** را بررسی کنید برای error messages

### اگر فایل‌ها لود نمی‌شوند:

```bash
# بررسی permissions
ls -la /tmp/webapp/Titan/public/static/lib/token-manager.js
ls -la /tmp/webapp/Titan/public/static/lib/auth-wrapper.js

# اگر 404 می‌دهد، permissions را درست کنید:
chmod 644 /tmp/webapp/Titan/public/static/lib/*.js
```

### اگر Nginx فایل‌ها را serve نمی‌کند:

```bash
# تست مستقیم:
curl -I https://zala.ir/static/lib/token-manager.js
curl -I https://zala.ir/static/lib/auth-wrapper.js

# باید 200 OK بگیرید، نه 404
```

---

## 📊 معیارهای موفقیت

✅ **موفق** اگر:
- Login کار می‌کند
- Token در console log ظاهر می‌شود
- Dashboard داده‌های real نشان می‌دهد
- هیچ 401 error در console نیست

❌ **ناموفق** اگر:
- Token: Missing در console
- 401 Unauthorized در API calls
- Dashboard هنوز mock data نشان می‌دهد

---

## 🎯 چه انتظاری داشته باشید

بعد از deployment موفق:

1. **Login Flow:**
   - ورود سریع و روان
   - Token ذخیره می‌شود (verification در console)
   - Redirect به dashboard

2. **Dashboard:**
   - Data واقعی از backend
   - بدون fallback به mock
   - Source badge می‌گوید: "Real API"

3. **Console Logs:**
   ```
   🔐 [TokenManager] Token saved successfully to all layers
   ✅ [App] Token saved successfully
   🔑 [HTTP] Token found via TokenManager
   ✅ [Comprehensive Adapter] Got data from comprehensive endpoint
   ```

---

## 🚨 نکات مهم

1. **Load Order مهم است**: token-manager.js و auth-wrapper.js باید قبل از app.js لود شوند
2. **Module Type**: فایل‌ها به عنوان ES6 modules لود می‌شوند (`type="module"`)
3. **Cache Busting**: Version numbers در index.html باید unique باشند
4. **Browser Compatibility**: Modern browsers فقط (ES6+ support)

---

## 📞 در صورت مشکل

اگر بعد از deployment مشکل داشتید:

1. Screenshot از console logs بفرستید
2. Screenshot از Network tab (F12 > Network)
3. نتیجه `test-token-flow.html` را بفرستید

من فوراً مشکل را بررسی و حل می‌کنم.
