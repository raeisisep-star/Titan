# ✅ چک‌لیست تست سریع - AI Agents

## 🔄 مرحله 1: Hard Refresh
```
Ctrl + Shift + R
```

## 👀 مرحله 2: بررسی Console
باید این پیام‌ها را ببینی:

```
✅ TITAN AI API module loaded
✅ TITAN AI Adapters module loaded
🔧 Applying AI Tab Integration Patches...
✅ AI Tab Integration Patches Applied Successfully
```

## 🧪 مرحله 3: تست Console
```javascript
// Test Agent 1 (موجود)
await window.TITAN_AI_API.fetchAgentBlock(1)
// Output: {available: true, status: {...}, config: {...}, history: [...]}

// Test Agent 5 (ناموجود)
await window.TITAN_AI_API.fetchAgentBlock(5)
// Output: {available: false, installed: false, ...}
```

## 🎨 مرحله 4: تست UI در Settings → AI

### Agents 1-4 & 11 (باید کار کنند)
- کلیک روی کارت ایجنت
- مودال جزئیات باز می‌شود
- اگر داده نیست → "N/A" نمایش داده می‌شود
- **هیچ TypeError رخ نمی‌دهد** ✅

### Agents 5-10 (باید Coming Soon نمایش دهند)
- کلیک روی کارت ایجنت
- مودال "🚧 Coming Soon" باز می‌شود
- **هیچ 404 Error نمایش داده نمی‌شود** ✅

### Agents 12-15 (باید مثل قبل کار کنند)
- بدون تغییر

---

## ❌ اگر مشکلی دیدی

### مشکل: ماژول‌ها لود نمی‌شوند
**راه‌حل:**
```bash
# بررسی فایل وجود دارد؟
ls -la /tmp/webapp/Titan/public/static/modules/ai-tab-integration.js

# بررسی index.html
grep "ai-tab-integration" /tmp/webapp/Titan/public/index.html
```

### مشکل: Cache Cloudflare
**راه‌حل:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/3c505016a08fe34d41fd791da81e8a39/purge_cache" \
  -H "Authorization: Bearer firZ1bmoNKT1itQIsggnlDkOr8EV2LTPBiQv441y" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### مشکل: هنوز TypeError می‌بینم
**بررسی Console:** آیا این پیام را می‌بینی؟
```
✅ AI Tab Integration Patches Applied Successfully
```

اگر **نه** → refresh کن و دوباره چک کن  
اگر **بله** → بفرست screenshot از TypeError

---

## 📊 نتیجهٔ انتظاری

| وضعیت | قبل | بعد |
|-------|-----|-----|
| Console | پر از 404 و TypeError | ✅ تمیز |
| Agents 1-4, 11 | TypeError | ✅ Placeholder |
| Agents 5-10 | 404 Error | ✅ Coming Soon |
| Agents 12-15 | کار می‌کردند | ✅ همچنان کار می‌کنند |

---

## 💚 اگر همه چیز OK بود

**کامیت:**  `7b8fcb0`  
**برنچ:**   `feature/phase4-ssl-full-strict`  
**فایل‌ها:** 
- `/public/static/modules/ai-tab-integration.js` (جدید)
- `/public/index.html` (به‌روزرسانی شده)

**کار Frontend تمام است!** 🎉

تیم Backend باید endpoint های `/api/ai/agents/{5-10}/{status|config|history}` را اضافه کند.
