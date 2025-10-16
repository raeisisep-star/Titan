# راهنمای رفع مشکل کش مرورگر (Browser Cache)

## ✅ وضعیت فعلی سرور

همه چیز روی سرور **کاملاً درست** است:

1. ✅ **فایل app.js** - نسخه جدید با login fix (440,428 bytes)
2. ✅ **API Backend** - کار می‌کند و token برمی‌گرداند
3. ✅ **PM2 Backend** - 2 instance آنلاین (67 دقیقه uptime)
4. ✅ **Nginx** - serve می‌کند از `/tmp/webapp/Titan/public/`

## 🔍 مشکل احتمالی: Browser Cache

اگر هنوز صفحه login را می‌بینید و نمی‌توانید login کنید، مشکل **کش مرورگر** است.

مرورگر شما هنوز **نسخه قدیمی app.js** را نگه داشته (445,563 bytes) به جای نسخه جدید (440,428 bytes).

---

## 🚀 راه حل: Hard Refresh مرورگر

### برای Chrome/Edge/Brave:
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### برای Firefox:
```
Windows/Linux: Ctrl + F5
Mac: Cmd + Shift + R
```

### برای Safari:
```
Mac: Cmd + Option + R
```

---

## 📋 مراحل دقیق:

### مرحله 1️⃣: Clear Complete Cache

#### روش A - از Developer Tools (پیشنهادی):
1. صفحه https://www.zala.ir را باز کنید
2. **F12** را بزنید (یا Right-click → Inspect)
3. به تب **Network** بروید
4. روی آیکون **Disable cache** کلیک کنید (checkbox بالای تب)
5. روی آیکون **Clear** کلیک کنید (ممکن است trash icon باشد)

#### روش B - از Settings مرورگر:
**Chrome/Edge:**
1. `Ctrl + Shift + Delete` (یا `Cmd + Shift + Delete` در Mac)
2. **Time range**: Last hour
3. فقط **Cached images and files** را تیک بزنید
4. **Clear data** را بزنید

**Firefox:**
1. `Ctrl + Shift + Delete`
2. **Time range**: Last hour
3. **Cache** را تیک بزنید
4. **Clear Now** را بزنید

### مرحله 2️⃣: Hard Refresh
صفحه https://www.zala.ir را باز کنید و:
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### مرحله 3️⃣: بررسی نسخه فایل
1. **F12** → تب **Network**
2. صفحه را refresh کنید
3. دنبال `app.js` بگردید
4. روی آن کلیک کنید
5. در تب **Headers** به **Content-Length** نگاه کنید
6. باید **440428** یا **431KB** باشد (نه 445563 یا 436KB)

---

## 🧪 تست Login

بعد از Hard Refresh:

### Test Credentials:
```
Username: admin
Password: admin
```

### انتظار:
1. کلیک روی دکمه "ورود"
2. **بدون هیچ error alert**
3. redirect به صفحه اصلی TITAN
4. نمایش Dashboard با modules

---

## 🔧 اگر هنوز کار نکرد

### روش آخر: Incognito/Private Mode
1. یک **Incognito Window** باز کنید:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
2. به https://www.zala.ir بروید
3. login کنید با admin/admin

اگر در Incognito کار کرد → **قطعاً cache بود**

---

## 📊 بررسی فنی (برای شما)

می‌توانید بررسی کنید که fix apply شده:

### در Browser Console (F12 → Console):
```javascript
// بعد از اینکه صفحه load شد:
fetch('/static/app.js')
  .then(r => r.text())
  .then(t => {
    // باید true باشد:
    console.log('Fix applied:', t.includes('response.data.data.token'));
    // باید false باشد:
    console.log('Old code exists:', t.includes('response.data.session.accessToken'));
  });
```

یا ساده‌تر:
```bash
curl -s https://www.zala.ir/static/app.js | grep -c "response.data.data.token"
```
باید **1** برگرداند (یعنی fix هست)

---

## ✅ تأیید نهایی

بعد از successful login، در Console این را تست کنید:
```javascript
// باید token را نشان دهد:
console.log(localStorage.getItem('titan_auth_token'));

// باید شروع شود با: titan_token_
```

---

## 📞 اگر مشکل ادامه داشت

اگر بعد از:
- ✅ Clear cache
- ✅ Hard refresh (Ctrl+Shift+R)
- ✅ تست در Incognito mode

هنوز login کار نمی‌کند، screenshot جدید بفرستید از:
1. صفحه login
2. **Browser Console** (F12 → Console تب)
3. **Network tab** با فیلتر `app.js`

تا ببینیم دقیقاً چه خطایی رخ می‌دهد.

---

## 🎯 خلاصه

**مشکل:** Browser cache نسخه قدیمی app.js (436KB) را نگه داشته

**راه حل:** Hard refresh با `Ctrl + Shift + R`

**نتیجه انتظاری:** Login با admin/admin کار کند و به Dashboard برود

---

تاریخ: 2025-10-14 14:48 UTC
Server: www.zala.ir (188.40.209.82)
Backend: server-full-apis.js (2 instances via PM2)
