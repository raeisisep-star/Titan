# چک‌لیست سریع تست (Quick Test Checklist)

## 🎯 مراحل تست Frontend (قبل از پیاده‌سازی Backend)

### 1. بررسی بارگذاری فایل‌ها

در کنسول مرورگر باید این لاگ‌ها را ببینید:

```
✅ TITAN AI API module loaded
✅ TITAN AI Adapters module loaded
🔧 Applying AI Tab Integration Patches...
✅ AI Tab Integration Patches Applied Successfully
```

**اگر این لاگ‌ها را ندیدید:**
- Hard Refresh کنید: `Ctrl + Shift + R`
- Console را پاک کنید و صفحه را reload کنید
- بررسی کنید `ai-tab-integration.js` در Network tab بارگذاری شده باشد

---

### 2. تست لایه API در کنسول

```javascript
// تست Agent 1 (باید data برگرداند یا available: false)
await window.TITAN_AI_API.fetchAgentBlock(1)

// تست Agent 5 (باید available: false برگرداند)
await window.TITAN_AI_API.fetchAgentBlock(5)
```

**خروجی مورد انتظار:**
```javascript
// Agent 1:
{
  available: true,  // یا false اگر backend داده نداشته باشد
  status: {...},
  config: {...},
  history: {...}
}

// Agent 5:
{
  available: false,
  status: { available: false },
  config: { enabled: false },
  history: { items: [] }
}
```

---

### 3. تست لایه Adapter در کنسول

```javascript
// تست safe rendering
window.TITAN_AI_ADAPTERS.safeRender(undefined, 'N/A')
// Expected: "N/A"

window.TITAN_AI_ADAPTERS.safeFormatNumber(65.432, 2)
// Expected: "65.43"

window.TITAN_AI_ADAPTERS.safeFormatPercent(87.5, 1)
// Expected: "87.5%"
```

---

### 4. تست UI در بخش Settings

1. بروید به: **Settings → AI**
2. روی Agent 01-04 یا 11 کلیک کنید:
   - **نباید TypeError ببینید** ✅
   - باید یا اطلاعات نمایش داده شود یا مودال "Coming Soon"
3. روی Agent 05-10 کلیک کنید:
   - باید مودال "🚧 به زودی..." نمایش داده شود ✅
4. روی Agent 12-15 کلیک کنید:
   - باید همانند قبل کار کند (بدون تغییر) ✅

---

## 🚀 مراحل تست Backend (بعد از پیاده‌سازی)

### 1. تست با curl

```bash
# تست health check
curl http://localhost:3000/api/health

# تست Agent 5 (Not Available)
curl http://localhost:3000/api/ai/agents/5/status

# تست Agent 1 (Enhanced Mock)
curl http://localhost:3000/api/ai/agents/1/status
```

---

### 2. تست در مرورگر

```javascript
// در کنسول مرورگر
await window.TITAN_AI_API.fetchAgentBlock(5)
// Expected: {available: false, ...}

await window.TITAN_AI_API.fetchAgentBlock(1)
// Expected: {available: true, status: {...full data}}
```

---

### 3. تست UI نهایی

1. Hard Refresh: `Ctrl + Shift + R`
2. بررسی Console: نباید خطای TypeError یا 404 خام ببینید
3. کلیک روی تمام Agents:
   - **Agents 1-4, 11**: باید اطلاعات نمایش داده شود (یا Coming Soon اگر backend داده نداشته باشد)
   - **Agents 5-10**: باید مودال "Coming Soon" نمایش داده شود
   - **Agents 12-15**: کار کند مثل قبل

---

## ✅ معیارهای تأیید نهایی

### Frontend (Complete ✅)

- [ ] فایل `ai-tab-integration.js` وجود دارد (30KB)
- [ ] ترتیب بارگذاری در `index.html` صحیح است
- [ ] لاگ‌های Integration در Console نمایش داده می‌شود
- [ ] هیچ TypeError برای Agents 1-11 وجود ندارد
- [ ] مودال "Coming Soon" برای Agents 5-10 نمایش داده می‌شود
- [ ] Agents 12-15 بدون تغییر هستند

### Backend (Waiting ⏳)

- [ ] تمام 18 endpoint (3 endpoint × 6 agent) HTTP 200 برمی‌گردانند
- [ ] Agents 5-10 جواب `{available: false}` یا mock data می‌دهند
- [ ] تست‌های curl موفق هستند
- [ ] هیچ خطای 404 خام در Console نیست
- [ ] UI برای Agents 5-10 مودال "Coming Soon" نمایش می‌دهد

---

## 🐛 عیب‌یابی (Troubleshooting)

### مشکل: هنوز TypeError می‌بینم

**راه‌حل:**
1. Hard Refresh کنید: `Ctrl + Shift + R`
2. Console را پاک کنید
3. بررسی کنید لاگ‌های Integration ظاهر شده باشند
4. در Network tab بررسی کنید `ai-tab-integration.js` بارگذاری شده باشد

---

### مشکل: مودال "Coming Soon" نمایش داده نمی‌شود

**راه‌حل:**
1. بررسی کنید Backend جواب HTTP 200 برمی‌گرداند (نه 404)
2. بررسی کنید response شامل `"available": false` است
3. در کنسول تست کنید: `await window.TITAN_AI_API.fetchAgentBlock(5)`
4. Cache مرورگر را پاک کنید

---

### مشکل: لاگ‌های Integration ظاهر نمی‌شود

**راه‌حل:**
1. بررسی کنید فایل `ai-tab-integration.js` در `index.html` اضافه شده
2. بررسی کنید ترتیب صحیح است: `ai-api.js` → `ai-adapters.js` → `ai-tab-integration.js`
3. Console را Refresh کنید
4. در Network tab بررسی کنید فایل بارگذاری شده (200 OK)

---

## 📝 گزارش باگ

اگر مشکلی پیدا کردید، لطفاً اطلاعات زیر را ارائه دهید:

1. **Agent ID**: کدام agent مشکل دارد؟
2. **Console Logs**: Screenshot از Console
3. **Network Tab**: Screenshot از Network requests
4. **Steps to Reproduce**: چه کاری انجام دادید که مشکل رخ داد؟
5. **Expected vs Actual**: چه انتظاری داشتید؟ چه اتفاقی افتاد؟

---

**نکته مهم:** Frontend کامل است ✅. اگر مشکلی دیدید، احتمالاً مربوط به Backend است (Agents 5-10).
