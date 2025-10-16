# 🚀 راهنمای اعمال فوری تغییرات

## 🔍 **مشکلات پیدا شده:**

### مشکل #1: URL دوبار `/api` دارد ❌
```
Request می‌رود به: https://www.zala.ir/api/api/auth/login
                                      ^^^^ دوبار!
```

**علت:** 
- `config.js` می‌گوید: `API_BASE_URL: 'https://www.zala.ir/api'`
- `app.js` می‌گوید: `axios.post('/api/auth/login', ...)`
- نتیجه: `https://www.zala.ir/api` + `/api/auth/login` = دوبار!

**راه حل:** ✅ **FIXED** - config.js را تغییر دادم:
```javascript
// قبل:
API_BASE_URL: 'https://www.zala.ir/api',

// بعد:
API_BASE_URL: 'https://www.zala.ir',
```

---

### مشکل #2: CORS Headers تکراری ❌
```
'Access-Control-Allow-Origin' header contains multiple values '*, *'
```

**علت:**
1. Backend (Hono) CORS headers می‌فرستد: `Access-Control-Allow-Origin: *`
2. Nginx هم CORS headers اضافه می‌کند: `Access-Control-Allow-Origin: *`
3. نتیجه: دوبار header → `*, *` ❌

**راه حل:** ✅ **READY** - Nginx config جدید آماده است:
- فایل: `nginx-titan-fixed-cors.conf`
- CORS headers از Nginx حذف شدند
- فقط Backend CORS handle می‌کند

---

## 📋 **تغییرات اعمال شده (خودکار):**

### ✅ 1. config.js
```bash
# قبل:
API_BASE_URL: 'https://www.zala.ir/api'

# بعد:
API_BASE_URL: 'https://www.zala.ir'
```

---

## 🛠️ **تغییرات نیاز به اجرای دستی:**

### ⚠️ 2. Nginx Configuration (نیاز به sudo)

```bash
# Backup فایل فعلی
sudo cp /etc/nginx/sites-enabled/titan /etc/nginx/sites-enabled/titan.backup.$(date +%Y%m%d_%H%M%S)

# Copy فایل جدید
sudo cp /tmp/webapp/Titan/nginx-titan-fixed-cors.conf /etc/nginx/sites-enabled/titan

# Test configuration
sudo nginx -t

# اگر test موفق بود، reload کنید:
sudo systemctl reload nginx
```

**یا اگر ترجیح می‌دهید با symlink:**
```bash
# Backup
sudo mv /etc/nginx/sites-enabled/titan /etc/nginx/sites-enabled/titan.backup.$(date +%Y%m%d_%H%M%S)

# Create symlink
sudo ln -s /tmp/webapp/Titan/nginx-titan-fixed-cors.conf /etc/nginx/sites-enabled/titan

# Test & reload
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🧪 **تست بعد از اعمال تغییرات:**

### Test 1: بررسی Nginx reload شد
```bash
sudo systemctl status nginx
```
باید ببینید: `active (running)`

### Test 2: تست CORS از command line
```bash
curl -I -X OPTIONS https://www.zala.ir/api/auth/login \
  -H "Origin: https://www.zala.ir" \
  -H "Access-Control-Request-Method: POST"
```

باید ببینید:
```
Access-Control-Allow-Origin: *    # فقط یکبار!
Access-Control-Allow-Methods: ...
```

### Test 3: تست Login API
```bash
curl -X POST https://www.zala.ir/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

باید ببینید:
```json
{
  "success": true,
  "data": {
    "token": "titan_token_...",
    "user": {...}
  }
}
```

---

## 🌐 **تست در Browser:**

### مرحله 1: Hard Refresh
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### مرحله 2: بررسی Console
Browser Console (F12) باید ببینید:
```
✅ TITAN Config loaded for: production
📡 API Base: https://www.zala.ir       ← بدون /api در انتها!
✅ Axios configured with baseURL: https://www.zala.ir
```

### مرحله 3: Login
```
Username: admin
Password: admin
```

### مرحله 4: بررسی Network Tab
در Network tab (F12) باید ببینید:
```
POST /api/auth/login               ← فقط یکبار /api!
Request URL: https://www.zala.ir/api/auth/login
Status: 200
```

### مرحله 5: بررسی Response Headers
```
Access-Control-Allow-Origin: *     ← فقط یکبار!
```

---

## 📊 **خلاصه تغییرات:**

| مشکل | قبل | بعد | وضعیت |
|------|-----|-----|--------|
| URL دوبار /api | `https://www.zala.ir/api/api/...` | `https://www.zala.ir/api/...` | ✅ Fixed |
| CORS Headers | `*, *` (دوبار) | `*` (یکبار) | ⚠️ Nginx reload needed |

---

## 🚨 **اگر مشکل ادامه داشت:**

### Debug 1: بررسی config.js در browser
```javascript
// در Browser Console:
console.log(window.TITAN_CONFIG.API_BASE_URL);
// باید باشد: https://www.zala.ir (بدون /api)
```

### Debug 2: بررسی axios baseURL
```javascript
// در Browser Console:
console.log(axios.defaults.baseURL);
// باید باشد: https://www.zala.ir
```

### Debug 3: بررسی Request URL
```javascript
// در Network tab، روی request کلیک کنید
// Request URL باید باشد: https://www.zala.ir/api/auth/login
// نه: https://www.zala.ir/api/api/auth/login
```

### Debug 4: بررسی CORS Headers
```bash
# از command line:
curl -I https://www.zala.ir/api/auth/login

# باید فقط یکبار ببینید:
# Access-Control-Allow-Origin: *
```

---

## 📄 **فایل‌های ایجاد شده:**

- ✅ `nginx-titan-fixed-cors.conf` - Nginx config جدید (بدون CORS headers)
- ✅ `public/config.js` - Updated (بدون /api در baseURL)
- ✅ `APPLY_FIXES_NOW.md` - این راهنما

---

## 🎯 **خلاصه مراحل:**

1. ✅ **config.js تغییر یافت** (خودکار)
2. ⚠️ **Nginx را reload کنید** (دستی - نیاز به sudo):
   ```bash
   sudo cp /tmp/webapp/Titan/nginx-titan-fixed-cors.conf /etc/nginx/sites-enabled/titan
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. 🔄 **Browser را hard refresh کنید** (Ctrl+Shift+R)
4. 🧪 **Login تست کنید** (admin/admin)

---

تاریخ: 2025-10-14 16:20 UTC
Status: Ready to apply Nginx changes
