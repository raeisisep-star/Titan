# Backend Integration Guide for AI Agents 5-10

## 📋 Overview

This guide provides step-by-step instructions for backend developers to implement API endpoints for AI Agents 5-10.

**Frontend Status**: ✅ Complete (Commit 7b8fcb0)  
**Backend Status**: ⏳ Waiting for implementation

---

## 🎯 Required Endpoints

For each agent (5, 6, 7, 8, 9, 10), implement these three endpoints:

```
GET /api/ai/agents/{id}/status
GET /api/ai/agents/{id}/config
GET /api/ai/agents/{id}/history
```

---

## ⚠️ Critical Requirements

### 1. Always Return HTTP 200

**❌ DON'T DO THIS:**
```javascript
// BAD: Returning 404 will show raw errors in console
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(404).json({ error: 'Not found' });  // ❌ WRONG
});
```

**✅ DO THIS:**
```javascript
// GOOD: Return 200 with available: false
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(200).json({
    agentId: 'agent-05',
    installed: false,
    available: false,
    message: 'This agent is not yet implemented'
  });
});
```

### 2. Response Format

#### Option A: Not Available (Recommended for Start)
```json
{
  "agentId": "agent-05",
  "installed": false,
  "available": false,
  "message": "This agent is not yet implemented"
}
```

**Result in UI**: Shows "🚧 Coming Soon" modal

#### Option B: Mock Active (For Testing Green Display)
```json
{
  "agentId": "agent-05",
  "installed": true,
  "available": true,
  "status": "active",
  "health": "good",
  "lastUpdate": "2025-11-09T10:00:00Z"
}
```

**Result in UI**: Shows agent as active with green status

---

## 🚀 Implementation Methods

### Method 1: Using Mock Server (Quick Start)

#### Step 1: Copy Mock Server
```bash
# Copy the provided mock server file
cp backend-ai-agents-mock.js /path/to/your/backend/
cd /path/to/your/backend/
npm install express
```

#### Step 2: Run Standalone
```bash
node backend-ai-agents-mock.js
# Server runs on http://localhost:3000
```

#### Step 3: Test
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ai/agents/5/status
curl http://localhost:3000/api/ai/agents/1/status
```

#### Step 4: Integrate into Existing Server
```javascript
// در سرور اصلی خود (مثلاً server.js یا app.js)
const express = require('express');
const app = express();

// Import mock routes
const aiAgentsMock = require('./backend-ai-agents-mock');

// Use mock routes
app.use('/api/ai/agents', aiAgentsMock);

// Or proxy to standalone mock server
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api/ai/agents', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true
}));
```

---

### Method 2: Manual Implementation

#### Express.js Example

```javascript
const express = require('express');
const router = express.Router();

// Helper: Always return 200
const ok = (res, body) => res.status(200).json(body);

// Agents 5-10 endpoints
for (let id = 5; id <= 10; id++) {
  // Status endpoint
  router.get(`/agents/${id}/status`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      installed: false,
      available: false,
      message: 'Agent not yet implemented'
    });
  });
  
  // Config endpoint
  router.get(`/agents/${id}/config`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      enabled: false,
      pollingIntervalMs: 5000
    });
  });
  
  // History endpoint
  router.get(`/agents/${id}/history`, (req, res) => {
    ok(res, {
      agentId: `agent-${String(id).padStart(2, '0')}`,
      items: []
    });
  });
}

module.exports = router;
```

#### FastAPI Example (Python)

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class AgentStatus(BaseModel):
    agentId: str
    installed: bool
    available: bool
    message: Optional[str] = None

class AgentConfig(BaseModel):
    agentId: str
    enabled: bool
    pollingIntervalMs: int

class AgentHistory(BaseModel):
    agentId: str
    items: List[dict]

# Agents 5-10 endpoints
for agent_id in range(5, 11):
    agent_str = f"agent-{agent_id:02d}"
    
    @app.get(f"/api/ai/agents/{agent_id}/status", response_model=AgentStatus)
    async def get_status(id=agent_id):
        return AgentStatus(
            agentId=f"agent-{id:02d}",
            installed=False,
            available=False,
            message="Agent not yet implemented"
        )
    
    @app.get(f"/api/ai/agents/{agent_id}/config", response_model=AgentConfig)
    async def get_config(id=agent_id):
        return AgentConfig(
            agentId=f"agent-{id:02d}",
            enabled=False,
            pollingIntervalMs=5000
        )
    
    @app.get(f"/api/ai/agents/{agent_id}/history", response_model=AgentHistory)
    async def get_history(id=agent_id):
        return AgentHistory(
            agentId=f"agent-{id:02d}",
            items=[]
        )
```

#### Django Example (Python)

```python
from django.http import JsonResponse
from django.views import View

class AgentStatusView(View):
    def get(self, request, agent_id):
        return JsonResponse({
            'agentId': f'agent-{agent_id:02d}',
            'installed': False,
            'available': False,
            'message': 'Agent not yet implemented'
        }, status=200)

class AgentConfigView(View):
    def get(self, request, agent_id):
        return JsonResponse({
            'agentId': f'agent-{agent_id:02d}',
            'enabled': False,
            'pollingIntervalMs': 5000
        }, status=200)

class AgentHistoryView(View):
    def get(self, request, agent_id):
        return JsonResponse({
            'agentId': f'agent-{agent_id:02d}',
            'items': []
        }, status=200)

# در urls.py
from django.urls import path

urlpatterns = [
    path('api/ai/agents/<int:agent_id>/status', AgentStatusView.as_view()),
    path('api/ai/agents/<int:agent_id>/config', AgentConfigView.as_view()),
    path('api/ai/agents/<int:agent_id>/history', AgentHistoryView.as_view()),
]
```

---

### Method 3: Nginx Proxy (Temporary Solution)

If you can't modify backend code immediately, use Nginx to proxy these endpoints to the mock server:

```nginx
# در فایل nginx.conf یا site config
location /api/ai/agents/ {
    # Proxy agents 5-10 to mock server
    if ($request_uri ~ "^/api/ai/agents/(5|6|7|8|9|10)/") {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        break;
    }
    
    # Pass other agents to main backend
    proxy_pass http://localhost:8080;
}
```

---

## 🧪 Testing

### Local Testing

#### Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:00:00Z",
  "agents": {
    "notImplemented": [5, 6, 7, 8, 9, 10],
    "enhancedMock": [1, 2, 3, 4, 11]
  }
}
```

#### Test Agent 5 (Not Available)
```bash
curl http://localhost:3000/api/ai/agents/5/status
```

Expected output:
```json
{
  "agentId": "agent-05",
  "installed": false,
  "available": false,
  "message": "This agent is not yet implemented"
}
```

#### Test Agent 1 (Enhanced Mock)
```bash
curl http://localhost:3000/api/ai/agents/1/status
```

Expected output: Full data with indicators, signals, etc.

---

### Production Testing

#### Step 1: Deploy Backend
```bash
# Deploy your backend with new endpoints
npm run build
pm2 restart backend
```

#### Step 2: Test via Browser Console
```javascript
// در کنسول مرورگر
await window.TITAN_AI_API.fetchAgentBlock(5)
// Expected: {available: false, status: {available: false}}

await window.TITAN_AI_API.fetchAgentBlock(1)
// Expected: {available: true, status: {...full data}}
```

#### Step 3: UI Testing
1. Go to Settings → AI tab
2. Click on Agent 05 (or 6-10)
   - Expected: Modal shows "🚧 Coming Soon"
3. Click on Agent 01 (or 2-4, 11)
   - Expected: Modal shows full data

---

### Automated Testing Script

Create a test script `test-ai-agents.sh`:

```bash
#!/bin/bash

BASE_URL="${1:-http://localhost:3000}"

echo "Testing AI Agents API at $BASE_URL"
echo "===================================="

# Test health check
echo -e "\n📊 Health Check:"
curl -s "$BASE_URL/api/health" | jq '.'

# Test agents 5-10 (should return available: false)
for id in 5 6 7 8 9 10; do
  echo -e "\n🔧 Testing Agent $id (Not Available):"
  curl -s "$BASE_URL/api/ai/agents/$id/status" | jq '.available'
done

# Test agents 1-4, 11 (should return available: true)
for id in 1 2 3 4 11; do
  echo -e "\n✅ Testing Agent $id (Should be Available):"
  curl -s "$BASE_URL/api/ai/agents/$id/status" | jq '.available'
done

echo -e "\n===================================="
echo "✅ Testing Complete"
```

Usage:
```bash
chmod +x test-ai-agents.sh
./test-ai-agents.sh http://localhost:3000
./test-ai-agents.sh https://your-production-domain.com
```

---

## 📝 Important Notes

### 1. CORS Headers
Add CORS headers for frontend requests:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### 2. Authentication
If your API requires authentication, ensure tokens are properly handled:

```javascript
// در frontend (ai-api.js) قبلاً پیاده شده
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. Rate Limiting
Consider adding rate limiting for production:

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests'
});

app.use('/api/ai/', apiLimiter);
```

### 4. Logging
Add proper logging for debugging:

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

## ✅ Definition of Done

Backend implementation is complete when:

- [ ] All 18 endpoints return HTTP 200 (not 404)
- [ ] Agents 5-10 return `{available: false}` or mock data
- [ ] curl tests pass for all endpoints
- [ ] Browser console shows no raw 404 errors
- [ ] UI shows "Coming Soon" modal for agents 5-10
- [ ] UI shows data (real or mock) for agents 1-4 & 11

---

## 🆘 Troubleshooting

### Problem: Still seeing 404 errors in console

**Solution**: Check that:
1. Backend routes are properly registered
2. Frontend is pointing to correct backend URL
3. CORS headers are set correctly
4. Endpoints return HTTP 200 (not 404)

### Problem: "Coming Soon" modal not showing

**Solution**: Check that:
1. Response includes `"available": false`
2. Frontend integration script is loaded (check console for "✅ AI Tab Integration Patches Applied")
3. Browser cache is cleared (hard refresh: Ctrl+Shift+R)

### Problem: Mock server not starting

**Solution**:
```bash
# Install dependencies
npm install express

# Check port availability
lsof -i :3000

# Kill existing process if needed
kill -9 $(lsof -t -i :3000)

# Start with different port
PORT=3001 node backend-ai-agents-mock.js
```

---

## 📚 Additional Resources

- **Frontend Integration**: See `AI_AGENTS_FIX_COMPLETE.md`
- **Testing Guide**: See `QUICK_TEST_CHECKLIST_FA.md`
- **Summary**: See `FINAL_SUMMARY_FA.md`
- **Mock Server**: See `backend-ai-agents-mock.js`

---

## 📞 Contact

For questions or issues:
- Check frontend integration first (see git commit 7b8fcb0)
- Review this guide and mock server code
- Test with curl commands before UI testing
- Check browser console for detailed error messages

**Remember**: Frontend is complete ✅. Backend just needs to return HTTP 200 with `{available: false}` for agents 5-10!
