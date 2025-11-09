# 🔧 راهنمای یکپارچه‌سازی Backend

## 📋 خلاصه

Frontend آماده است و منتظر این endpoint ها:

```
GET /api/ai/agents/{5-10}/status
GET /api/ai/agents/{5-10}/config
GET /api/ai/agents/{5-10}/history
```

## 🚀 روش‌های پیاده‌سازی

### روش 1️⃣: استفاده از فایل Mock (سریع)

فایل `backend-ai-agents-mock.js` آماده است.

#### A. استفاده Standalone

```bash
# نصب dependencies (اگر ندارید)
npm install express

# اجرا
node backend-ai-agents-mock.js

# خروجی:
# ✅ AI Agents Mock Server running on port 3000
# 📊 Mock routes:
#    - Agents 5-10: /api/ai/agents/{5-10}/{status|config|history}
#    - Agents 1-4, 11: Enhanced data available
#    - Health check: /api/health
```

#### B. ادغام در Server موجود

```javascript
// server.js یا app.js
const express = require('express');
const app = express();

// ... سایر middleware ها

// ادغام mock routes
const aiAgentsMock = require('./backend-ai-agents-mock');
app.use(aiAgentsMock);

// ... سایر routes

app.listen(3000, () => {
  console.log('Server running with AI agents mock');
});
```

### روش 2️⃣: پیاده‌سازی دستی

#### اگر از Express استفاده می‌کنید:

```javascript
// در routes/ai-agents.js یا مشابه

const express = require('express');
const router = express.Router();

// Helper
const ok = (res, body) => res.status(200).json(body);

// Agents 5-10: "Not Available" response
for (let id = 5; id <= 10; id++) {
  router.get(`/agents/${id}/status`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      installed: false,
      available: false
    });
  });
  
  router.get(`/agents/${id}/config`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      enabled: false,
      pollingIntervalMs: 5000
    });
  });
  
  router.get(`/agents/${id}/history`, (req, res) => {
    ok(res, { items: [] });
  });
}

module.exports = router;

// در app.js:
// app.use('/api/ai', require('./routes/ai-agents'));
```

#### اگر از FastAPI (Python) استفاده می‌کنید:

```python
from fastapi import FastAPI
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

class AgentStatus(BaseModel):
    agentId: str
    installed: bool
    available: bool
    message: Optional[str] = None

class HistoryItem(BaseModel):
    items: List = []

# Agents 5-10
for agent_id in range(5, 11):
    agent_str = f"agent-{agent_id:02d}"
    
    @app.get(f"/api/ai/agents/{agent_id}/status")
    async def get_agent_status():
        return AgentStatus(
            agentId=agent_str,
            installed=False,
            available=False,
            message="This agent is not yet implemented"
        )
    
    @app.get(f"/api/ai/agents/{agent_id}/config")
    async def get_agent_config():
        return {
            "agentId": agent_str,
            "enabled": False,
            "pollingIntervalMs": 5000
        }
    
    @app.get(f"/api/ai/agents/{agent_id}/history")
    async def get_agent_history():
        return HistoryItem()
```

#### اگر از Django استفاده می‌کنید:

```python
# views.py
from django.http import JsonResponse
from django.views import View

class AgentStatusView(View):
    def get(self, request, agent_id):
        if 5 <= agent_id <= 10:
            return JsonResponse({
                'agentId': f'agent-{agent_id:02d}',
                'installed': False,
                'available': False
            })
        # ... برای agents دیگر

# urls.py
from django.urls import path
from .views import AgentStatusView

urlpatterns = [
    path('api/ai/agents/<int:agent_id>/status', AgentStatusView.as_view()),
    path('api/ai/agents/<int:agent_id>/config', AgentStatusView.as_view()),
    path('api/ai/agents/<int:agent_id>/history', AgentStatusView.as_view()),
]
```

### روش 3️⃣: استفاده از Nginx Proxy (بدون تغییر Backend)

اگر نمی‌خواهید الان backend را تغییر دهید، می‌توانید موقتاً از Nginx استفاده کنید:

```nginx
# /etc/nginx/sites-available/zala

location ~ ^/api/ai/agents/([5-9]|10)/(status|config|history)$ {
    default_type application/json;
    return 200 '{"agentId":"agent-$1","installed":false,"available":false}';
}
```

---

## 🧪 تست Backend Routes

### 1. Local Test

```bash
# Agent 5 Status
curl -sS http://localhost:3000/api/ai/agents/5/status | jq

# Output انتظاری:
# {
#   "agentId": "agent-05",
#   "installed": false,
#   "available": false
# }

# Agent 5 Config
curl -sS http://localhost:3000/api/ai/agents/5/config | jq

# Agent 5 History
curl -sS http://localhost:3000/api/ai/agents/5/history | jq
```

### 2. Production Test

```bash
# بعد از deploy
curl -sS https://zala.ir/api/ai/agents/5/status | jq
curl -sS https://zala.ir/api/ai/agents/6/status | jq
curl -sS https://zala.ir/api/ai/agents/7/status | jq
# ... تا agent 10
```

### 3. تست همه agents یکجا

```bash
#!/bin/bash
# test-all-agents.sh

for id in {5..10}; do
  echo "Testing Agent $id..."
  for endpoint in status config history; do
    response=$(curl -sS "https://zala.ir/api/ai/agents/$id/$endpoint")
    if echo "$response" | jq . > /dev/null 2>&1; then
      echo "  ✅ $endpoint: OK"
    else
      echo "  ❌ $endpoint: FAIL"
    fi
  done
done
```

---

## 📊 پاسخ‌های پیشنهادی

### حالت 1: "Not Available" (پیشنهاد فعلی)

```json
// GET /api/ai/agents/5/status
{
  "agentId": "agent-05",
  "installed": false,
  "available": false,
  "message": "This agent is not yet implemented"
}

// GET /api/ai/agents/5/config
{
  "agentId": "agent-05",
  "enabled": false,
  "pollingIntervalMs": 5000
}

// GET /api/ai/agents/5/history
{
  "agentId": "agent-05",
  "items": []
}
```

**نتیجه در UI:** مودال "🚧 Coming Soon"

### حالت 2: "Mock Active" (برای نمایش سبز)

```json
// GET /api/ai/agents/5/status
{
  "agentId": "agent-05",
  "installed": true,
  "available": true,
  "health": "good",
  "status": "active",
  "lastUpdate": "2025-01-11T10:00:00Z"
}

// GET /api/ai/agents/5/config
{
  "agentId": "agent-05",
  "enabled": true,
  "pollingIntervalMs": 5000,
  "maxConcurrency": 3,
  "retries": 2
}

// GET /api/ai/agents/5/history
{
  "agentId": "agent-05",
  "items": []
}
```

**نتیجه در UI:** مودال با اطلاعات پایه

---

## ⚠️ نکات مهم

### 1. همیشه 200 برگردانید

```javascript
// ❌ اشتباه
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ✅ درست
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(200).json({
    agentId: 'agent-05',
    installed: false,
    available: false
  });
});
```

**دلیل:** Frontend از فیلد `available` استفاده می‌کند، نه HTTP status code.

### 2. CORS Headers

اگر frontend و backend در دامنه‌های مختلف هستند:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
```

### 3. Authentication

اگر endpoint ها نیاز به authentication دارند:

```javascript
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token...
  next();
};

app.get('/api/ai/agents/:id/status', requireAuth, (req, res) => {
  // ...
});
```

---

## 🎯 Definition of Done

برای تکمیل این مرحله:

- [ ] Endpoints برای agents 5-10 پیاده‌سازی شده
- [ ] همه پاسخ‌ها با status code 200
- [ ] تست با curl موفقیت‌آمیز
- [ ] Frontend بدون 404/TypeError در console
- [ ] UI مودال "Coming Soon" یا اطلاعات پایه را نمایش می‌دهد

---

## 🔄 مراحل بعدی (آینده)

1. **جایگزینی Mock با پیاده‌سازی واقعی**
   - هر agent باید منطق تجاری خود را داشته باشد
   - داده‌های واقعی از database/services

2. **بهبود Schema**
   - استفاده از JSON Schema یا TypeScript types
   - Validation با libraries مثل Joi یا Zod

3. **WebSocket برای Real-time**
   - بعضی agents نیاز به real-time updates دارند
   - استفاده از Socket.io یا WebSocket

4. **Monitoring & Logging**
   - لاگ کردن درخواست‌های agent
   - Metrics برای performance

---

## 📞 سوالات متداول

**Q: آیا باید همه 6 agent را یکجا پیاده‌سازی کنم؟**  
A: خیر! می‌توانید یکی یکی اضافه کنید. Frontend با هر دوی حالت "available: true/false" کار می‌کند.

**Q: آیا می‌توانم فقط endpoint `/status` را پیاده‌سازی کنم؟**  
A: بله، اما بهتر است هر سه endpoint را داشته باشید. Frontend همه را فراخوانی می‌کند.

**Q: چطور می‌توانم یک agent را "سبز" کنم بدون پیاده‌سازی کامل؟**  
A: کافی است `available: true` برگردانید با داده‌های حداقلی (مثل فایل mock).

**Q: اگر backend من Python است چی؟**  
A: نمونه FastAPI در بالا موجود است. Django هم مشابه است.

---

## ✅ Checklist نهایی

### Backend Team
- [ ] فایل `backend-ai-agents-mock.js` را مطالعه کردم
- [ ] یکی از روش‌های بالا را انتخاب کردم
- [ ] Endpoints را پیاده‌سازی کردم
- [ ] با curl تست کردم
- [ ] در production deploy کردم

### Frontend Team (Already Done ✅)
- [x] Integration module ایجاد شده
- [x] Safe adapters پیاده‌سازی شده
- [x] UI برای "Coming Soon" آماده است
- [x] بدون TypeError/404 در frontend

### QA Team
- [ ] Hard refresh انجام شد
- [ ] Console logs تأیید شد
- [ ] Agents 1-4, 11 با placeholder کار می‌کنند
- [ ] Agents 5-10 مودال "Coming Soon" نمایش می‌دهند
- [ ] Agents 12-15 بدون تغییر OK هستند

---

**🎉 بعد از تکمیل این مراحل، سیستم AI کاملاً بدون error خواهد بود!**
