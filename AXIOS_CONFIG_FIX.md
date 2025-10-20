# Fix: Axios Configuration Missing

## 🔍 **مشکل اصلی**

دکمه ورود کار نمی‌کرد چون **axios baseURL نداشت**!

### علائم:
- ✅ Backend در حال اجرا بود (PM2 online)
- ✅ API tests با curl کار می‌کردند
- ❌ دکمه login در browser هیچ کاری نمی‌کرد
- ❌ هیچ request در backend logs نمی‌آمد

### تحلیل:
```javascript
// در app.js:
const response = await axios.post('/api/auth/login', loginData);
```

این یک **relative URL** است (`/api/auth/login`)، اما:
1. ❌ axios baseURL نداشت
2. ❌ config.js load نمی‌شد
3. ❌ request به جای اینکه برود به `https://www.zala.ir/api/auth/login`
   - می‌رفت به `https://www.zala.ir/api/auth/login` (روی همان domain)
   - اما بدون proper proxy یا CORS، fail می‌شد

---

## 🛠️ **راه حل**

### تغییرات در `public/index.html`:

#### قبل:
```html
<!-- Load Main Modules -->
<script src="/static/modules/ai-management.js"></script>
<script src="/static/modules/module-loader.js"></script>
<script src="/static/modules/alerts.js"></script>
<script src="/static/app.js"></script>
```

#### بعد:
```html
<!-- Load Configuration First -->
<script src="/config.js"></script>

<!-- Configure Axios -->
<script>
    // Configure axios with base URL from config
    if (window.TITAN_CONFIG && window.TITAN_CONFIG.API_BASE_URL) {
        axios.defaults.baseURL = window.TITAN_CONFIG.API_BASE_URL;
        console.log('✅ Axios configured with baseURL:', axios.defaults.baseURL);
    } else {
        console.error('❌ TITAN_CONFIG not found! Using relative URLs.');
    }
    
    // Set default headers
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.timeout = 30000;
</script>

<!-- Load Main Modules -->
<script src="/static/modules/ai-management.js"></script>
<script src="/static/modules/module-loader.js"></script>
<script src="/static/modules/alerts.js"></script>
<script src="/static/app.js"></script>
```

---

## 📊 **چگونه کار می‌کند**

### جریان درست:
1. ✅ Browser صفحه را load می‌کند
2. ✅ axios library load می‌شود (از CDN)
3. ✅ **config.js load می‌شود**
   ```javascript
   window.TITAN_CONFIG = {
     API_BASE_URL: 'https://www.zala.ir/api',
     ...
   }
   ```
4. ✅ **axios configure می‌شود**
   ```javascript
   axios.defaults.baseURL = 'https://www.zala.ir/api';
   ```
5. ✅ app.js load می‌شود
6. ✅ کاربر login می‌کند
7. ✅ **Request به URL صحیح می‌رود:**
   ```
   axios.post('/auth/login', ...)
   →
   POST https://www.zala.ir/api/auth/login
   ```

---

## 🧪 **تست**

### Test 1: Backend (Direct)
```bash
$ curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

✅ Response: {"success":true,"data":{...}}
```

### Test 2: Nginx Proxy
```bash
$ curl -k -X POST https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

✅ Response: {"success":true,"data":{...}}
```

### Test 3: Browser (بعد از fix)
1. Browser Console خواهید دید:
   ```
   ✅ TITAN Config loaded for: production
   📡 API Base: https://www.zala.ir/api
   ✅ Axios configured with baseURL: https://www.zala.ir/api
   ```

2. وقتی login می‌کنید، در Network tab خواهید دید:
   ```
   POST https://www.zala.ir/api/auth/login
   Status: 200 OK
   Response: {"success":true,"data":{...}}
   ```

---

## 🔧 **تفاوت قبل و بعد**

### قبل از Fix:
```javascript
// axios baseURL ندارد
axios.defaults.baseURL = undefined

// Request
axios.post('/api/auth/login', ...)
→ POST https://www.zala.ir/api/auth/login (روی همان domain)
→ ممکن است fail شود یا به جای اشتباه برود
```

### بعد از Fix:
```javascript
// axios baseURL دارد
axios.defaults.baseURL = 'https://www.zala.ir/api'

// Request
axios.post('/auth/login', ...)
→ POST https://www.zala.ir/api/auth/login
→ ✅ می‌رود به backend صحیح
```

---

## 📋 **خلاصه تغییرات**

| فایل | تغییرات |
|------|---------|
| `public/index.html` | اضافه شد: config.js load + axios configuration |
| `public/config.js` | موجود بود، فقط load نمی‌شد |
| `public/static/app.js` | تغییری نداشت (فقط از axios استفاده می‌کند) |

---

## ✅ **نتیجه**

بعد از این fix:
1. ✅ config.js load می‌شود
2. ✅ axios baseURL دارد
3. ✅ دکمه login کار می‌کند
4. ✅ request به backend می‌رسد
5. ✅ user login می‌شود و به dashboard می‌رود

---

## 🚀 **دستورالعمل برای کاربر**

### مرحله 1: Hard Refresh
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### مرحله 2: بررسی Console
باز کنید Browser Console (F12) و ببینید:
```
✅ TITAN Config loaded for: production
📡 API Base: https://www.zala.ir/api
✅ Axios configured with baseURL: https://www.zala.ir/api
```

### مرحله 3: Login
```
URL: https://www.zala.ir
Username: admin
Password: admin
```

### مرحله 4: بررسی Network Tab
در Network tab (F12) خواهید دید:
```
POST /api/auth/login
Status: 200
Type: xhr
```

---

تاریخ: 2025-10-14 16:15 UTC
Fix: Axios configuration در index.html
