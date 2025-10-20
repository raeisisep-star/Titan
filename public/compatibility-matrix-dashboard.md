# 📊 Dashboard API Compatibility Matrix

**تاریخ ایجاد**: 2025-10-17  
**نسخه**: 1.0.0  
**صفحه**: Dashboard  
**ماژول**: `public/static/modules/dashboard.js`

---

## 🔍 خلاصه کشف (Discovery Summary)

| معیار | تعداد | وضعیت |
|-------|-------|-------|
| کل Endpoints شناسایی شده | 10 | - |
| Endpoints موجود (200) | ؟ | 🟡 نیاز به تست |
| Endpoints احراز هویت لازم (401/403) | ؟ | 🟡 نیاز به تست |
| Endpoints یافت نشده (404) | ؟ | 🟡 نیاز به تست |
| Endpoints نیاز به ساخت | ؟ | 🟡 نیاز به بررسی |

---

## 📋 جدول کامل Endpoints

### 1️⃣ Dashboard Comprehensive Endpoints

| FE Module | Endpoint | Method | Auth | Status | Content-Type | Response Keys | Schema Match | Action |
|-----------|----------|--------|------|--------|--------------|---------------|--------------|--------|
| dashboard.js | `/api/dashboard/comprehensive-real` | GET | ❌ No | 🟡 تست نشده | - | - | - | نیاز به تست |
| dashboard.js | `/api/dashboard/comprehensive` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست |
| dashboard.js | `/api/dashboard/comprehensive-dev` | GET | ❌ No | 🟡 تست نشده | - | - | - | نیاز به تست |
| dashboard.js | `/api/dashboard/overview` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست |

### 2️⃣ Individual Data Endpoints (برای Adapters)

| FE Module | Endpoint | Method | Auth | Status | Content-Type | Response Keys | Schema Match | Action |
|-----------|----------|--------|------|--------|--------------|---------------|--------------|--------|
| balance.adapter.js | `/api/user/balance` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |
| market.adapter.js | `/api/market/prices` | GET | ❌ No | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |
| market.adapter.js | `/api/market/fear-greed` | GET | ❌ No | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |
| activeTrades.adapter.js | `/api/trades/active` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |
| activeTrades.adapter.js | `/api/trades/stats` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |
| dashboard.js | `/api/ai-analytics/agents` | GET | ✅ Yes | 🟡 تست نشده | - | - | - | نیاز به تست یا ساخت |

---

## 🎯 قراردادهای مورد انتظار (Expected Contracts)

### 1. Balance Endpoint
```json
// GET /api/user/balance
{
  "success": true,
  "data": {
    "totalBalance": 125000,
    "availableBalance": 120000,
    "lockedBalance": 5000,
    "dailyChange": 2.3,
    "dailyChangeAmount": 2875,
    "weeklyChange": 8.5,
    "monthlyChange": 15.2,
    "currency": "USDT"
  }
}
```

### 2. Market Prices Endpoint
```json
// GET /api/market/prices?symbols=BTCUSDT,ETHUSDT
{
  "success": true,
  "data": {
    "prices": [
      {
        "symbol": "BTCUSDT",
        "price": 43250.50,
        "priceChangePercent": 2.35
      },
      {
        "symbol": "ETHUSDT",
        "price": 2680.75,
        "priceChangePercent": 3.12
      }
    ],
    "fearGreedIndex": 65,
    "btcDominance": 51.2
  }
}
```

### 3. Active Trades Endpoint
```json
// GET /api/trades/active
{
  "success": true,
  "data": {
    "activeTrades": 8,
    "todayTrades": 15,
    "pendingOrders": 5,
    "totalVolume24h": 85000,
    "trades": [
      {
        "id": "1",
        "symbol": "BTCUSDT",
        "side": "BUY",
        "price": 43250,
        "amount": 0.5,
        "filled": 0.3,
        "status": "PARTIALLY_FILLED"
      }
    ]
  }
}
```

### 4. Comprehensive Dashboard Endpoint
```json
// GET /api/dashboard/comprehensive-real
{
  "success": true,
  "data": {
    "portfolio": { /* ... */ },
    "aiAgents": [ /* ... */ ],
    "market": { /* ... */ },
    "trading": { /* ... */ },
    "risk": { /* ... */ },
    "learning": { /* ... */ },
    "activities": [ /* ... */ ],
    "summary": { /* ... */ },
    "charts": { /* ... */ }
  }
}
```

---

## 🔧 Adapter Strategy

### Strategy 1: Comprehensive Endpoint (اولویت بالا)
- تلاش برای دریافت تمام داده از یک endpoint: `/api/dashboard/comprehensive-real`
- مزیت: کمترین تعداد request
- معایب: اگر قسمتی fail شود، کل داده در دسترس نیست

### Strategy 2: Individual Adapters (اولویت متوسط)
- استفاده از چندین endpoint جداگانه
- مزیت: Failure isolation - اگر یکی fail شد، بقیه کار می‌کنند
- معایب: تعداد request بیشتر

### Strategy 3: Mock Fallback (اولویت پایین)
- استفاده از داده mock در صورت عدم دسترسی به API
- فعال با flag: `USE_MOCK=true`

---

## ✅ Adapter Implementation Status

| Adapter | فایل | وضعیت | Fallback |
|---------|------|-------|----------|
| Balance | `balance.adapter.js` | ✅ ساخته شده | ✅ دارد |
| Market | `market.adapter.js` | ✅ ساخته شده | ✅ دارد |
| Active Trades | `activeTrades.adapter.js` | ✅ ساخته شده | ✅ دارد |
| Comprehensive | `comprehensive.adapter.js` | ✅ ساخته شده | ✅ دارد |

---

## 🚀 مراحل بعدی (Next Steps)

### 1. تست Endpoints (مرحله 4)
```bash
# اجرای اسکریپت probe در کنسول مرورگر
# فایل: public/static/scripts/probe-dashboard.js
```

### 2. بررسی Backend
- بررسی `server-real-v3.js` برای endpoints موجود
- شناسایی endpoints مفقود
- تصمیم‌گیری: ساخت endpoints جدید یا استفاده از موجود

### 3. Refactor Dashboard Module
- تغییر `dashboard.js` برای استفاده از adapters
- حذف mock inline
- فعال‌سازی flag-based switching

### 4. Integration Testing
- تست با `USE_MOCK=false`
- تست با `USE_MOCK=true`
- تست حالت partial failure
- تست timeout و retry

---

## 📝 یادداشت‌های مهم

### ⚠️ نکات برای Backend
1. تمام endpoints باید ساختار `{success: boolean, data: any}` داشته باشند
2. خطاها باید با status code مناسب برگردانده شوند (401, 404, 500, ...)
3. CORS برای `/api/*` باید تنظیم شود
4. Rate limiting در نظر گرفته شود

### ⚠️ نکات برای Frontend
1. همیشه fallback به mock در صورت خطا
2. timeout 8 ثانیه برای requests
3. retry فقط برای 502/503
4. error handling با پیام کاربرپسند

---

## 📊 نتایج Probe Script

**این بخش پس از اجرای probe script به‌روزرسانی می‌شود.**

```
// نتایج اجرای probe-dashboard.js اینجا قرار می‌گیرد
```

---

**آخرین به‌روزرسانی**: 2025-10-17  
**وضعیت کلی**: 🟡 در حال پیاده‌سازی  
**مرحله فعلی**: Adapter Implementation (مرحله 2/3 تکمیل شده)
