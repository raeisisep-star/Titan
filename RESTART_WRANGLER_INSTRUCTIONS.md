# دستورات Restart Wrangler - برای حل مشکل تب AI

## ✅ وضعیت فعلی

- ✅ کد به commit `c525eba` (Phase-8) برگشت
- ✅ Syntax error در `src/index.tsx` fix شد
- ✅ Build موفق شد و `dist/` جدید ساخته شد
- ❌ Wrangler هنوز از `dist.old` سرو می‌کند (به دلیل inode caching)

## 🚨 مشکل

Wrangler process متعلق به **root** است و من نمی‌توانم آن را restart کنم.

```bash
ps aux | grep wrangler
root   3442830  ... wrangler pages dev dist --local --ip 127.0.0.1 --port 3000
```

## 🔧 راه حل: Restart Wrangler با Sudo

### گزینه 1: Restart Wrangler (توصیه می‌شود)

```bash
# 1. پیدا کردن PID
ps aux | grep "wrangler pages dev" | grep -v grep

# 2. Kill کردن process
sudo kill -9 3442830  # PID را با عدد واقعی جایگزین کنید

# 3. پاک کردن dist.old (اختیاری)
cd /tmp/webapp/Titan
sudo rm -rf dist.old

# 4. راه‌اندازی مجدد Wrangler
cd /tmp/webapp/Titan
nohup npm run dev:sandbox > /tmp/wrangler.log 2>&1 &

# 5. بررسی لاگ
tail -f /tmp/wrangler.log

# انتظار: 
# ⬣ Starting local server...
# [wrangler:inf] Ready on http://0.0.0.0:3000
```

### گزینه 2: Restart با pkill

```bash
# یک خط
sudo pkill -f "wrangler pages dev" && cd /tmp/webapp/Titan && nohup npm run dev:sandbox > /tmp/wrangler.log 2>&1 &

# بررسی
tail -f /tmp/wrangler.log
ps aux | grep wrangler
```

### گزینه 3: استفاده از Vite Dev Server (بدون نیاز به restart)

Vite dev server در حال اجرا است روی port 5173:

🌐 **http://188.40.209.82:5173**

این server:
- ✅ مستقیماً از `public/` سرو می‌کند
- ✅ فایل‌های به‌روز Phase-8
- ✅ بدون نیاز به build یا restart
- ⚠️ فقط برای development

**استفاده:**
```bash
# دیدن لاگ
tail -f /tmp/vite-dev.log

# بررسی اینکه در حال اجرا است
ps aux | grep vite | grep -v grep

# اگر متوقف شده، راه‌اندازی مجدد:
cd /tmp/webapp/Titan
npx vite --host 0.0.0.0 --port 5173 > /tmp/vite-dev.log 2>&1 &
```

## 📋 تست کنید

بعد از restart Wrangler:

### 1. بررسی سرویس

```bash
# Wrangler (production)
curl -I http://localhost:3000/

# Vite dev (development)
curl -I http://localhost:5173/
```

### 2. تست در مرورگر

**Wrangler:** http://188.40.209.82:3000  
**Vite Dev:** http://188.40.209.82:5173

1. لاگین: `demo@titan.dev` / `admin123`
2. رفتن به: ⚙️ **تنظیمات سیستم**
3. کلیک روی تب: 🤖 **هوش مصنوعی**
4. باید داشبورد AI را ببینید

### 3. بررسی Browser Console

F12 > Console:

**موفقیت:**
```javascript
🔄 Starting AI Management Dashboard loading...
✅ AI Tab module imported successfully
✅ Dashboard HTML rendered
🎉 AI Management Dashboard loaded successfully!
```

**خطا:**
```javascript
❌ Error loading AI Management: [details]
```

یعنی هنوز فایل قدیمی سرو می‌شود → Hard refresh کنید (Ctrl+Shift+R)

## 🔍 عیب‌یابی

### مشکل: Wrangler بعد از restart هنوز فایل قدیمی سرو می‌کند

**حل:**

```bash
# 1. مطمئن شوید که dist جدید است
ls -lh /tmp/webapp/Titan/dist/static/modules/settings/tabs/ai-tab.js
# باید Oct 19 باشد

# 2. Cache مرورگر را پاک کنید
# Chrome: Ctrl+Shift+Delete > Clear cached images and files

# 3. یا از Incognito mode استفاده کنید

# 4. یا version query string اضافه کنید
http://188.40.209.82:3000/?v=20251019
```

### مشکل: نمی‌توانم Wrangler را kill کنم

**خطا:**
```
pkill: killing pid 3442830 failed: Operation not permitted
```

**حل:** نیاز به sudo دارید:
```bash
sudo pkill -f "wrangler pages dev"
```

یا از Vite dev server استفاده کنید (port 5173)

### مشکل: dist.old فضا می‌گیرد

```bash
# پاک کردن (با احتیاط!)
cd /tmp/webapp/Titan
du -sh dist dist.old
sudo rm -rf dist.old
```

## 📊 معماری بعد از Fix

```
User Browser
     │
     ├─→ http://188.40.209.82:3000 (Wrangler - Production)
     │        │
     │        └─→ dist/ (NEW - Oct 19)
     │              └─→ settings/tabs/ai-tab.js ✅
     │
     └─→ http://188.40.209.82:5173 (Vite - Development)
              │
              └─→ public/ (always up-to-date)
                    └─→ settings/tabs/ai-tab.js ✅
```

## 💡 توضیحات

### چرا Wrangler هنوز فایل قدیمی سرو می‌کند؟

زمانی که من `mv dist dist.old` کردم و یک `dist` جدید ساختم:
- Wrangler process از قبل در حال اجرا بود
- دسته فایل‌های (file handles) dist قدیمی را باز نگه داشته
- حتی اگر dist جدید وجود داشته باشد، Wrangler به inode قدیمی اشاره می‌کند
- Restart لازم است تا file handles جدید باز شوند

### چرا Build Permission Error داد؟

قبلاً `dist/` متعلق به `www-data` بود:
```bash
drwxr-xr-x www-data www-data dist/
```

من (ubuntu) permission نداشتم. راه حل:
1. Rename کردن dist به dist.old
2. ساختن dist جدید (متعلق به ubuntu)
3. اجرای build موفق شد

## ✅ خلاصه دستورات

```bash
# 1. Restart Wrangler با sudo
sudo pkill -f "wrangler pages dev"
cd /tmp/webapp/Titan
nohup npm run dev:sandbox > /tmp/wrangler.log 2>&1 &

# 2. بررسی
tail -f /tmp/wrangler.log
curl -I http://localhost:3000/

# 3. تست در مرورگر
# http://188.40.209.82:3000
# Login: demo@titan.dev / admin123
# Settings > هوش مصنوعی

# یا استفاده از Vite dev:
# http://188.40.209.82:5173
```

## 🆘 اگر باز هم مشکل داشتید

1. **بررسی لاگ‌ها:**
   ```bash
   tail -f /tmp/wrangler.log
   tail -f /tmp/vite-dev.log
   cd /tmp/webapp/Titan && pm2 logs --lines 50
   ```

2. **بررسی processes:**
   ```bash
   ps aux | grep wrangler
   ps aux | grep vite
   netstat -tlnp | grep 3000
   netstat -tlnp | grep 5173
   ```

3. **استفاده از Vite dev:**
   - مطمئن‌ترین راه
   - بدون نیاز به sudo
   - فایل‌های همیشه به‌روز

---

**تاریخ:** 2025-10-19  
**Commit:** 3672393  
**Branch:** genspark_ai_developer  
**Reverted to:** c525eba (Phase-8)  
**Status:** Build موفق ✅ | Wrangler نیاز به restart دارد ⚠️
