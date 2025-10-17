# 🔒 Production Safety Documentation

## Overview

This document describes the **Production Safety** upgrades implemented in the Titan Trading System to ensure strict data validation, prevent mock data leakage, and provide graceful degradation when data is unavailable.

## Core Security Features

### 1. FORCE_REAL Flag (`flags.js`)

**Location**: `public/static/lib/flags.js`

The `FORCE_REAL` flag is a production safety override that ALWAYS disables mock data, regardless of the `USE_MOCK` setting.

```javascript
export const FORCE_REAL = (window.ENV?.FORCE_REAL ?? 'true').toLowerCase() === 'true';
export const USE_MOCK = FORCE_REAL ? false : ((window.ENV?.USE_MOCK ?? 'false').toLowerCase() === 'true');
```

**Behavior**:
- When `FORCE_REAL=true`: Mock data is DISABLED, even if `USE_MOCK=true`
- When `FORCE_REAL=false`: `USE_MOCK` setting is respected (development mode)
- **Default**: `true` (production-safe by default)

**Security Alert**: If conflicting flags are detected, a console warning is displayed:
```
🚨 SECURITY WARNING: USE_MOCK=true is OVERRIDDEN by FORCE_REAL=true
   Mock data is DISABLED in production mode
```

---

### 2. Metadata Signature Pattern

Every data response from adapters MUST include a metadata signature:

```javascript
{
  source: 'real' | 'bff' | 'mock' | 'none',  // Data source
  ts: number,                                 // Timestamp in milliseconds
  ttlMs: 30000,                              // Time-to-live (default: 30 seconds)
  stale: boolean                             // Explicit stale flag
}
```

**Example**:
```javascript
{
  portfolio: { totalBalance: 125000, ... },
  meta: {
    source: 'real',
    ts: 1697543210000,
    ttlMs: 30000,
    stale: false
  }
}
```

---

### 3. Data Validation Functions

**Location**: `public/static/lib/flags.js`

#### `isValidSource(source: string): boolean`
Validates if a data source is acceptable in the current environment.

- **Production** (`FORCE_REAL=true`): Only accepts `'real'` or `'bff'`
- **Development** (`USE_MOCK=true`): Also accepts `'mock'`

#### `isStaleData(timestamp: number, ttlMs: number): boolean`
Checks if data has exceeded its Time-To-Live (TTL).

```javascript
const age = Date.now() - timestamp;
return age > ttlMs;  // Default TTL: 30 seconds
```

#### `isValidMetadata(meta: object): boolean`
Comprehensive metadata validation:

1. ✅ Checks metadata object exists and is valid
2. ✅ Validates `source` and `ts` fields are present
3. ✅ Validates source is acceptable via `isValidSource()`
4. ✅ Checks data freshness via `isStaleData()`
5. ✅ Checks explicit `stale` flag is not `true`

**Returns**: `true` only if ALL checks pass

#### `createNoDataResponse(reason: string): object`
Creates a standardized NO-DATA response when data is unavailable:

```javascript
{
  noData: true,
  meta: {
    source: 'none',
    ts: Date.now(),
    stale: true,
    reason: 'Unable to fetch dashboard data'
  }
}
```

---

### 4. Circuit Breaker Pattern

**Location**: `public/static/lib/http.js`

Prevents cascading failures by automatically disabling failing endpoints.

**Configuration**:
- **Failure Threshold**: 3 consecutive failures
- **Failure Window**: 60 seconds
- **Cooldown Period**: 2 minutes

**States**:
- **CLOSED**: Normal operation, requests allowed
- **OPEN**: Circuit tripped, requests blocked for cooldown period
- **HALF_OPEN**: Testing recovery after cooldown

**Behavior**:
```javascript
// After 3 failures within 60 seconds:
circuitBreaker.state = 'OPEN';

// All requests to that endpoint return:
throw new HTTPError('Circuit breaker OPEN. Retry in 85s', 503);

// After 2 minutes:
circuitBreaker.state = 'HALF_OPEN';  // Test if endpoint recovered
```

---

### 5. HTTP Client Retry Policy

**Location**: `public/static/lib/http.js`

**Retry Strategy**:
- **Only retry** on status codes: `502`, `503` (Bad Gateway, Service Unavailable)
- **Max retries**: 1 (configurable via `MAX_RETRIES`)
- **Delay**: 1 second between retries

**Non-Retryable Errors**:
- `400-499` (Client errors - permanent failures)
- `500`, `504-5xx` (Other server errors)

**Security**: Never logs Authorization headers or sensitive data

---

## No-Data UI Implementation

### Dashboard Module (`dashboard.js`)

#### 1. Data Loading with Validation

```javascript
async loadDashboardData() {
    // Load validation functions
    const validationFunctions = await import('../lib/flags.js');
    
    // Fetch data via adapter
    this.dashboardData = await getComprehensiveDashboard();
    
    // ❌ Check for NO-DATA response
    if (this.dashboardData.noData === true) {
        this.showNoDataState(this.dashboardData.meta?.reason);
        this.disableAllActionButtons();
        return;
    }
    
    // ❌ Validate metadata
    if (!validationFunctions.isValidMetadata(this.dashboardData.meta)) {
        this.showNoDataState('Data validation failed: Invalid metadata');
        this.disableAllActionButtons();
        return;
    }
    
    // ✅ Metadata valid - proceed with UI update
    this.updateDashboardUI();
    this.enableAllActionButtons();
}
```

#### 2. No-Data State Display

```javascript
showNoDataState(reason) {
    // Display prominent NO-DATA banner
    const banner = `
        <div class="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6">
            <i class="fas fa-exclamation-triangle text-red-400"></i>
            <h3>No Data Available</h3>
            <p>${reason}</p>
            <button onclick="refreshData()">Try Again</button>
        </div>
    `;
    
    // Replace all numeric displays with placeholders
    this.replaceAllWidgetsWithNoData();
}
```

#### 3. Widget Placeholder Display

```javascript
replaceAllWidgetsWithNoData() {
    // Replace all data cards with dash placeholders
    dataCardIds.forEach(id => {
        element.innerHTML = '<span class="text-gray-500">—</span>';
    });
    
    // Display "No Data Available" in complex widgets
    aiAgentsContainer.innerHTML = `
        <div class="text-center text-gray-400">
            <i class="fas fa-database text-red-400"></i>
            <p>No Agent Data Available</p>
        </div>
    `;
}
```

#### 4. Action Button Management

```javascript
// Disable all trading actions when data invalid
disableAllActionButtons() {
    const actionButtons = document.querySelectorAll('button[onclick*="trade"]');
    actionButtons.forEach(button => {
        button.disabled = true;
        button.title = 'Disabled: No valid data available';
    });
}

// Re-enable when data becomes valid
enableAllActionButtons() {
    disabledButtons.forEach(button => {
        button.disabled = false;
        button.removeAttribute('title');
    });
}
```

---

## Adapter Implementation Pattern

### Example: Balance Adapter

**Location**: `public/static/data/dashboard/balance.adapter.js`

```javascript
export async function getBalance() {
    // 🔴 Production Guard
    if (FORCE_REAL && USE_MOCK) {
        errorLog('🚨 SECURITY: Mock disabled in FORCE_REAL mode');
    }
    
    // ❌ Never use mock in production
    if (!FORCE_REAL && USE_MOCK) {
        return { ...mockData, meta: createMetadata('mock', 30000) };
    }
    
    // ✅ Fetch real data
    try {
        const response = await httpGet('/api/portfolio/advanced');
        if (response.success && response.data) {
            const normalized = normalizeBalanceData(response.data);
            normalized.meta = createMetadata('real', 30000);
            
            if (isValidMetadata(normalized.meta)) {
                return normalized;
            }
        }
        return createNoDataResponse('Balance data format invalid');
    } catch (error) {
        return createNoDataResponse(`Balance unavailable: ${error.message}`);
    }
}
```

**Key Points**:
1. ✅ Always check `FORCE_REAL` before returning mock data
2. ✅ Create metadata signature for ALL responses
3. ✅ Validate metadata before returning
4. ✅ Return `createNoDataResponse()` on failure (NOT fallback mock)

---

## Environment Configuration

### Backend (`src/index.tsx`)

```html
<script>
    window.ENV = {
        API_URL: "",                    // Same-origin
        FORCE_REAL: "true",            // 🔴 Production override
        USE_MOCK: "false",
        DEBUG: "false",
        API_TIMEOUT: "8000",
        ENABLE_RETRY: "true",
        MAX_RETRIES: "1"
    };
</script>
```

### Production Deployment

**Cloudflare Workers / Pages**:
Set environment variables:
```bash
FORCE_REAL=true
USE_MOCK=false
DEBUG=false
```

**Docker**:
```yaml
environment:
  - FORCE_REAL=true
  - USE_MOCK=false
  - DEBUG=false
```

---

## Testing Scenarios

### 1. Production Safety Test

**Scenario**: Attempt to enable mock data in production

```javascript
// Set window.ENV
window.ENV = {
    FORCE_REAL: 'true',
    USE_MOCK: 'true'  // ⚠️ This will be OVERRIDDEN
};

// Result: Mock data DISABLED, security warning logged
```

**Expected Console Output**:
```
🚨 SECURITY WARNING: USE_MOCK=true is OVERRIDDEN by FORCE_REAL=true
   Mock data is DISABLED in production mode
```

### 2. Stale Data Detection Test

**Scenario**: Data exceeds TTL (30 seconds)

```javascript
const data = {
    portfolio: { totalBalance: 125000 },
    meta: {
        source: 'real',
        ts: Date.now() - 35000,  // 35 seconds ago (> 30s TTL)
        ttlMs: 30000,
        stale: false
    }
};

isValidMetadata(data.meta);  // ❌ Returns false (data too old)
```

**Expected Behavior**:
- Dashboard displays "No Data Available"
- Action buttons disabled
- "Try Again" button shown

### 3. Circuit Breaker Test

**Scenario**: API endpoint fails 3 times

```javascript
// Failure 1: 500 error
// Failure 2: 503 error  
// Failure 3: 502 error

// Result: Circuit OPEN
// All subsequent requests:
throw new HTTPError('Circuit breaker OPEN. Retry in 120s', 503);

// After 2 minutes: Circuit HALF_OPEN (retry allowed)
```

### 4. Invalid Metadata Test

**Scenario**: Response missing required metadata fields

```javascript
const response = {
    portfolio: { totalBalance: 125000 }
    // ❌ Missing meta object
};

// Dashboard validation:
if (!validationFunctions.isValidMetadata(response.meta)) {
    this.showNoDataState('Invalid metadata');  // ✅ Triggered
}
```

---

## Debug Mode Features

### Source Badge Display

When `DEBUG=true`, a source badge appears in the bottom-right corner showing:
- **Data Source**: Real API / BFF Cache / Mock Data / No Data
- **Timestamp**: When data was fetched
- **Color Coding**:
  - 🟢 Green: Real API
  - 🔵 Blue: BFF Cache
  - 🟡 Yellow: Mock Data (dev only)
  - 🔴 Red: No Data

**Example**:
```
┌─────────────────────────────┐
│ 📊 Source: Real API         │
│ 🕐 14:32:45                 │
└─────────────────────────────┘
```

---

## Security Best Practices

### 1. ❌ Never Log Sensitive Data

**Bad**:
```javascript
console.log('API Response:', response);  // ❌ May contain tokens, amounts
```

**Good**:
```javascript
debugLog('API call successful:', endpoint, response.status);  // ✅ No sensitive data
```

### 2. ❌ Never Display Unvalidated Data

**Bad**:
```javascript
element.textContent = `$${data.balance}`;  // ❌ No validation
```

**Good**:
```javascript
if (isValidMetadata(data.meta)) {
    element.textContent = `$${data.balance}`;  // ✅ Validated
} else {
    element.innerHTML = '<span class="text-gray-500">—</span>';  // ✅ Placeholder
}
```

### 3. ✅ Always Use Metadata Signatures

**Bad**:
```javascript
return { balance: 125000 };  // ❌ No metadata
```

**Good**:
```javascript
return {
    balance: 125000,
    meta: createMetadata('real', 30000)  // ✅ With signature
};
```

---

## Troubleshooting

### Issue: "No Data Available" despite API working

**Cause**: Metadata validation failure

**Debug Steps**:
1. Enable DEBUG mode: `window.ENV.DEBUG = 'true'`
2. Check console for validation errors
3. Verify metadata structure matches requirements
4. Check data freshness (timestamp vs TTL)

### Issue: Circuit Breaker keeps triggering

**Cause**: Repeated API failures

**Debug Steps**:
1. Check API endpoint health
2. Review recent error logs
3. Verify API authentication
4. Check rate limiting

**Recovery**:
```javascript
// Manually reset circuit breaker (dev only)
circuitBreaker.circuits.delete('api/dashboard/comprehensive-real');
```

### Issue: Mock data showing in production

**Cause**: `FORCE_REAL` not set correctly

**Fix**:
1. Verify `window.ENV.FORCE_REAL = 'true'` in index.tsx
2. Check for security warnings in console
3. Ensure adapters check `FORCE_REAL` before returning mock

---

## File Reference

### Core Files

| File | Purpose |
|------|---------|
| `public/static/lib/flags.js` | Feature flags & validation functions |
| `public/static/lib/http.js` | HTTP client with Circuit Breaker |
| `public/static/modules/dashboard.js` | Dashboard UI with No-Data logic |
| `public/static/data/dashboard/*.adapter.js` | Data adapters with metadata |
| `src/index.tsx` | Backend HTML with ENV configuration |

### Validation Chain

```
API Response
    ↓
Adapter (adds metadata)
    ↓
isValidMetadata() check
    ↓ (if invalid)
createNoDataResponse()
    ↓
showNoDataState()
    ↓
disableAllActionButtons()
```

---

## Summary

This production safety implementation provides:

✅ **Zero Mock Data Leakage**: `FORCE_REAL` override prevents mock data in production  
✅ **Strict Data Validation**: Metadata signatures ensure data provenance and freshness  
✅ **Graceful Degradation**: NO-DATA UI instead of showing invalid/stale data  
✅ **Circuit Breaker**: Prevents cascading failures from overwhelmed endpoints  
✅ **Action Safety**: Trading buttons disabled when data is invalid  
✅ **Security Logging**: No sensitive data (amounts, tokens) logged  
✅ **Debug Tools**: Source badges and validation logging in DEBUG mode  

**Production-Ready**: All data flows through validation, never displaying unverified numbers to users.
