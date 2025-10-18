# 🧪 AI Chatbot Testing Guide

## Quick Start Testing

### 1. Prerequisites

- Backend running: `pm2 list` should show `titan-backend` online
- Valid JWT token (login first)
- API keys configured in `.env` (optional for testing - will use mock responses)

### 2. Get Authentication Token

```bash
# Login to get JWT token
curl -X POST https://www.zala.ir/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Save the token from response
export TOKEN="eyJhbGc..."
```

### 3. Test AI Endpoints

#### Test 1: Main AI Chat

```bash
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Bitcoin and should I invest in it?",
    "preferredProvider": "openai"
  }' | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "response": "Bitcoin is a decentralized cryptocurrency...",
  "provider": "openai",
  "model": "gpt-4",
  "usage": {
    "total_tokens": 150
  }
}
```

#### Test 2: Trading Advice

```bash
curl -X POST https://www.zala.ir/api/ai/chat/trading-advice \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "analysis": {
      "price": 45000,
      "trend": "bullish",
      "volume": "high"
    }
  }' | jq '.'
```

#### Test 3: Market Sentiment

```bash
curl -X POST https://www.zala.ir/api/ai/chat/market-sentiment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "market": "crypto",
    "symbols": ["BTC", "ETH", "SOL"]
  }' | jq '.'
```

#### Test 4: Portfolio Optimization

```bash
curl -X POST https://www.zala.ir/api/ai/chat/portfolio-optimization \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": {
      "BTC": 0.5,
      "ETH": 2.0,
      "USDT": 5000
    },
    "targetReturn": 20,
    "riskTolerance": "moderate"
  }' | jq '.'
```

#### Test 5: Artemis Orchestration

```bash
curl -X POST https://www.zala.ir/api/ai/artemis/orchestrate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "complex_trading_decision",
    "context": {
      "portfolioValue": 10000,
      "availableBalance": 5000,
      "marketCondition": "volatile"
    },
    "agents": [
      "agent_01",
      "agent_02",
      "agent_03"
    ]
  }' | jq '.'
```

#### Test 6: List Available Providers

```bash
curl https://www.zala.ir/api/ai/providers \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "providers": {
    "openai": false,
    "anthropic": false,
    "google": false
  },
  "available": [],
  "note": "Add API keys to .env to enable providers"
}
```

#### Test 7: Health Check

```bash
curl https://www.zala.ir/api/ai/providers/health \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

#### Test 8: Chat History

```bash
curl https://www.zala.ir/api/ai/chat/history?limit=10 \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 4. Testing with Different Providers

```bash
# Test with OpenAI
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain DeFi",
    "preferredProvider": "openai"
  }' | jq '.provider'

# Test with Anthropic
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain DeFi",
    "preferredProvider": "anthropic"
  }' | jq '.provider'

# Test with Google
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain DeFi",
    "preferredProvider": "google"
  }' | jq '.provider'
```

### 5. Testing Fallback Mechanism

When API keys are not configured, the system automatically uses mock responses:

```bash
# This will use mock response if providers are unavailable
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best trading strategy?",
    "preferredProvider": "openai"
  }' | jq '.'
```

**Mock Response Example**:
```json
{
  "success": true,
  "response": "[MOCK] As an AI trading assistant...",
  "provider": "mock",
  "model": "mock-model"
}
```

## Advanced Testing

### Test with Context

```bash
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Should I sell my Bitcoin position?",
    "context": {
      "systemPrompt": "You are a conservative trading advisor",
      "maxTokens": 300,
      "temperature": 0.7
    },
    "preferredProvider": "openai"
  }' | jq '.'
```

### Test Error Handling

```bash
# Test with invalid provider
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "preferredProvider": "invalid-provider"
  }' | jq '.'
```

### Test Without Authentication

```bash
# This should return authentication error
curl -X POST https://www.zala.ir/api/ai/chat/real \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message"
  }' | jq '.'
```

## Database Verification

### Check Conversation History

```bash
# Connect to database
psql -U titan_user -d titan_trading -h localhost -p 5433

# Query conversation history
SELECT 
  id,
  user_id,
  message,
  LEFT(response, 50) as response_preview,
  provider,
  model,
  tokens_used,
  created_at
FROM ai_conversations
ORDER BY created_at DESC
LIMIT 10;
```

### Check AI Agents

```bash
# List all AI agents
SELECT agent_id, name, type, status
FROM ai_agents
ORDER BY agent_id;
```

## Performance Testing

### Load Test (10 concurrent requests)

```bash
# Install hey (HTTP load generator)
# go install github.com/rakyll/hey@latest

# Run load test
hey -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -m POST \
  -d '{"message":"Test message"}' \
  https://www.zala.ir/api/ai/chat/real
```

## Monitoring

### Check PM2 Logs

```bash
# Real-time logs
pm2 logs titan-backend --lines 50

# Error logs only
pm2 logs titan-backend --err --lines 50

# Logs for specific instance
pm2 logs titan-backend --instance 0
```

### Check System Status

```bash
# PM2 status
pm2 status

# Memory usage
pm2 monit

# Restart if needed
pm2 restart titan-backend
```

## Common Issues & Solutions

### Issue 1: Authentication Failed

**Error**: `{"success": false, "error": "Authentication required"}`

**Solution**:
```bash
# Get fresh token
curl -X POST https://www.zala.ir/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpass"}'
```

### Issue 2: All Providers Unavailable

**Error**: All providers return mock responses

**Solution**:
1. Check `.env` file has real API keys
2. Restart backend: `pm2 restart titan-backend`
3. Verify keys are valid on provider websites

### Issue 3: Slow Response Times

**Symptom**: Requests take >30 seconds

**Solution**:
- Check provider API status
- Verify internet connection
- Reduce `maxTokens` in request
- Use faster models (gpt-3.5-turbo instead of gpt-4)

### Issue 4: Database Connection Error

**Error**: `error: connection refused`

**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Test connection
psql -U titan_user -d titan_trading -h localhost -p 5433
```

## Production Checklist

- [ ] API keys configured in `.env`
- [ ] Backend running with no errors
- [ ] All providers show ✅ in logs
- [ ] Test basic chat functionality
- [ ] Test all specialized endpoints
- [ ] Verify conversation history saving
- [ ] Check token usage tracking
- [ ] Test error handling
- [ ] Test fallback mechanism
- [ ] Load test completed
- [ ] Monitoring set up

## Next Steps

After successful testing:

1. **Configure API Keys** (if not already done)
2. **Monitor Usage** - Check `ai_conversations` table for token usage
3. **Set Up Alerts** - Monitor for API failures
4. **Optimize Costs** - Implement caching for common queries
5. **Phase 4** - Begin Autopilot & Trading Engine integration

---

**Testing Status**: ✅ Ready for Testing  
**Last Updated**: 2025-10-18
