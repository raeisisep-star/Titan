# Artemis Chatbot MVP - Intent System

## Task-9: 5 MVP Intents (Rule-Based NLU)

### Implemented Intents

1. **start_autopilot** - Start automated trading
2. **set_target** - Set profit target
3. **status** - Check portfolio status
4. **emergency_stop** - Halt all trading (requires confirmation)
5. **link_wallet** - Connect MEXC API keys (requires confirmation)

### Architecture

**Intent Classifier** (`src/artemis/intent-classifier.ts`):
- Rule-based keyword matching
- Pattern detection with confidence scoring
- Parameter extraction (e.g., target percentage)
- No external LLM (all local processing)

**Intent Service** (`src/artemis/intent-service.ts`):
- DB logging to `ai_intent_logs` table
- Confirmation tokens for sensitive actions
- Session management
- Conversation history

### Database Schema

**Tables:**
- `ai_intent_logs` - All intent classifications
- `intent_confirmation_tokens` - 2FA for sensitive actions

**Functions:**
- `get_user_recent_intents(user_id, limit)` - History
- `get_intent_statistics(days)` - Analytics
- `cleanup_expired_intent_tokens()` - Maintenance

### API Endpoint

**POST /api/chat/intent**

Request:
```json
{
  "text": "start autopilot please",
  "user_id": 123,
  "session_id": "optional"
}
```

Response:
```json
{
  "intent": "start_autopilot",
  "confidence": 0.8,
  "actions": ["check_balance", "verify_api_keys", "start_trading_engine"],
  "response": "Starting autopilot... I'll monitor the market...",
  "log_id": 456,
  "requires_confirmation": false
}
```

For sensitive actions:
```json
{
  "intent": "emergency_stop",
  "confidence": 1.0,
  "requires_confirmation": true,
  "confirmation_token": "abc123...",
  "confirmation_expires_at": "2025-10-25T13:50:00Z",
  "response": "⚠️ Emergency Stop - Please confirm with token..."
}
```

### Security

1. **Confirmation Tokens**: Sensitive actions require confirmation
2. **Expiration**: Tokens expire in 5 minutes
3. **One-time Use**: Tokens cannot be reused
4. **User Validation**: Tokens tied to specific user
5. **Audit Trail**: All intents logged with timestamp, IP, user agent

### Testing

Unit tests validate:
- ✅ Intent classification accuracy
- ✅ Confidence scoring
- ✅ Parameter extraction
- ✅ Confirmation token generation
- ✅ Token expiration

### Status

✅ **Complete** - All 5 intents implemented, tested, documented
