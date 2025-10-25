# Titan Trading Platform - API Contracts Map

## Overview
Complete API contracts documentation covering 7 core modules and 45+ endpoints.

## File
- **contracts.yml** (932 lines) - Complete API specification with request/response schemas

## Coverage

### 7 Core Modules
1. **Dashboard** - Portfolio summary, charts, activities
2. **Portfolio** - Holdings, wallet balances, P&L tracking
3. **Alerts** - Price alerts, notifications, news aggregation
4. **Autopilot** - AI-powered automated trading
5. **Manual Trading** - Order placement and execution (MEXC only)
6. **AI Overview** - Artemis AI engine + 15 agents + chatbot
7. **Settings** - User preferences, i18n, feature flags, integrations

### Implementation Status
- ✅ **REAL**: 18 endpoints (51%) - Fully implemented and working
- 🔄 **PARTIAL**: 6 endpoints (17%) - Structure OK, needs refinement
- ⏳ **TODO**: 11 endpoints (31%) - Not yet implemented

### Coverage Percentage
**69%** of endpoints are implemented or partially working

## Critical Gaps Identified

### High Priority
1. `/api/portfolio/pnl-history` - Historical P&L tracking (16h effort)
2. `/api/chat/intent` - Artemis chatbot intents (24h effort, Task-9)

### Medium Priority
3. `/api/integrations/telegram/*` - Telegram bot linking (12h, Task-10)
4. `/api/news/feed` - Real news API integration (8h effort)

### Low Priority
5. `/api/ai/predict` - ML model training (40+ hours)

## Backend-Frontend Mismatches

| Module | Issue | Action Required |
|--------|-------|----------------|
| Dashboard | Activities feed returns mock data | Create activity_logs table |
| Portfolio | Live price sync optimization | Implement WebSocket for realtime |
| AI Overview | Frontend chatbot UI ready, backend missing | Complete Task-9 |

## Feature Flags (Pending Implementation)

| Flag | Type | Task |
|------|------|------|
| DEMO_MODE | Global | Task-7 |
| TRADING_MODE | Per-user (demo\|real) | Task-7 |
| MEXC_ONLY | Restriction | Task-8 |

## Authentication Endpoints

| Path | Method | Status |
|------|--------|--------|
| `/api/auth/register` | POST | ✅ REAL |
| `/api/auth/login` | POST | ✅ REAL |
| `/api/auth/logout` | POST | ✅ REAL |
| `/api/auth/verify` | POST | ✅ REAL |
| `/api/auth/refresh` | POST | ⏳ TODO |

## Health & Security

| Path | Method | Auth | Status |
|------|--------|------|--------|
| `/api/health` | GET | None | ✅ REAL |
| `/api/health/full` | GET | Basic Auth | ✅ REAL |
| `/api/security/csp-report` | POST | None | ✅ REAL (Task-3) |

## Next Steps

1. **Task-6**: Contract tests (supertest) - Use this contracts.yml as source of truth
2. **Task-7**: Implement feature flags system
3. **Task-9**: Build Artemis chatbot intents (5 MVP intents)
4. **Task-10**: Telegram bot OTP linking

## Usage

This contracts.yml serves as:
- Source of truth for API structure
- Input for contract testing (Task-6)
- Reference for frontend developers
- Gap analysis for sprint planning

---
**Date**: 2025-10-25  
**Status**: ✅ Complete  
**Total Endpoints**: 45+  
**Total Lines**: 932
