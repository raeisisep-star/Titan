# MEXC-Only Enforcement

## Overview

Task-8 enforces that only MEXC exchange is supported across the platform. Any attempt to use other exchanges (Binance, Coinbase, etc.) will be rejected with a `422 Unprocessable Entity` error.

## Why MEXC-Only?

1. **Simplified Integration**: Focus on one well-tested exchange API
2. **Security**: Reduce attack surface by limiting API integrations
3. **Compliance**: Easier regulatory compliance with single exchange
4. **Performance**: Optimized for MEXC's specific API patterns
5. **Feature Flag Ready**: Can be toggled via `MEXC_ONLY` environment variable

## Implementation

### 1. Exchange Validation Middleware

Automatically validates `exchange` parameter in requests:

```typescript
import { mexcOnlyMiddleware } from './middleware/mexc-only';

// Apply to trading routes
app.use('/api/manual-trading/*', mexcOnlyMiddleware());
app.use('/api/autopilot/*', mexcOnlyMiddleware());
app.use('/api/wallet/*', mexcOnlyMiddleware());
```

### 2. Validation Rules

**Checks:**
- Request body: `{ exchange: "mexc" }` ✅ | `{ exchange: "binance" }` ❌
- Query params: `?exchange=mexc` ✅ | `?exchange=coinbase` ❌

**Response for non-MEXC:**
```json
{
  "success": false,
  "error": "Unsupported exchange",
  "message": "Only MEXC exchange is supported. Received: \"binance\"",
  "supported_exchanges": ["mexc"],
  "code": "UNSUPPORTED_EXCHANGE"
}
```

HTTP Status: **422 Unprocessable Entity**

### 3. Symbol Normalization

MEXC uses specific symbol format (e.g., `BTCUSDT` not `BTC/USDT`):

```typescript
import { normalizeMEXCSymbol } from './middleware/mexc-only';

normalizeMEXCSymbol('BTC/USDT')  // => 'BTCUSDT'
normalizeMEXCSymbol('btc-usdt')  // => 'BTCUSDT'
normalizeMEXCSymbol('ETH')       // => 'ETHUSDT'
normalizeMEXCSymbol('BTC USDT')  // => 'BTCUSDT'
```

**Normalization Rules:**
1. Convert to UPPERCASE
2. Remove: `/`, `-`, `_`, spaces
3. If only base currency (BTC, ETH), append USDT
4. Ensure ends with USDT or USDC

### 4. Rate Limiting for MEXC Endpoints

Protect against API abuse:

```typescript
import { mexcRateLimitMiddleware } from './middleware/rate-limit-mexc';

// Apply specific limits to endpoints
app.post('/api/manual-trading/order', 
  mexcRateLimitMiddleware('order_create'),  // 10/min
  orderHandler
);

app.delete('/api/manual-trading/orders/:id', 
  mexcRateLimitMiddleware('order_cancel'),  // 20/min
  cancelHandler
);

app.get('/api/wallet/balances', 
  mexcRateLimitMiddleware('balance'),  // 30/min
  balanceHandler
);
```

**Rate Limit Configs:**
| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| order_create | 10/min | 60s |
| order_cancel | 20/min | 60s |
| balance | 30/min | 60s |
| open_orders | 20/min | 60s |
| ticker | 60/min | 60s |
| default | 30/min | 60s |

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests to MEXC order_create endpoint. Please try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after_seconds": 45
}
```

HTTP Status: **429 Too Many Requests**

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-25T13:45:00Z
Retry-After: 45
```

## API Key Validation

Validate MEXC API key format:

```typescript
import { validateMEXCApiKey } from './middleware/mexc-only';

validateMEXCApiKey('abc123...') // true (32-64 alphanumeric)
validateMEXCApiKey('short')     // false
validateMEXCApiKey('with!@#')   // false
```

**MEXC API Key Format:**
- Length: 32-64 characters
- Characters: `[a-zA-Z0-9]` only
- No special characters

## Testing

### Unit Tests
```bash
npm test tests/mexc-only.test.js
```

**Test Coverage:**
- ✅ Exchange validation (mexc vs binance/coinbase)
- ✅ Symbol normalization (BTC/USDT → BTCUSDT)
- ✅ API key format validation
- ✅ Rate limit configuration
- ✅ Supported exchanges list

### Integration Tests

```bash
# Test non-MEXC order rejection
curl -X POST http://localhost:5000/api/manual-trading/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exchange": "binance",
    "symbol": "BTCUSDT",
    "side": "BUY",
    "quantity": 0.01
  }'

# Expected: 422 Unprocessable Entity
# {
#   "success": false,
#   "error": "Unsupported exchange",
#   "message": "Only MEXC exchange is supported. Received: \"binance\"",
#   "supported_exchanges": ["mexc"],
#   "code": "UNSUPPORTED_EXCHANGE"
# }

# Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/manual-trading/order \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"exchange": "mexc", "symbol": "BTCUSDT", "side": "BUY", "quantity": 0.01}'
done

# Expected: First 10 succeed, remaining get 429 Too Many Requests
```

### Evidence Pack Example

```bash
# 1. Test non-MEXC order
echo "=== Test 1: Non-MEXC Order Rejection ==="
curl -i -X POST http://localhost:5000/api/manual-trading/order \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"exchange": "binance", "symbol": "BTCUSDT"}' \
  2>&1 | grep -E "HTTP|error|message"

# Expected Output:
# HTTP/1.1 422 Unprocessable Entity
# "error": "Unsupported exchange"
# "message": "Only MEXC exchange is supported. Received: \"binance\""

# 2. Test MEXC order (should work)
echo "=== Test 2: MEXC Order Success ==="
curl -i -X POST http://localhost:5000/api/manual-trading/order \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"exchange": "mexc", "symbol": "BTCUSDT"}' \
  2>&1 | head -1

# Expected Output:
# HTTP/1.1 200 OK  (or 400 if validation fails, but NOT 422)

# 3. Test symbol normalization
node -e "
const { normalizeMEXCSymbol } = require('./src/middleware/mexc-only.ts');
console.log('BTC/USDT ->', normalizeMEXCSymbol('BTC/USDT'));
console.log('eth-usdt ->', normalizeMEXCSymbol('eth-usdt'));
console.log('BNB ->', normalizeMEXCSymbol('BNB'));
"

# Expected Output:
# BTC/USDT -> BTCUSDT
# eth-usdt -> ETHUSDT
# BNB -> BNBUSDT
```

## Feature Flag Control

Enable/disable MEXC-only enforcement:

```bash
# Environment variable (default: true)
export MEXC_ONLY=true   # Enforce MEXC-only
export MEXC_ONLY=false  # Allow other exchanges

# Check in code
import { EnvFeatureFlags } from './feature-flags';

if (EnvFeatureFlags.isMexcOnly()) {
  // Apply MEXC-only middleware
}
```

## Rollback

### Code Rollback
```bash
git checkout HEAD~1 src/middleware/mexc-only.ts src/middleware/rate-limit-mexc.ts
```

### Remove Middleware
Comment out or remove middleware registration:

```typescript
// app.use('/api/manual-trading/*', mexcOnlyMiddleware());  // DISABLED
// app.use('/api/manual-trading/order', mexcRateLimitMiddleware('order_create'));  // DISABLED
```

## Future Extensions

If MEXC_ONLY is disabled in future:

1. **Multi-Exchange Support**:
   - Add Binance, Coinbase connectors
   - Exchange factory pattern
   - Unified API interface

2. **Exchange-Specific Rate Limits**:
   - Different limits per exchange
   - Exchange-specific normalization

3. **User Exchange Selection**:
   - User can choose preferred exchange
   - Per-user exchange settings in `user_prefs`

## Security Considerations

1. **API Key Protection**: Never log API keys in errors
2. **Rate Limiting**: Prevents API abuse and exchange bans
3. **Input Validation**: Symbol normalization prevents injection
4. **Error Messages**: Clear but don't expose sensitive info

## Status

✅ **Task-8 Complete**
- MEXC-only validation (422 for non-MEXC)
- Symbol normalization (BTC/USDT → BTCUSDT)
- Rate limiting on sensitive endpoints
- API key format validation
- Unit tests + integration tests
- Feature flag ready (MEXC_ONLY)
- Documentation complete
