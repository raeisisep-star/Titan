# 🔍 چک‌لیست دیباگ - لطفاً این مراحل را انجام دهید

## مرحله 1️⃣: پاک کردن کامل کش مرورگر

### Chrome/Edge:
1. `Ctrl + Shift + Delete`
2. انتخاب: **"All time"** (همه زمان‌ها)
3. فقط تیک بزنید: **"Cached images and files"**
4. کلیک: **Clear data**
5. **بستن کامل مرورگر** (تمام تب‌ها)
6. باز کردن مجدد

### Firefox:
1. `Ctrl + Shift + Delete`
2. Time range: **"Everything"**
3. فقط تیک: **"Cache"**
4. کلیک: **Clear Now**
5. **بستن کامل Firefox**
6. باز کردن مجدد

---

## مرحله 2️⃣: تست در حالت Incognito (حتماً!)

1. باز کردن **پنجره جدید Incognito/Private**:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`

2. رفتن به: `https://www.zala.ir/`

3. لاگین کردن

4. **F12** برای باز کردن DevTools

5. رفتن به تب **Console**

6. بررسی کنید **error قرمز رنگ** هست؟

---

## مرحله 3️⃣: بررسی Network Tab

در DevTools:

1. رفتن به تب **Network**

2. **رفرش صفحه**: `Ctrl + Shift + R`

3. پیدا کردن فایل: `logs.js`

4. **اسکرین‌شات بگیرید** و بفرستید!

چک کنید:
- ✅ Status Code: باید `200` باشد
- ✅ Size: باید حدود `21 KB` باشد
- ✅ URL باید باشد: `/static/modules/logs.js?v=202511021336`

---

## مرحله 4️⃣: بررسی Console برای errors

در تب Console:

1. فیلتر کنید: فقط **Errors** (قرمز)

2. اگر error هست، **کپی متن کامل** و بفرستید

3. یا **اسکرین‌شات** بگیرید

---

## مرحله 5️⃣: بررسی Settings → System

1. کلیک روی **"تنظیمات"** در منوی بالا

2. انتخاب تب **"سیستم"** (System)

3. اسکرول به پایین

4. **اسکرین‌شات کامل** از صفحه بگیرید

سوالات:
- ❓ بخش "📋 لاگ‌های سیستم" را می‌بینید؟
- ❓ 5 لاگ آخر نمایش داده می‌شود؟
- ❓ دکمه "مشاهده کامل" هست؟
- ❓ اگر دکمه را بزنید چه اتفاقی می‌افتد؟

---

## مرحله 6️⃣: تست Manual در Console

در Console این دستور را بزنید:

```javascript
// تست 1: آیا ماژول logs بارگذاری شده؟
console.log('LogsModule exists?', typeof LogsModule !== 'undefined');

// تست 2: آیا در TitanModules ثبت شده؟
console.log('TitanModules.logs?', typeof TitanModules !== 'undefined' && TitanModules.logs);

// تست 3: آیا module-loader آن را می‌شناسد؟
console.log('Module class map:', typeof window.moduleLoader !== 'undefined' ? window.moduleLoader.moduleClassMap : 'moduleLoader not found');

// تست 4: تست manual لود کردن
if (typeof app !== 'undefined' && typeof app.loadModule === 'function') {
    console.log('Trying to load logs module...');
    app.loadModule('logs');
} else {
    console.log('app.loadModule not available');
}
```

**کپی کامل خروجی** و بفرستید!

---

## مرحله 7️⃣: چک کردن که کدام فایل‌ها لود شدند

در Console:

```javascript
// لیست تمام script tags
Array.from(document.querySelectorAll('script[src]'))
    .map(s => s.src)
    .filter(src => src.includes('modules') || src.includes('app.js'))
    .forEach(src => console.log(src));
```

**کپی خروجی** و بفرستید!

---

## مرحله 8️⃣: بررسی Settings Module

در Console:

```javascript
// آیا settingsModule موجود است؟
console.log('settingsModule exists?', typeof settingsModule !== 'undefined');

// آیا متد openFullLogsViewer دارد؟
if (typeof settingsModule !== 'undefined') {
    console.log('Has openFullLogsViewer?', typeof settingsModule.openFullLogsViewer === 'function');
    console.log('Has loadSystemLogsPreview?', typeof settingsModule.loadSystemLogsPreview === 'function');
}
```

---

## مرحله 9️⃣: بررسی HTML Element

در Console:

```javascript
// آیا المنت لاگ‌ها در DOM هست؟
const logsSection = document.querySelector('#system-logs-preview');
console.log('Logs section exists?', logsSection !== null);

if (logsSection) {
    console.log('Logs section HTML:', logsSection.parentElement.outerHTML);
} else {
    console.log('Looking for any element with "logs" or "لاگ"...');
    const allText = document.body.innerText;
    console.log('Page contains "لاگ"?', allText.includes('لاگ'));
    console.log('Page contains "System Logs"?', allText.includes('System Logs'));
}
```

---

## 🎯 خلاصه: چه چیزهایی نیاز دارم؟

لطفاً برایم بفرستید:

1. ✅ **اسکرین‌شات از صفحه Settings → System** (تمام صفحه)
2. ✅ **اسکرین‌شات از DevTools → Console** (تمام errors)
3. ✅ **اسکرین‌شات از DevTools → Network** (فیلتر: logs.js)
4. ✅ **کپی متن خروجی تست‌های Console** (مراحل 6، 7، 8، 9)
5. ✅ **توضیح دقیق**: شما چه چیزی انتظار داشتید ببینید و چی می‌بینید؟

---

## 💡 نکات مهم:

- 🔴 **حتماً Incognito** استفاده کنید
- 🔴 **Hard refresh** انجام دهید (`Ctrl + Shift + R`)
- 🔴 **DevTools باز** باشد هنگام تست
- 🔴 **لاگین** کرده باشید

---

بعد از انجام این مراحل، دقیقاً می‌فهمم مشکل کجاست! 🎯
