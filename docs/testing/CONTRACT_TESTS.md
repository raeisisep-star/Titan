# Contract Testing Documentation

## Overview

This document describes the contract testing setup for Titan Trading Platform API endpoints.

## Test Framework

- **Testing Library**: Jest + Supertest
- **TypeScript Support**: ts-jest
- **HTTP Mocking**: nock (for MEXC API calls)
- **Coverage Target**: ≥60% lines/statements

## Test Structure

```
tests/
└── contracts/
    ├── loader.ts              # YAML contract loader
    ├── api-contracts.spec.ts  # Generated contract tests
    └── ...
```

## Contract File

Tests are generated from `docs/contracts/contracts-simple.yml` which defines:
- Endpoint paths and HTTP methods
- Authentication requirements
- Implementation status (REAL/PARTIAL/TODO)

## Running Tests

```bash
# Run all contract tests with coverage
npm run test:contracts

# Watch mode for development
npm run test:watch

# All tests
npm test
```

## Test Categories

### 1. Authentication Tests
- Registration endpoint validation
- Login endpoint validation
- Logout endpoint validation

### 2. Protected Endpoint Tests
For each protected endpoint, we test:
- ✅ Returns 401 without authentication
- ✅ Returns 401/403 with invalid token
- ✅ Accepts valid JWT token

### 3. Health Check Tests
- Public health endpoint (/api/health)
- Admin health endpoint with Basic Auth (/api/health/full)

### 4. Validation Tests
- Invalid request body handling (400/422)
- Missing required fields

### 5. Rate Limiting Tests
- Verifies 429 responses under load
- Tests rate limit enforcement

## Test Coverage

Current coverage: **64 tests** across 8 modules:
- auth (3 endpoints)
- health (2 endpoints)
- dashboard (3 endpoints)
- portfolio (2 endpoints)
- alerts (2 endpoints)
- autopilot (3 endpoints)
- manual_trading (3 endpoints)
- settings (2 endpoints)
- security (1 endpoint)

**Total: 21 endpoints tested** (exceeds 20 minimum requirement)

## Mocking Strategy

### MEXC API Mocking
All external MEXC API calls are mocked using `nock`:

```typescript
nock('https://api.mexc.com')
  .persist()
  .get('/api/v3/account')
  .reply(200, { balances: [...] });
```

Mocked endpoints:
- GET /api/v3/account (balance)
- GET /api/v3/ticker/price (price data)
- POST /api/v3/order (order placement)
- GET /api/v3/openOrders (open orders)

## Test Configuration

### jest.config.js
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 60,
      statements: 60
    }
  }
}
```

### Environment Variables
- `TEST_BASE_URL`: Server URL (default: http://localhost:5000)
- `TEST_JWT`: Valid JWT token for authenticated tests

## CI Integration

Tests run automatically in GitHub Actions:
- Node versions: 18.x, 20.x
- Triggers: Push to main/develop, PRs
- Coverage reports uploaded to Codecov

See `.github/workflows/ci-tests.yml` for configuration.

## Expected Test Results

### Without Running Server
Tests will fail with connection errors (ECONNREFUSED). This is expected in development.

### With Running Server
- Auth tests: Should pass for valid credentials
- Protected tests: Should enforce authentication
- Rate limit tests: Should return 429 after threshold
- Validation tests: Should return 400/422 for invalid input

## Adding New Tests

1. Update `docs/contracts/contracts-simple.yml` with new endpoint
2. Tests are auto-generated from contract definitions
3. Run `npm run test:contracts` to execute

## Rollback

Remove contract testing:
```bash
git checkout HEAD~1 tests/ jest.config.js tsconfig.json package.json
npm install
```

## Status

✅ **Task-6 Complete**
- 64 tests generated (>20 required)
- Coverage threshold: 60%
- MEXC API mocked
- CI integration ready
- Documentation complete
