# 🔥 راهنمای پاک‌سازی کش Cloudflare (حیاتی!)

## 🎯 وضعیت فعلی

**✅ تایید شده:**
- Backend روی پورت 5000 کار می‌کند
- Nginx به درستی proxy می‌کند
- `/api/health` و `/api/auth/login` از سرور کار می‌کنند
- `config.js` در سرور اصلاح شده است

**❌ مشکل:**
- Cloudflare CDN همچنان فایل‌های قدیمی را کش کرده
- مرورگر کاربر `config.js` قدیمی (با API_BASE خالی) را دریافت می‌کند

## 🚨 راه‌حل: Purge کامل Cache

### روش 1: Purge از Dashboard (توصیه می‌شود)

#### مرحله 1: ورود به Cloudflare
1. به آدرس https://dash.cloudflare.com بروید
2. با اکانت خود وارد شوید
3. سایت `zala.ir` را انتخاب کنید

#### مرحله 2: رفتن به بخش Caching
1. از منوی سمت چپ، روی **"Caching"** کلیک کنید
2. تب **"Configuration"** را انتخاب کنید
3. پایین بیایید تا بخش **"Purge Cache"** را ببینید

#### مرحله 3: Purge Everything (سریع‌ترین راه)
1. روی دکمه **"Purge Everything"** کلیک کنید
2. پاپ‌آپ تاییدیه باز می‌شود
3. روی **"Purge Everything"** دوباره کلیک کنید برای تایید
4. **صبر کنید 30 ثانیه** تا purge کامل شود

⚠️ **توجه:** این کار **تمام cache** سایت را پاک می‌کند. برای چند دقیقه سرعت سایت کمی کاهش می‌یابد ولی بعد به حالت عادی برمی‌گردد.

#### آلترناتیو: Custom Purge (انتخابی)
اگر فقط می‌خواهید فایل‌های خاص را purge کنید:

1. روی **"Custom Purge"** کلیک کنید
2. تب **"Purge by URL"** را انتخاب کنید
3. این URLها را وارد کنید (هر خط یک URL):
   ```
   https://www.zala.ir/config.js
   https://www.zala.ir/index.html
   https://www.zala.ir/static/app.js
   https://www.zala.ir/static/modules/ai-management.js
   ```
4. روی **"Purge"** کلیک کنید

### روش 2: Purge با API (برای متخصصین)

اگر به API Token Cloudflare دسترسی دارید:

```bash
# نیاز به Zone ID و API Token
ZONE_ID="your_zone_id"
API_TOKEN="your_cloudflare_api_token"

# Purge Everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# یا Purge فایل‌های خاص
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://www.zala.ir/config.js",
      "https://www.zala.ir/index.html",
      "https://www.zala.ir/static/app.js"
    ]
  }'
```

## ✅ تایید موفقیت

### مرحله 1: بررسی Headers
بعد از purge، این دستور را اجرا کنید:

```bash
curl -I https://www.zala.ir/config.js
```

باید ببینید:
```
cf-cache-status: MISS    # اولین بار بعد از purge
# یا
cf-cache-status: DYNAMIC  # اگر cache bypass باشد
```

### مرحله 2: تست از مرورگر

1. مرورگر را کاملاً ببندید (تمام تب‌ها)
2. مرورگر را دوباره باز کنید
3. از **Incognito/Private mode** استفاده کنید
4. به `https://www.zala.ir` بروید
5. کنسول (F12) را باز کنید
6. باید ببینید:
   ```javascript
   📡 API Base: /api    ✅ (دیگر خالی نیست!)
   ```

### مرحله 3: تست Login
1. نام کاربری: `admin`
2. رمز عبور: `test` (یا هر رمز دیگری)
3. روی "ورود به سیستم" کلیک کنید
4. باید **بدون 404** وارد شوید

## 🔄 اگر همچنان کار نکرد

### Troubleshooting گام به گام

#### 1. بررسی Cache Status
```bash
curl -I https://www.zala.ir/config.js | grep -i cache
```

اگر دیدید `cf-cache-status: HIT` یعنی هنوز کش شده است.

**راه‌حل:** Purge را دوباره انجام دهید و این بار **Purge Everything** را انتخاب کنید.

#### 2. بررسی Browser Cache
در مرورگر:
- **Chrome/Edge:** `Ctrl + Shift + Delete` → Clear all
- **Firefox:** `Ctrl + Shift + Delete` → Clear all
- یا **Incognito Mode** استفاده کنید

#### 3. Hard Refresh
در صفحه `https://www.zala.ir`:
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

#### 4. بررسی Cloudflare Page Rules
اگر Page Rule برای `/config.js` یا `/*` دارید که Cache Level را روی Standard یا Aggressive گذاشته:

1. به **Rules** → **Page Rules** بروید
2. اگر rule برای `*.zala.ir/*` وجود دارد:
   - Cache Level را روی **Bypass** تغییر دهید برای `/config.js`
   - یا یک rule جدید اضافه کنید:
     - URL: `*zala.ir/config.js`
     - Setting: **Cache Level** = **Bypass**

#### 5. بررسی Browser DevTools Network
1. F12 → Network tab
2. صفحه را reload کنید
3. روی `config.js` کلیک کنید
4. تب **Headers** را ببینید
5. چک کنید:
   ```
   cf-cache-status: MISS یا DYNAMIC  ✅
   # اگر HIT بود، یعنی هنوز از cache می‌آید ❌
   ```

## 📊 Check List نهایی

- [ ] Cloudflare cache purge انجام شد (Purge Everything)
- [ ] 30 ثانیه صبر کردم
- [ ] مرورگر را کاملاً بستم و دوباره باز کردم
- [ ] Incognito mode استفاده کردم
- [ ] در کنسول `📡 API Base: /api` را می‌بینم (نه خالی)
- [ ] Login بدون 404 کار می‌کند

## 🆘 در صورت نیاز به کمک

اگر بعد از انجام **تمام** مراحل بالا همچنان مشکل دارید:

1. Screenshot از **Console** (F12 → Console)
2. Screenshot از **Network tab** برای `config.js` request
3. Output این دستور را ارسال کنید:
   ```bash
   curl -I https://www.zala.ir/config.js
   ```
4. تاییدیه Cloudflare purge (screenshot از success message)

---

**تاریخ:** 2025-11-08  
**اولویت:** 🔴 حیاتی  
**زمان تخمینی:** 5 دقیقه  
**پیچیدگی:** آسان
