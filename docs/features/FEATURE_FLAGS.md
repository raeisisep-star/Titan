# Feature Flags System

## Overview

Task-7 implements a comprehensive feature flag system with both global (ENV) and per-user flags, complete with audit trail and JSON Schema validation.

## Architecture

### 1. Global Feature Flags (Environment Variables)

Controlled via ENV variables, read via `EnvFeatureFlags` class:

```typescript
// Check in code
if (EnvFeatureFlags.isDemoMode()) {
  // Execute in demo mode
}

if (EnvFeatureFlags.isMexcOnly()) {
  // Only MEXC exchange allowed
}
```

**Available Flags:**
- `DEMO_MODE` (default: false) - Forces all trades to demo mode globally
- `MEXC_ONLY` (default: true) - Only MEXC exchange allowed

### 2. Database Feature Flags

Stored in `feature_flags` table, managed via `FeatureFlagsService`:

```typescript
const service = new FeatureFlagsService(pool);

// Get flag
const isDemoMode = await service.getFlag('DEMO_MODE');

// Set flag (with audit)
await service.setFlag('DEMO_MODE', true, adminUserId, {
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0...'
});
```

### 3. Per-User Preferences

Stored in `user_prefs` table:

```typescript
// Get user trading mode
const mode = await service.getUserTradingMode(userId); // 'demo' | 'real'

// Set user trading mode (with audit)
await service.setUserTradingMode(userId, 'real', userId, {
  ip_address: req.headers['x-forwarded-for'],
  user_agent: req.headers['user-agent']
});

// Check if user should trade in demo (considers global + user flags)
const shouldDemo = await service.shouldUseDemoMode(userId);
```

## Database Schema

### Tables

#### `feature_flags`
```sql
id, flag_key (UNIQUE), flag_value (BOOLEAN), description, created_at, updated_at
```

#### `user_prefs`
```sql
id, user_id (FK), trading_mode (demo|real), preferences (JSONB), created_at, updated_at
```

#### `settings_audit`
```sql
id, user_id, setting_type, setting_key, old_value, new_value, 
changed_by, changed_at, ip_address, user_agent
```

### Functions

- `get_feature_flag(flag_name)` - Get flag value
- `get_user_trading_mode(user_id)` - Get user mode
- `should_use_demo_mode(user_id)` - Check if demo mode should be used (global OR user)

## Middleware

### Demo Mode Middleware

Automatically intercepts trading requests and enforces demo mode:

```typescript
import { demoModeMiddleware } from './middleware/demo-mode';

app.use('/api/manual-trading/*', demoModeMiddleware(featureFlagsService));
app.use('/api/autopilot/*', demoModeMiddleware(featureFlagsService));

// In handler
if (isDemoRequest(c)) {
  const reason = getDemoReason(c); // 'global_demo_mode' | 'user_preference'
  // Execute in demo mode
}
```

## JSON Schema Validation

Using `ajv` for strict validation:

```typescript
import { validateUserPreferences, validateWithErrors } from './validators/settings-schema';

// In endpoint handler
const result = validateWithErrors(
  validateUserPreferences,
  await c.req.json()
);

if (!result.valid) {
  return c.json({ 
    error: 'Validation failed', 
    details: result.errors 
  }, 400);
}

// result.data is validated and type-safe
await service.setUserTradingMode(userId, result.data.trading_mode);
```

### Supported User Preferences

```typescript
{
  trading_mode?: 'demo' | 'real',
  preferences?: {
    theme?: 'light' | 'dark' | 'auto',
    language?: 'en' | 'fa',
    notifications?: {
      email?: boolean,
      telegram?: boolean,
      push?: boolean
    },
    risk_settings?: {
      max_position_size?: number,     // 0-10000
      stop_loss_percent?: number,     // 0-100
      take_profit_percent?: number    // 0-1000
    }
  }
}
```

## API Endpoints

### GET /api/settings/user
Get current user preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "trading_mode": "demo",
    "preferences": {
      "theme": "dark",
      "language": "fa"
    }
  }
}
```

### PATCH /api/settings/user
Update user preferences (validated with JSON Schema).

**Request:**
```json
{
  "trading_mode": "real",
  "preferences": {
    "notifications": {
      "telegram": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated",
  "audit_id": 123
}
```

## Audit Trail

Every settings change is logged to `settings_audit`:

```typescript
// Get audit history
const history = await service.getAuditHistory({
  userId: 123,
  settingKey: 'trading_mode',
  limit: 10
});

// Example result:
[
  {
    id: 456,
    user_id: 123,
    setting_type: 'user_pref',
    setting_key: 'trading_mode',
    old_value: 'demo',
    new_value: 'real',
    changed_by: 123,
    changed_at: '2025-10-25T12:34:56Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...'
  }
]
```

## Testing

### Unit Tests
```bash
npm test tests/feature-flags.test.ts
```

Tests cover:
- ✅ Feature flag get/set
- ✅ User trading mode get/set
- ✅ Demo mode detection
- ✅ JSON Schema validation (valid + invalid cases)
- ✅ Environment variable parsing

### Manual Testing

```bash
# Test demo mode toggle
curl -X PATCH http://localhost:5000/api/settings/user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trading_mode": "demo"}'

# Check audit log
psql -h localhost -p 5433 -U titan -d titan_db \
  -c "SELECT * FROM settings_audit WHERE user_id = 1 ORDER BY changed_at DESC LIMIT 5;"

# Test global DEMO_MODE
export DEMO_MODE=true
# Restart server
# All trading requests should now use demo mode
```

## Migration

### Apply Migration
```bash
psql -h localhost -p 5433 -U titan -d titan_db -f migrations/0006_feature_flags_system.sql
```

### Verify Tables
```bash
psql -h localhost -p 5433 -U titan -d titan_db -c "\dt feature_flags user_prefs settings_audit"
```

## Rollback

### Code Rollback
```bash
git checkout HEAD~1 src/feature-flags.ts src/middleware/demo-mode.ts src/validators/settings-schema.ts
npm install
```

### Database Rollback
```sql
DROP TABLE IF EXISTS settings_audit CASCADE;
DROP TABLE IF EXISTS user_prefs CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag(VARCHAR);
DROP FUNCTION IF EXISTS get_user_trading_mode(INTEGER);
DROP FUNCTION IF EXISTS should_use_demo_mode(INTEGER);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Security Considerations

1. **Audit Trail**: All changes logged with user, timestamp, IP, user agent
2. **Validation**: Strict JSON Schema prevents invalid data
3. **Transactions**: All updates use database transactions (ACID)
4. **Authorization**: Only user can change own settings (admin can change globals)

## Status

✅ **Task-7 Complete**
- Global ENV flags (DEMO_MODE, MEXC_ONLY)
- Per-user trading_mode (demo/real)
- Settings audit trail
- JSON Schema validation (ajv)
- Middleware for demo mode enforcement
- Unit tests
- Documentation complete
