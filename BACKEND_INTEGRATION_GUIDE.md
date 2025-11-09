# Backend Integration Guide for AI Agents 5-10

## 📋 Overview

This guide explains how to implement backend endpoints for AI Agents 5-10 to complete the AI Tab integration.

**Current Status:**
- ✅ Frontend integration complete (agents 1-11 supported)
- ⏳ Backend endpoints needed for agents 5-10
- ✅ Mock server provided for testing

## 🎯 Requirements

### Endpoints Needed

For each agent (5, 6, 7, 8, 9, 10), implement three endpoints:

```
GET /api/ai/agents/{id}/status
GET /api/ai/agents/{id}/config
GET /api/ai/agents/{id}/history
```

### Critical Rules

1. **Always return HTTP 200** (even if agent not implemented)
2. **Never return 404** for these endpoints
3. **Use `available: false`** to indicate unavailable agents
4. **Frontend handles the rest** (shows "Coming Soon" modal)

## 🚀 Implementation Methods

### Method 1: Use Provided Mock Server (Fastest)

We've provided a ready-to-use mock server in `backend-ai-agents-mock.js`.

#### Standalone Usage

```bash
# Install dependencies
npm install express

# Run the mock server
node backend-ai-agents-mock.js

# Or with custom port
PORT=8080 node backend-ai-agents-mock.js
```

#### Integrate with Existing Express Server

```javascript
const express = require('express');
const app = express();

// Import mock server
const aiAgentsMock = require('./backend-ai-agents-mock');

// Mount under /api/ai
app.use('/api/ai', aiAgentsMock);

// Your other routes...
app.listen(3000);
```

### Method 2: Manual Implementation

#### Express.js Example

```javascript
const express = require('express');
const router = express.Router();

// Helper to always return 200
const ok = (res, body) => res.status(200).json(body);

// Not available response template
const notAvailable = (id) => ({
  agentId: `agent-${String(id).padStart(2, '0')}`,
  installed: false,
  available: false,
  message: 'This agent is not yet implemented'
});

// Implement for agents 5-10
for (let id = 5; id <= 10; id++) {
  // Status endpoint
  router.get(`/agents/${id}/status`, (req, res) => {
    ok(res, notAvailable(id));
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

# Generate routes for agents 5-10
for agent_id in range(5, 11):
    agent_str = f"agent-{agent_id:02d}"
    
    @app.get(f"/api/ai/agents/{agent_id}/status")
    async def get_status():
        return AgentStatus(
            agentId=agent_str,
            installed=False,
            available=False,
            message="This agent is not yet implemented"
        )
    
    @app.get(f"/api/ai/agents/{agent_id}/config")
    async def get_config():
        return AgentConfig(
            agentId=agent_str,
            enabled=False,
            pollingIntervalMs=5000
        )
    
    @app.get(f"/api/ai/agents/{agent_id}/history")
    async def get_history():
        return AgentHistory(
            agentId=agent_str,
            items=[]
        )
```

#### Django Example (Python)

```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

def not_available(agent_id):
    return {
        'agentId': f'agent-{agent_id:02d}',
        'installed': False,
        'available': False,
        'message': 'This agent is not yet implemented'
    }

@require_http_methods(["GET"])
def agent_status(request, agent_id):
    if 5 <= agent_id <= 10:
        return JsonResponse(not_available(agent_id))
    return JsonResponse({'error': 'Invalid agent ID'}, status=400)

@require_http_methods(["GET"])
def agent_config(request, agent_id):
    if 5 <= agent_id <= 10:
        return JsonResponse({
            'agentId': f'agent-{agent_id:02d}',
            'enabled': False,
            'pollingIntervalMs': 5000
        })
    return JsonResponse({'error': 'Invalid agent ID'}, status=400)

@require_http_methods(["GET"])
def agent_history(request, agent_id):
    if 5 <= agent_id <= 10:
        return JsonResponse({
            'agentId': f'agent-{agent_id:02d}',
            'items': []
        })
    return JsonResponse({'error': 'Invalid agent ID'}, status=400)

# urls.py
from django.urls import path

urlpatterns = [
    path('api/ai/agents/<int:agent_id>/status', agent_status),
    path('api/ai/agents/<int:agent_id>/config', agent_config),
    path('api/ai/agents/<int:agent_id>/history', agent_history),
]
```

### Method 3: Nginx Proxy (Temporary Solution)

If you want to test frontend without backend changes, use Nginx to proxy to mock server:

```nginx
# nginx.conf
location /api/ai/agents/ {
    # Proxy to mock server
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}
```

## 📦 Response Formats

### Status Endpoint Response

#### Not Available (Recommended Initially)

```json
{
  "agentId": "agent-05",
  "installed": false,
  "available": false,
  "message": "This agent is not yet implemented"
}
```

Frontend behavior: Shows "🚧 Coming Soon" modal

#### Mock Active (For Testing Green Display)

```json
{
  "agentId": "agent-05",
  "installed": true,
  "available": true,
  "status": "active",
  "health": "good",
  "accuracy": 85.0,
  "confidence": 90.0,
  "lastUpdate": "2024-11-09T10:30:00Z"
}
```

Frontend behavior: Shows agent as active with mock data

### Config Endpoint Response

```json
{
  "agentId": "agent-05",
  "enabled": false,
  "pollingIntervalMs": 5000,
  "settings": {}
}
```

### History Endpoint Response

```json
{
  "agentId": "agent-05",
  "items": []
}
```

Or with sample data:

```json
{
  "agentId": "agent-05",
  "items": [
    {
      "timestamp": 1699523400000,
      "event": "signal_generated",
      "data": { "type": "BUY", "confidence": 0.85 }
    }
  ]
}
```

## 🧪 Testing

### Local Testing

1. **Start the mock server:**
   ```bash
   node backend-ai-agents-mock.js
   ```

2. **Test endpoints:**
   ```bash
   # Test agent 5 (should show "not available")
   curl http://localhost:3000/api/ai/agents/5/status

   # Test agent 1 (should show enhanced data)
   curl http://localhost:3000/api/ai/agents/1/status

   # Health check
   curl http://localhost:3000/api/health
   ```

3. **Expected output for agent 5:**
   ```json
   {
     "agentId": "agent-05",
     "installed": false,
     "available": false,
     "message": "This agent is not yet implemented"
   }
   ```

### Frontend Testing

1. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

2. **Check console logs:**
   ```
   ✅ TITAN AI API module loaded
   ✅ TITAN AI Adapters module loaded
   🔧 Applying AI Tab Integration Patches...
   ✅ AI Tab Integration Patches Applied Successfully
   ```

3. **Test in browser console:**
   ```javascript
   // Test agent 1 (should return data)
   await window.TITAN_AI_API.fetchAgentBlock(1)

   // Test agent 5 (should return available: false)
   await window.TITAN_AI_API.fetchAgentBlock(5)
   ```

4. **UI Testing:**
   - Go to Settings → AI tab
   - Click on Agent 01-04: Should show detail modal with data
   - Click on Agent 05-10: Should show "🚧 Coming Soon" modal
   - Click on Agent 11: Should show detail modal with data
   - Check console: No TypeError, no raw 404 errors

### Production Testing

```bash
# Test production endpoints
curl https://your-domain.com/api/ai/agents/5/status
curl https://your-domain.com/api/ai/agents/5/config
curl https://your-domain.com/api/ai/agents/5/history
```

### Automated Testing Script

```bash
#!/bin/bash
# test-ai-agents.sh

BASE_URL="http://localhost:3000/api/ai/agents"

echo "Testing AI Agents Endpoints..."
echo "=============================="

for id in {5..10}; do
  echo ""
  echo "Testing Agent $id:"
  
  echo -n "  Status:  "
  curl -s "${BASE_URL}/${id}/status" | jq -r '.available // "error"'
  
  echo -n "  Config:  "
  curl -s "${BASE_URL}/${id}/config" | jq -r '.enabled // "error"'
  
  echo -n "  History: "
  curl -s "${BASE_URL}/${id}/history" | jq -r '.items | length'
done

echo ""
echo "=============================="
echo "✅ Testing complete"
```

## 📝 Important Notes

### 1. Always Return HTTP 200

**Don't do this:**
```javascript
// ❌ WRONG
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(404).json({ error: 'Not implemented' });
});
```

**Do this:**
```javascript
// ✅ CORRECT
app.get('/api/ai/agents/5/status', (req, res) => {
  res.status(200).json({
    agentId: 'agent-05',
    available: false
  });
});
```

### 2. CORS Headers

Ensure CORS headers are set for development:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

### 3. Authentication

If your API requires authentication:

```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token...
  next();
};

app.get('/api/ai/agents/:id/status', authenticate, (req, res) => {
  // ...
});
```

### 4. Rate Limiting

Consider adding rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // 100 requests per minute
});

app.use('/api/ai/', limiter);
```

## 🔄 Migration Path

### Phase 1: Initial Deployment (Now)
- Use "not available" responses
- Frontend shows "Coming Soon" modals
- No errors or 404s in console

### Phase 2: Mock Active (Testing)
- Change responses to mock active data
- Test frontend with green agent display
- Verify all UI components work

### Phase 3: Real Implementation (Future)
- Implement actual agent logic
- Replace mock data with real data
- Add business logic and validation

## ✅ Definition of Done

Your backend implementation is complete when:

1. **All endpoints return HTTP 200** (not 404)
2. **Response format matches specification** (agentId, available, etc.)
3. **CORS headers are set** (for cross-origin requests)
4. **Frontend shows no errors** in console
5. **Coming Soon modal works** for agents 5-10
6. **Automated tests pass** (if implemented)

## 🆘 Troubleshooting

### Problem: 404 errors in frontend console

**Solution:** Check that all three endpoints exist for each agent 5-10

### Problem: CORS errors

**Solution:** Add CORS headers to responses:
```javascript
res.header('Access-Control-Allow-Origin', '*');
```

### Problem: TypeError in frontend

**Solution:** Ensure response has `available` field:
```javascript
{ agentId: 'agent-05', available: false }
```

### Problem: Modal doesn't show

**Solution:** Verify `available: false` is returned (not `installed: false` only)

## 📚 Additional Resources

- Mock server file: `backend-ai-agents-mock.js`
- Frontend integration: `public/static/modules/ai-tab-integration.js`
- API module: `public/static/modules/ai-api.js`
- Adapters: `public/static/modules/ai-adapters.js`
- Quick test checklist: `QUICK_TEST_CHECKLIST_FA.md`
- Complete documentation: `AI_AGENTS_FIX_COMPLETE.md`

## 💬 Questions?

If you have questions about implementation, check:
1. This guide (BACKEND_INTEGRATION_GUIDE.md)
2. Mock server code (backend-ai-agents-mock.js)
3. Frontend integration code (ai-tab-integration.js)
4. Testing checklist (QUICK_TEST_CHECKLIST_FA.md)
