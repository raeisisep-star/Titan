# راهنمای ساخت و استقرار - Build & Deploy Guide

## 🔴 مشکل فعلی | Current Issue

تب AI در تنظیمات قابل دسترسی نیست زیرا:

**The AI tab in Settings is not accessible because:**

1. ✅ فایل‌های جدید در `public/` آپدیت شده‌اند
2. ❌ اما `dist/` که Wrangler از آن سرو می‌کند قدیمی است
3. ❌ Build موفق نیست به دلیل مشکلات permission

---

## ✅ حل شده | Fixed Issues

### 1. Syntax Error در `src/index.tsx`
**Status:** ✅ **FIXED** in commit `0ba8352`

خط 217 که باعث شکست build می‌شد، اصلاح شد.

**Before:**
```javascript
if ((body.username === 'demo' && body.password === 'demo123') ||
  const user = {  ((body.email === 'demo@titan.dev' && ...)) {
```

**After:**
```javascript
if ((body.username === 'demo' && body.password === 'demo123') ||
    ((body.email === 'demo@titan.dev' || body.email === 'admin@titan.com') 
     && body.password === 'admin123')) {
  const user = {
```

---

## 🚀 راه حل | Solution Steps

### گزینه 1: Build با دسترسی Sudo (توصیه می‌شود)

```bash
# 1. رفتن به فولدر پروژه
cd /tmp/webapp/Titan

# 2. تغییر مالکیت فولدر dist
sudo chown -R ubuntu:ubuntu dist/

# 3. اجرای build
npm run build

# 4. بررسی موفقیت
ls -lh dist/static/modules/settings/tabs/ai-tab.js
# باید تاریخ امروز را نشان دهد

# 5. Wrangler به صورت خودکار فایل‌های جدید را سرو می‌کند
# نیازی به restart نیست
```

### گزینه 2: Restart کامل سرویس‌ها

```bash
# 1. توقف Wrangler
sudo pkill -f "wrangler pages dev"

# 2. تغییر مالکیت و build
cd /tmp/webapp/Titan
sudo chown -R ubuntu:ubuntu dist/
npm run build

# 3. راه‌اندازی مجدد Wrangler
nohup npm run dev:sandbox > /tmp/wrangler.log 2>&1 &

# 4. بررسی لاگ
tail -f /tmp/wrangler.log
```

### گزینه 3: استفاده از Vite Dev Server (موقت)

من یک Vite dev server راه‌اندازی کرده‌ام که مستقیماً از `public/` سرو می‌کند:

🌐 **URL:** `http://188.40.209.82:5173`

این سرور:
- ✅ فایل‌های به‌روز از `public/` را سرو می‌کند
- ✅ هیچ build ای لازم ندارد
- ✅ تغییرات به صورت لحظه‌ای اعمال می‌شوند
- ⚠️ فقط برای توسعه و تست است (نه production)

**استفاده:**
1. مرورگر را باز کنید
2. به `http://188.40.209.82:5173` بروید  
3. وارد شوید (demo@titan.dev / admin123)
4. به تنظیمات بروید
5. تب "هوش مصنوعی" یا "مدیریت AI" را کلیک کنید

---

## 📋 تأیید موفقیت | Verify Success

### 1. بررسی تاریخ فایل‌ها

```bash
cd /tmp/webapp/Titan

# فایل public (جدید)
ls -lh public/static/modules/settings/tabs/ai-tab.js
# Expected: Oct 18, 1.1M

# فایل dist (باید پس از build آپدیت شود)
ls -lh dist/static/modules/settings/tabs/ai-tab.js
# Should match public file date after successful build
```

### 2. تست در مرورگر

1. باز کردن: http://188.40.209.82:3000 (Wrangler production)
2. یا: http://188.40.209.82:5173 (Vite dev - updated files)
3. لاگین: `demo@titan.dev` / `admin123`
4. رفتن به: ⚙️ **تنظیمات سیستم**
5. کلیک روی تب: 🤖 **هوش مصنوعی** یا **مدیریت AI**
6. انتظار:
   - ✅ لودینگ spinner ظاهر شود
   - ✅ داشبورد Artemis با 13 agent card نمایش داده شود
   - ✅ کلیک روی هر agent، پنل تخصصی آن را باز کند

### 3. بررسی Console Log

در مرورگر F12 را بزنید و Console را باز کنید. باید این لاگ‌ها را ببینید:

```javascript
🔄 Starting AI Management Dashboard loading...
✅ AI Tab module imported successfully
✅ AI Tab instance created
✅ Global references set
✅ Dashboard HTML rendered
✅ Dashboard initialized
🎉 AI Management Dashboard loaded successfully!
```

اگر خطا ببینید:
```javascript
❌ Error loading AI Management: [error details]
```

یعنی فایل ai-tab.js هنوز قدیمی است یا مشکلی در module loading وجود دارد.

---

## 🔧 عیب‌یابی | Troubleshooting

### مشکل: Build با خطای Permission متوقف می‌شود

```bash
error during build:
EACCES: permission denied, copyfile '/tmp/webapp/Titan/public/...' -> '/tmp/webapp/Titan/dist/...'
```

**حل:**
```bash
sudo chown -R ubuntu:ubuntu /tmp/webapp/Titan/dist/
# یا
sudo chown -R $(whoami):$(whoami) /tmp/webapp/Titan/dist/
```

### مشکل: Wrangler فایل‌های قدیمی سرو می‌کند

**حل:**
```bash
# Hard refresh در مرورگر
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)

# یا پاک کردن cache
در DevTools (F12) > Network > Disable cache را فعال کنید
```

### مشکل: تب AI همچنان "در دسترس نیست"

**بررسی‌ها:**

1. **فایل ai-tab.js در dist آپدیت شده؟**
   ```bash
   ls -lh dist/static/modules/settings/tabs/ai-tab.js
   stat dist/static/modules/settings/tabs/ai-tab.js
   ```

2. **Wrangler در حال اجرا است؟**
   ```bash
   ps aux | grep wrangler
   netstat -tlnp | grep 3000
   ```

3. **لاگ‌های Wrangler چه می‌گویند؟**
   ```bash
   # پیدا کردن process ID
   ps aux | grep wrangler | grep -v grep
   
   # دیدن لاگ‌ها
   tail -f /tmp/wrangler.log  # اگر با nohup اجرا کردید
   ```

4. **Browser console خطا دارد؟**
   - F12 > Console
   - به دنبال خطاهای قرمز بگردید
   - خطاهای مربوط به "Failed to fetch" یا "Module not found"

### مشکل: Build موفق شد اما تغییری نمی‌بینم

**علت محتمل:** Browser cache

**حل:**
```bash
# 1. پاک کردن cache مرورگر به صورت کامل
# Chrome/Edge: Settings > Privacy > Clear browsing data > Cached images and files

# 2. یا استفاده از Incognito/Private mode

# 3. یا اضافه کردن version query string
http://188.40.209.82:3000/?v=123456
```

---

## 📊 معماری فعلی | Current Architecture

```
┌─────────────────────────────────────────────────┐
│  User Browser                                   │
│  (http://188.40.209.82:3000 or :5173)          │
└────────────────┬────────────────────────────────┘
                 │
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐         ┌──────────────┐
│  Wrangler   │         │  Vite Dev    │
│  Port 3000  │         │  Port 5173   │
│             │         │              │
│  Serves:    │         │  Serves:     │
│  dist/      │         │  public/     │
│  (OLD ❌)   │         │  (NEW ✅)    │
└─────────────┘         └──────────────┘
      │                       │
      │                       │
      │                       ▼
      │                 ┌──────────────────┐
      │                 │ settings.js      │
      │                 │ ai-tab.js (1.1M) │
      │                 │ 13 agent panels  │
      │                 └──────────────────┘
      │
      ▼
┌───────────────────────┐
│ settings.js (old)     │
│ ai-tab.js (866K)      │
│ Missing agent panels  │
└───────────────────────┘

┌─────────────────────────────────────────────────┐
│  Backend (PM2)                                  │
│  Port 4000                                      │
│  Hono + PostgreSQL + Redis                      │
│  (No changes needed)                            │
└─────────────────────────────────────────────────┘
```

**هدف:** dist/ را آپدیت کنیم تا با public/ همخوان شود

---

## 🎯 وضعیت Commit‌ها | Commit Status

### آخرین Commit: `0ba8352`

```bash
git log --oneline -3

0ba8352 fix(auth): resolve syntax error in login authentication logic
3dfb762 feat(artemis-ai): implement all 13 specialized agent panels
eff912d Merge pull request #3
```

### فایل‌های تغییر یافته

```bash
git show --stat

 src/index.tsx | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)
```

### برای Pull کردن تغییرات جدید

```bash
cd /tmp/webapp/Titan
git fetch origin genspark_ai_developer
git pull origin genspark_ai_developer
```

---

## 💡 نکات مهم | Important Notes

### 1. چرا نمی‌توانم مستقیماً فایل‌ها را کپی کنم؟

فولدر `dist/` متعلق به user `www-data` است:
```bash
ls -la dist/
drwxr-xr-x 5 www-data www-data ...
```

من (ubuntu) permission نوشتن ندارم. نیاز به:
- `sudo` برای تغییر ownership
- یا `sudo` برای کپی مستقیم

### 2. چرا Build با خطای Permission fail می‌شود؟

Vite می‌خواهد فایل‌های public را به dist کپی کند اما:
```
EACCES: permission denied, copyfile 
'/tmp/webapp/Titan/public/artemis.html' -> 
'/tmp/webapp/Titan/dist/artemis.html'
```

فقط www-data می‌تواند به dist بنویسد.

### 3. آیا می‌توانم بدون Build کار کنم؟

**بله!** از Vite dev server استفاده کنید:
- Port: 5173
- URL: http://188.40.209.82:5173
- Serves directly from `public/` (no build needed)
- Hot reload enabled

**اما:** فقط برای development، نه production.

### 4. بعد از Build چه اتفاقی می‌افتد؟

1. Vite فایل‌های `public/` را به `dist/` کپی می‌کند
2. Wrangler به صورت خودکار تغییرات را detect می‌کند
3. فایل‌های جدید سرو می‌شوند
4. Browser ممکن است cache داشته باشد → Hard refresh کنید

---

## ✅ چک‌لیست نهایی | Final Checklist

قبل از استفاده از سیستم، این موارد را بررسی کنید:

- [ ] Syntax error در `src/index.tsx` fix شده؟ → Check commit `0ba8352`
- [ ] Permission فولدر dist درست شده؟ → `sudo chown -R ubuntu:ubuntu dist/`
- [ ] Build موفق اجرا شده؟ → `npm run build`
- [ ] تاریخ فایل dist با public match می‌کند؟ → `ls -lh dist/... public/...`
- [ ] Wrangler در حال اجرا است؟ → `ps aux | grep wrangler`
- [ ] Browser cache پاک شده؟ → Hard refresh یا Incognito
- [ ] تب AI قابل دسترسی است؟ → Settings > هوش مصنوعی
- [ ] 13 agent card نمایش داده می‌شود؟ → داشبورد Artemis
- [ ] کلیک روی agent، پنل باز می‌شود؟ → Agent details modal

---

## 🆘 نیاز به کمک؟ | Need Help?

اگر هنوز مشکل دارید:

### گزینه A: استفاده از Vite Dev Server

```bash
# این server الان در حال اجرا است
http://188.40.209.82:5173

# برای دیدن لاگ
tail -f /tmp/vite-dev.log
```

### گزینه B: بررسی دقیق مشکل

```bash
# 1. Status check
cd /tmp/webapp/Titan
./check-status.sh  # اگر وجود دارد

# 2. دستی
ps aux | grep wrangler
ps aux | grep vite
ls -lh dist/static/modules/settings/tabs/
git status
git log --oneline -5
```

### گزینه C: Rebuild کامل

```bash
cd /tmp/webapp/Titan

# 1. Clean
sudo rm -rf dist/
mkdir dist

# 2. Ownership
sudo chown -R ubuntu:ubuntu dist/

# 3. Build
npm run build

# 4. Verify
ls -la dist/
```

---

## 📝 خلاصه | Summary

**مشکل:** تب AI در تنظیمات قابل دسترسی نیست

**علت ریشه‌ای:**
1. فایل‌های جدید (با agent panels) در `public/` هستند
2. اما Wrangler از `dist/` سرو می‌کند که قدیمی است
3. Build به دلیل syntax error و permission issue موفق نبود

**حل‌های اعمال شده:**
- ✅ Syntax error fixed (commit 0ba8352)
- ✅ کد به commit قبل reset شد (3dfb762)
- ✅ Vite dev server راه‌اندازی شد (port 5173)

**اقدام لازم:**
```bash
sudo chown -R ubuntu:ubuntu /tmp/webapp/Titan/dist/
cd /tmp/webapp/Titan && npm run build
```

یا استفاده از:
🌐 **http://188.40.209.82:5173** (فایل‌های به‌روز)

---

**تاریخ:** 2025-10-18  
**Commit:** 0ba8352  
**Branch:** genspark_ai_developer  
**PR:** https://github.com/raeisisep-star/Titan/pull/4
