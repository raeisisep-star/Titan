# ARA-001: Titan Trading Platform - Project Overview

**Document ID:** ARA-001  
**Version:** 1.0  
**Date:** 2025-10-24  
**Status:** Active  
**Author:** System Architecture Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Module Overview](#module-overview)
4. [API Reference](#api-reference)
5. [User Flows](#user-flows)
6. [Technical Risks & Debt](#technical-risks--debt)
7. [Mitigation Strategies](#mitigation-strategies)
8. [Related Documents](#related-documents)

---

## 1. Executive Summary

**Titan Trading Platform** is an AI-powered cryptocurrency trading system that enables:
- **Automated Trading** via Artemis AI engine
- **Manual Trading** with intelligent assistance
- **Portfolio Management** across multiple exchanges
- **Real-time Market Analysis** and alerts
- **Multi-channel Control** (Web, Telegram, Chatbot)

### Key Statistics
- **Primary Exchange:** MEXC (Phase 1)
- **Trading Modes:** Demo & Real
- **Supported Assets:** 100+ cryptocurrency pairs
- **API Endpoints:** 50+ active routes
- **Tech Stack:** Hono (Node.js), PostgreSQL, Redis, React, Cloudflare

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USERS & CLIENTS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Web UI   │  │ Mobile   │  │ Telegram │  │ API      │           │
│  │ (React)  │  │ (Future) │  │ Bot      │  │ Clients  │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└───────┼─────────────┼─────────────┼─────────────┼──────────────────┘
        │             │             │             │
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  CDN  │  DDoS Protection  │  WAF  │  Rate Limiting  │  SSL/TLS ││
│  └─────────────────────────────────────────────────────────────────┘│
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           NGINX LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Reverse Proxy │ SSL Termination │ Rate Limiting │ Load Balance ││
│  │ Port: 443 (HTTPS) → 5000 (HTTP)                                 ││
│  │ Features: Fail2ban, CF IP verification, Health checks           ││
│  └─────────────────────────────────────────────────────────────────┘│
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PM2 PROCESS MANAGER                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  titan-backend (Cluster Mode - N instances)                   │  │
│  │  Port: 5000 (production)                                      │  │
│  │  Features: Auto-restart, Log rotation, Memory limits          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HONO APPLICATION LAYER                          │
│                         (Node.js Runtime)                            │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    CORE MODULES                                  ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ││
│  │  │Dashboard │  │ Trading  │  │Portfolio │  │  Alerts  │       ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       ││
│  │       │             │             │             │               ││
│  │  ┌────┴─────────────┴─────────────┴─────────────┴────┐         ││
│  │  │              Artemis Orchestrator                  │         ││
│  │  │    (AI Engine - Central Brain)                     │         ││
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │         ││
│  │  │  │Autopilot │  │ Manual   │  │  News    │        │         ││
│  │  │  │  Engine  │  │ Trading  │  │ Analysis │        │         ││
│  │  │  └──────────┘  └──────────┘  └──────────┘        │         ││
│  │  └────────────────────────────────────────────────────┘         ││
│  │                                                                  ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       ││
│  │  │Monitoring│  │  Wallet  │  │ Settings │  │ Security │       ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       ││
│  └─────────────────────────────────────────────────────────────────┘│
└───────────────┬────────────────────────────────────┬─────────────────┘
                │                                    │
                ▼                                    ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│   PostgreSQL Database    │          │      Redis Cache         │
│   Port: 5433             │          │      Port: 6379          │
│   - User accounts        │          │   - Sessions             │
│   - Trading history      │          │   - Rate limiting        │
│   - Portfolios           │          │   - Real-time data       │
│   - Alerts               │          │   - Job queue            │
│   - Settings             │          └──────────────────────────┘
└──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │     MEXC     │  │   Telegram   │  │  AI Providers│             │
│  │   Exchange   │  │     Bot      │  │ (OpenAI, etc)│             │
│  │   (Primary)  │  │   Webhook    │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** React Query + Context API
- **UI Library:** Tailwind CSS + Custom Components
- **Deployment:** Cloudflare Pages

#### Backend
- **Framework:** Hono (Lightweight, fast web framework)
- **Runtime:** Node.js 20.x
- **Language:** TypeScript
- **Process Manager:** PM2 (Cluster mode)

#### Data Layer
- **Primary DB:** PostgreSQL 14+ (Port 5433)
- **Cache:** Redis 7+ (Port 6379)
- **ORM:** Native pg driver (parameterized queries)

#### Infrastructure
- **Web Server:** Nginx 1.24+ (Reverse proxy, SSL termination)
- **SSL/TLS:** Cloudflare managed certificates
- **Security:** Fail2ban, Cloudflare WAF, Rate limiting
- **Monitoring:** Custom systemd timers + health checks

#### External Services
- **Exchange:** MEXC (primary)
- **Messaging:** Telegram Bot API
- **AI:** OpenAI GPT-4, Custom models
- **CDN:** Cloudflare

---

## 3. Module Overview

### 3.1 Dashboard Module

**Purpose:** Central hub for portfolio overview, market summary, and quick actions

**Key Features:**
- Real-time portfolio value and P&L
- Market trends and top movers
- Recent activities feed
- Quick trade buttons
- Performance charts

**APIs:**
- `GET /api/dashboard/portfolio-real` - Portfolio summary
- `GET /api/dashboard/trading-real` - Trading stats
- `GET /api/dashboard/charts-real` - Chart data
- `GET /api/dashboard/activities-real` - Activity feed

**Dependencies:**
- PostgreSQL: User portfolio, trading history
- Redis: Real-time price cache
- MEXC API: Live market data

**Status:** ✅ Implemented (with some mock data to remove)

---

### 3.2 Trading Module

**Purpose:** Execute trades manually or via Artemis autopilot

**Components:**

#### 3.2.1 Manual Trading
- Order placement (Market/Limit/Stop)
- Position management
- Order book viewing
- Trade history

**APIs:**
- `POST /api/trading/manual/order` - Place order
- `GET /api/trading/manual/positions` - Get positions
- `GET /api/trading/manual/history` - Trade history
- `DELETE /api/trading/manual/order/:id` - Cancel order

#### 3.2.2 Autopilot (Artemis)
- AI-driven automated trading
- Risk management
- Multi-strategy execution
- Performance tracking

**APIs:**
- `POST /api/autopilot/start` - Start autopilot
- `POST /api/autopilot/stop` - Stop autopilot
- `GET /api/autopilot/status` - Get status
- `PUT /api/autopilot/settings` - Update settings

**Dependencies:**
- PostgreSQL: Orders, positions, settings
- Redis: Real-time price updates, order queue
- MEXC API: Order execution
- Artemis AI: Strategy selection

**Status:** 🔄 Partial implementation (manual complete, autopilot in progress)

---

### 3.3 Portfolio Module

**Purpose:** Track and analyze asset holdings across exchanges

**Key Features:**
- Asset breakdown by exchange
- Profit/Loss tracking (realized/unrealized)
- Historical performance
- Asset allocation charts
- Transaction history

**APIs:**
- `GET /api/portfolio/holdings` - Current holdings
- `GET /api/portfolio/performance` - Performance metrics
- `GET /api/portfolio/transactions` - Transaction history
- `GET /api/portfolio/allocation` - Asset allocation

**Dependencies:**
- PostgreSQL: Holdings, transactions
- MEXC API: Current prices, balances

**Status:** ✅ Implemented

---

### 3.4 Alerts Module

**Purpose:** Price alerts and trading notifications

**Key Features:**
- Price alerts (above/below threshold)
- Trading notifications (order filled, stopped out)
- News alerts
- Multi-channel delivery (Web, Telegram, Email)

**APIs:**
- `POST /api/alerts/create` - Create alert
- `GET /api/alerts/active` - Get active alerts
- `PUT /api/alerts/update/:id` - Update alert
- `DELETE /api/alerts/delete/:id` - Delete alert
- `GET /api/alerts/history` - Alert history

**Dependencies:**
- PostgreSQL: Alert rules, history
- Redis: Price monitoring queue
- Telegram API: Message delivery

**Status:** ✅ Implemented

---

### 3.5 Artemis (AI Engine)

**Purpose:** Central AI orchestrator for trading decisions and user assistance

**Components:**

#### 3.5.1 Chatbot Interface
- Natural language understanding
- Intent detection and routing
- Context-aware responses
- Multi-language support (FA/EN)

**Intents (MVP):**
- `start_autopilot` - Start automated trading
- `set_target` - Set profit target
- `status` - Get system status
- `emergency_stop` - Emergency halt
- `link_wallet` - Connect exchange account

**APIs:**
- `POST /api/chat/intent` - Process user intent
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Chat history

#### 3.5.2 Trading Strategies
- Technical analysis
- Sentiment analysis
- Risk assessment
- Position sizing

**APIs:**
- `POST /api/ai/analyze` - Analyze market
- `GET /api/ai/recommendations` - Get trade recommendations
- `POST /api/ai/backtest` - Backtest strategy

**Dependencies:**
- PostgreSQL: Chat history, AI settings
- OpenAI API: GPT-4 for NLU
- Custom ML models: Technical analysis

**Status:** 🔄 In development (chatbot core ready, strategies in progress)

---

### 3.6 News Module

**Purpose:** Aggregate and analyze crypto news with sentiment analysis

**Key Features:**
- News aggregation from multiple sources
- Sentiment analysis (Positive/Negative/Neutral)
- Impact scoring on portfolio
- Real-time news feed

**APIs:**
- `GET /api/news/feed` - News feed
- `GET /api/news/sentiment/:symbol` - Symbol sentiment
- `GET /api/news/impact` - Portfolio impact analysis

**Dependencies:**
- External news APIs
- AI sentiment analysis
- Redis: News cache

**Status:** ✅ Implemented

---

### 3.7 Monitoring Module

**Purpose:** System health monitoring and performance tracking

**Key Features:**
- Health checks (Database, Redis, Exchange API)
- Performance metrics (Latency, throughput, errors)
- Uptime tracking
- Alert triggering

**APIs:**
- `GET /api/health` - Public health check (simple)
- `GET /api/health/full` - Admin health check (detailed, auth required)
- `GET /api/monitoring/metrics` - System metrics
- `GET /api/monitoring/logs` - Recent logs

**Dependencies:**
- All system components (for health checks)

**Status:** ✅ Implemented

---

### 3.8 Wallet Module

**Purpose:** Manage exchange connections and wallet balances

**Key Features:**
- Exchange account linking (API keys)
- Balance tracking
- Deposit/Withdrawal tracking
- Multi-exchange support (Phase 2)

**APIs:**
- `POST /api/wallet/connect` - Connect exchange
- `GET /api/wallet/balances` - Get balances
- `GET /api/wallet/deposits` - Deposit history
- `GET /api/wallet/withdrawals` - Withdrawal history
- `POST /api/wallet/transfer` - Internal transfer

**Dependencies:**
- PostgreSQL: API keys (encrypted), balance history
- MEXC API: Live balances

**Status:** 🔄 Partial implementation (MEXC only, Phase 1)

---

### 3.9 Settings Module

**Purpose:** User and system configuration management

**Key Features:**
- Trading settings (Risk levels, TP/SL defaults)
- Notification preferences (Email, Telegram, Push)
- Security settings (2FA, API key management)
- AI provider configuration

**APIs:**
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings (with validation)
- `GET /api/settings/schema` - Get settings JSON schema

**Dependencies:**
- PostgreSQL: Settings storage
- JSON Schema: Validation

**Status:** 🔄 In development (basic CRUD done, schema validation pending)

---

### 3.10 Security Module

**Purpose:** Authentication, authorization, and security monitoring

**Key Features:**
- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Audit logging
- CSP violation reporting

**APIs:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/security/csp-report` - CSP violation reporting (Phase 2)

**Dependencies:**
- PostgreSQL: Users, sessions, audit logs
- Redis: Session storage, rate limiting

**Status:** ✅ Implemented (CSP reporting pending)

---

### 3.11 Telegram Control

**Purpose:** Control Titan via Telegram bot

**Key Features:**
- Secure account linking (OTP-based)
- Command execution (status, start/stop autopilot, set target)
- Notifications delivery
- Two-way communication

**Commands (MVP):**
- `/start` - Welcome and instructions
- `/link <OTP>` - Link Telegram account
- `/status` - Get portfolio and autopilot status
- `/start_autopilot <mode>` - Start autopilot (demo/real)
- `/stop` - Emergency stop
- `/target <amount>` - Set profit target
- `/help` - Command list

**APIs:**
- `POST /api/integrations/telegram/start-link` - Generate OTP
- `POST /api/integrations/telegram/webhook` - Telegram webhook
- `POST /api/integrations/telegram/send` - Send message

**Dependencies:**
- PostgreSQL: Telegram user linking
- Telegram Bot API
- Artemis orchestrator (for command execution)

**Status:** 🔄 In development (OTP + webhook skeleton ready)

---

## 4. API Reference

### 4.1 API Inventory

| Module | Endpoint | Method | Auth | Input Schema | Output Schema | DB Dependency | Status |
|--------|----------|--------|------|--------------|---------------|---------------|--------|
| **Auth** | `/api/auth/register` | POST | No | `{email, password, name}` | `{user, token}` | PostgreSQL | ✅ |
| **Auth** | `/api/auth/login` | POST | No | `{email, password}` | `{user, token}` | PostgreSQL | ✅ |
| **Auth** | `/api/auth/logout` | POST | Yes | - | `{success}` | Redis | ✅ |
| **Auth** | `/api/auth/me` | GET | Yes | - | `{user}` | PostgreSQL | ✅ |
| **Dashboard** | `/api/dashboard/portfolio-real` | GET | Yes | `?period=1d/1w/1m` | `{value, change, assets[]}` | PostgreSQL, MEXC | 🔄 |
| **Dashboard** | `/api/dashboard/trading-real` | GET | Yes | - | `{positions, pnl, orders[]}` | PostgreSQL | 🔄 |
| **Dashboard** | `/api/dashboard/charts-real` | GET | Yes | `?period=1d/1w` | `{portfolio_chart[], allocation[]}` | PostgreSQL | 🔄 |
| **Dashboard** | `/api/dashboard/activities-real` | GET | Yes | `?limit=20` | `{activities[]}` | PostgreSQL | 🔄 |
| **Trading** | `/api/trading/manual/order` | POST | Yes | `{symbol, side, type, quantity, price?}` | `{order}` | PostgreSQL, MEXC | ✅ |
| **Trading** | `/api/trading/manual/positions` | GET | Yes | - | `{positions[]}` | PostgreSQL, MEXC | ✅ |
| **Trading** | `/api/trading/manual/history` | GET | Yes | `?limit=50` | `{trades[]}` | PostgreSQL | ✅ |
| **Trading** | `/api/trading/manual/order/:id` | DELETE | Yes | - | `{success}` | PostgreSQL, MEXC | ✅ |
| **Autopilot** | `/api/autopilot/start` | POST | Yes | `{mode, risk_level, max_trades}` | `{autopilot_id, status}` | PostgreSQL, Redis | 🔄 |
| **Autopilot** | `/api/autopilot/stop` | POST | Yes | - | `{success}` | PostgreSQL, Redis | 🔄 |
| **Autopilot** | `/api/autopilot/status` | GET | Yes | - | `{status, stats}` | PostgreSQL | 🔄 |
| **Autopilot** | `/api/autopilot/settings` | PUT | Yes | `{risk_level, max_trades, tp, sl}` | `{success}` | PostgreSQL | 🔄 |
| **Portfolio** | `/api/portfolio/holdings` | GET | Yes | - | `{holdings[]}` | PostgreSQL, MEXC | ✅ |
| **Portfolio** | `/api/portfolio/performance` | GET | Yes | `?period=1w` | `{total_pnl, roi, chart[]}` | PostgreSQL | ✅ |
| **Portfolio** | `/api/portfolio/transactions` | GET | Yes | `?limit=100` | `{transactions[]}` | PostgreSQL | ✅ |
| **Portfolio** | `/api/portfolio/allocation` | GET | Yes | - | `{allocation[]}` | PostgreSQL | ✅ |
| **Alerts** | `/api/alerts/create` | POST | Yes | `{symbol, condition, threshold}` | `{alert}` | PostgreSQL | ✅ |
| **Alerts** | `/api/alerts/active` | GET | Yes | - | `{alerts[]}` | PostgreSQL | ✅ |
| **Alerts** | `/api/alerts/update/:id` | PUT | Yes | `{threshold?, enabled?}` | `{success}` | PostgreSQL | ✅ |
| **Alerts** | `/api/alerts/delete/:id` | DELETE | Yes | - | `{success}` | PostgreSQL | ✅ |
| **Alerts** | `/api/alerts/history` | GET | Yes | `?limit=50` | `{triggered[]}` | PostgreSQL | ✅ |
| **Chatbot** | `/api/chat/intent` | POST | Yes | `{intent, params}` | `{response, actions[]}` | PostgreSQL | 🔄 |
| **Chatbot** | `/api/chat/message` | POST | Yes | `{message}` | `{response}` | PostgreSQL, OpenAI | 🔄 |
| **Chatbot** | `/api/chat/history` | GET | Yes | `?limit=50` | `{messages[]}` | PostgreSQL | 🔄 |
| **AI** | `/api/ai/analyze` | POST | Yes | `{symbol, timeframe}` | `{analysis}` | OpenAI, MEXC | 🔄 |
| **AI** | `/api/ai/recommendations` | GET | Yes | - | `{recommendations[]}` | PostgreSQL, AI | 🔄 |
| **AI** | `/api/ai/backtest` | POST | Yes | `{strategy, params}` | `{results}` | PostgreSQL | 🔄 |
| **News** | `/api/news/feed` | GET | Yes | `?limit=20` | `{news[]}` | Redis | ✅ |
| **News** | `/api/news/sentiment/:symbol` | GET | Yes | - | `{sentiment, score}` | AI | ✅ |
| **News** | `/api/news/impact` | GET | Yes | - | `{impact[]}` | PostgreSQL, AI | ✅ |
| **Health** | `/api/health` | GET | No | - | `{status, uptime}` | All | ✅ |
| **Health** | `/api/health/full` | GET | Basic Auth | - | `{status, services[], memory}` | All | ✅ |
| **Monitoring** | `/api/monitoring/metrics` | GET | Yes (Admin) | - | `{metrics}` | Redis | ✅ |
| **Wallet** | `/api/wallet/connect` | POST | Yes | `{exchange, api_key, api_secret}` | `{success}` | PostgreSQL, MEXC | 🔄 |
| **Wallet** | `/api/wallet/balances` | GET | Yes | - | `{balances[]}` | PostgreSQL, MEXC | 🔄 |
| **Wallet** | `/api/wallet/deposits` | GET | Yes | `?limit=50` | `{deposits[]}` | PostgreSQL | 🔄 |
| **Wallet** | `/api/wallet/withdrawals` | GET | Yes | `?limit=50` | `{withdrawals[]}` | PostgreSQL | 🔄 |
| **Settings** | `/api/settings` | GET | Yes | - | `{settings{}}` | PostgreSQL | 🔄 |
| **Settings** | `/api/settings` | PUT | Yes | `{settings{}}` | `{success}` | PostgreSQL | 🔄 |
| **Settings** | `/api/settings/schema` | GET | Yes | - | `{schema}` | - | ❌ |
| **Telegram** | `/api/integrations/telegram/start-link` | POST | Yes | - | `{otp, expires_at}` | PostgreSQL | ❌ |
| **Telegram** | `/api/integrations/telegram/webhook` | POST | No | `{telegram_payload}` | `{success}` | PostgreSQL | ❌ |
| **Telegram** | `/api/integrations/telegram/send` | POST | Yes | `{chat_id, message}` | `{success}` | Telegram API | ❌ |
| **Security** | `/api/security/csp-report` | POST | No | `{csp_report}` | `{success}` | PostgreSQL/File | ❌ |

**Legend:**
- ✅ Implemented and tested
- 🔄 Partially implemented or using mock data
- ❌ Not implemented yet (planned)

### 4.2 Authentication Flow

**JWT-based authentication:**

1. User registers/logs in → Receives JWT token
2. Frontend stores token (localStorage/sessionStorage)
3. All API requests include `Authorization: Bearer <token>` header
4. Backend validates token on protected routes
5. Token refresh available at `/api/auth/refresh`

**Token Expiry:**
- Access Token: 24 hours
- Refresh Token: 7 days

---

## 5. User Flows

### 5.1 Demo Mode Trading Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  User Login (Demo Mode)                          │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dashboard (Demo Portfolio)                          │
│  - Portfolio Value: $10,000 (virtual)                           │
│  - Available Symbols: All MEXC pairs                            │
│  - No real balance checking                                     │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Artemis AI Chatbot                                  │
│  User: "Start autopilot in demo mode"                           │
│  Intent: start_autopilot                                        │
│  Params: {mode: "demo", risk: "medium"}                         │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│           Autopilot Engine (Demo Mode)                          │
│  1. Fetch demo account settings                                 │
│  2. Analyze market (real data from MEXC)                        │
│  3. Select trading strategy                                     │
│  4. Place SIMULATED orders (no exchange API calls)              │
│  5. Track positions in demo_positions table                     │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Order Execution (Demo)                              │
│  - Order placed in demo_orders table                            │
│  - Immediate fill simulation (market order)                     │
│  - Or wait for price (limit order simulation)                   │
│  - Update demo portfolio balances                               │
│  - No MEXC API calls                                            │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dashboard Update (Demo)                             │
│  - Show new position                                            │
│  - Update unrealized P&L                                        │
│  - Display order history                                        │
│  - Show notifications                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points (Demo Mode):**
- ✅ All trades are simulated
- ✅ Uses real market data from MEXC
- ✅ No real money involved
- ✅ Separate database tables: `demo_orders`, `demo_positions`, `demo_balances`
- ✅ Cannot mix with real mode

### 5.2 Real Mode Trading Flow

```
┌─────────────────────────────────────────────────────────────────┐
│             User Login + Exchange Connection                     │
│  1. User logs in                                                │
│  2. Connects MEXC account (API Key + Secret)                    │
│  3. System verifies credentials                                 │
│  4. Fetches real balances                                       │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dashboard (Real Portfolio)                          │
│  - Portfolio Value: $5,234.56 (from MEXC)                       │
│  - Available Balance: $2,000 USDT                               │
│  - Open Positions: 3 (BTC, ETH, SOL)                            │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│         User Initiates Trade (Manual or Autopilot)              │
│  Option A: Manual - "Buy 0.01 BTC at market"                    │
│  Option B: Autopilot - "Start autopilot in real mode"          │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Pre-Trade Validations (Real Mode)                  │
│  1. Check user mode: TRADING_MODE=real ✓                       │
│  2. Verify exchange connection: MEXC connected ✓                │
│  3. Check available balance: $2,000 USDT ✓                     │
│  4. Validate order: 0.01 BTC × $50,000 = $500 < $2,000 ✓       │
│  5. Risk check: Within risk limits ✓                           │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Order Placement (MEXC API)                          │
│  1. Prepare order payload                                       │
│  2. Call MEXC /api/v3/order endpoint                            │
│  3. Sign request with API secret                                │
│  4. Receive order confirmation                                  │
│  5. Store order in real_orders table                            │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Order Monitoring & Updates                          │
│  1. Poll MEXC /api/v3/order/status                              │
│  2. Update order status: PENDING → FILLED                       │
│  3. Update position in real_positions table                     │
│  4. Update balance: $2,000 → $1,500 USDT                       │
│  5. Send notification (Telegram/Web)                            │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              Dashboard Update (Real)                             │
│  - Show new position: 0.01 BTC @ $50,000                        │
│  - Update P&L as price changes                                  │
│  - Display order in history                                     │
│  - Alert if stop-loss triggered                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points (Real Mode):**
- ✅ Real money involved (requires caution)
- ✅ All orders sent to MEXC exchange
- ✅ Real-time balance updates
- ✅ Separate database tables: `real_orders`, `real_positions`, `real_balances`
- ✅ Additional safety checks:
  - Balance verification before order
  - Risk limits enforcement
  - Max concurrent trades limit
  - Emergency stop available

### 5.3 Mode Switching (Demo ↔ Real)

**Restrictions:**
- ❌ Cannot switch modes with open positions
- ❌ Demo positions cannot be transferred to real mode
- ✅ User must close all positions before switching
- ✅ Settings carry over (risk levels, preferences)

**Process:**
```sql
-- Check if user can switch modes
SELECT COUNT(*) FROM demo_positions WHERE user_id = ? AND status = 'open'; -- Must be 0
SELECT COUNT(*) FROM real_positions WHERE user_id = ? AND status = 'open'; -- Must be 0

-- If clear, update user mode
UPDATE users SET trading_mode = 'real' WHERE id = ?;

-- Audit log
INSERT INTO audit_logs (user_id, action, details) 
VALUES (?, 'mode_switch', '{"from": "demo", "to": "real"}');
```

---

## 6. Technical Risks & Debt

### 6.1 High Priority Risks

| Risk ID | Category | Description | Severity | Likelihood | Impact |
|---------|----------|-------------|----------|------------|--------|
| **R-001** | Security | Database credentials in `.env` file | High | Medium | Critical |
| **R-002** | Data Integrity | Mixed demo/real data in same tables | High | High | High |
| **R-003** | Reliability | No automated backup system | High | Low | Critical |
| **R-004** | Performance | Mock data in production endpoints | Medium | High | Medium |
| **R-005** | Scalability | Single PM2 instance (not clustered) | Medium | Medium | Medium |
| **R-006** | Security | No API key rotation mechanism | High | Low | High |
| **R-007** | Exchange | Only MEXC supported (single point of failure) | Medium | Medium | High |
| **R-008** | Monitoring | No real-time alerting on failures | High | Medium | High |
| **R-009** | Testing | No automated test suite | High | High | Medium |
| **R-010** | Documentation | API contracts not documented | Medium | High | Medium |

### 6.2 Medium Priority Risks

| Risk ID | Category | Description | Severity | Likelihood | Impact |
|---------|----------|-------------|----------|------------|--------|
| **R-011** | UX | No i18n (English only) | Low | High | Low |
| **R-012** | Security | CSP not enforced (Report-Only) | Medium | Medium | Medium |
| **R-013** | Reliability | No circuit breaker for MEXC API | Medium | Medium | Medium |
| **R-014** | Performance | No Redis connection pool | Low | Low | Low |
| **R-015** | Security | JWT tokens stored in localStorage | Medium | Low | Medium |

### 6.3 Technical Debt Inventory

| Debt ID | Component | Description | Effort (hours) | Priority |
|---------|-----------|-------------|----------------|----------|
| **TD-001** | Dashboard | Remove mock data from dashboard endpoints | 8 | High |
| **TD-002** | Database | Separate demo/real tables (migration) | 16 | High |
| **TD-003** | PM2 | Migrate to ecosystem.config.js with clustering | 4 | High |
| **TD-004** | Testing | Add contract tests for all endpoints | 24 | High |
| **TD-005** | Documentation | Create API contracts map (contracts.yml) | 8 | High |
| **TD-006** | i18n | Extract strings and implement i18n | 16 | Medium |
| **TD-007** | Settings | Implement JSON Schema validation | 8 | Medium |
| **TD-008** | Telegram | Complete OTP linking + webhook handlers | 12 | Medium |
| **TD-009** | Chatbot | Implement all 5 MVP intents | 16 | High |
| **TD-010** | Security | Add CSP enforcement (after Report-Only) | 4 | Medium |
| **TD-011** | Monitoring | Add real-time alerting (Telegram/Email) | 8 | Medium |
| **TD-012** | Backup | Automated backup with testing | 8 | High |
| **TD-013** | CI/CD | GitHub Actions pipeline | 12 | Medium |
| **TD-014** | Exchange | Multi-exchange abstraction layer | 24 | Low |
| **TD-015** | Feature Flags | Implement feature flag system | 8 | High |

**Total Estimated Effort:** 176 hours (~4-5 weeks with one developer)

---

## 7. Mitigation Strategies

### 7.1 Immediate Actions (This Sprint)

#### ✅ Completed
1. **Database Credentials** (R-001)
   - ✅ Migrated to environment variables
   - ✅ No credentials in source code
   - ✅ `.env` in `.gitignore`

2. **Health Endpoint Security**
   - ✅ Split into public (`/api/health`) and admin (`/api/health/full`)
   - ✅ Basic Auth on admin endpoint
   - ✅ Credentials stored in `.htpasswd` file (not in repository)

3. **Fail2ban Implementation**
   - ✅ Auto-ban after 15 violations
   - ✅ 157 violations detected in logs
   - ✅ Monitoring 429 and 403 errors

4. **Cloudflare IP Auto-Update**
   - ✅ Systemd timer (weekly + boot)
   - ✅ Automatic nginx reload
   - ✅ Rollback on failure

#### 🔄 In Progress (Current Sprint)
1. **PM2 Migration** (TD-003)
   - Create `ecosystem.config.js`
   - Enable cluster mode
   - Add log rotation
   - Memory limits

2. **Data Separation** (R-002, TD-002)
   - Implement `DEMO_MODE` and `TRADING_MODE` flags
   - Ensure demo/real data never mixes
   - Add validation on all trading endpoints

3. **MEXC-Only Enforcement** (R-007)
   - Validate `exchange === 'mexc'` on all requests
   - Disable other exchanges behind feature flags
   - Return 400 for unsupported exchanges

4. **Chatbot Core Intents** (TD-009)
   - Implement 5 MVP intents
   - Artemis orchestrator integration
   - Test each intent with curl

5. **Contract Tests** (R-009, TD-004)
   - Create `tests/contracts/` folder
   - Write smoke tests for 10+ key endpoints
   - Add `npm run test:contracts` script

6. **Contracts Map** (R-010, TD-005)
   - Create `contracts/contracts.yml`
   - Document all endpoints for 6+ modules
   - Include schemas and status

7. **CSP Report-Only** (R-012, TD-010)
   - Enable CSP headers in Nginx
   - Create `/api/security/csp-report` endpoint
   - Log violations to `/var/log/csp-report.log`

8. **Uptime Monitor** (R-008)
   - Create systemd service + timer
   - Health check every 1 minute
   - Log to `/var/log/titan-uptime.log`

### 7.2 Short-Term (Next 2-4 Weeks)

1. **Remove Mock Data** (R-004, TD-001)
   - Audit all endpoints
   - Replace mock responses with real DB queries
   - Test with real MEXC data

2. **Telegram Integration** (TD-008)
   - Complete OTP-based linking
   - Implement webhook handlers
   - Test MVP commands: `/status`, `/start_autopilot`, `/stop`, `/target`

3. **Settings Schema** (TD-007)
   - Create JSON Schema file
   - Implement validation
   - Add audit logging

4. **i18n Foundation** (R-011, TD-006)
   - Extract 30+ key strings
   - Create FA/EN translation files
   - Add language switching

5. **Automated Backups** (R-003, TD-012)
   - Daily PostgreSQL backups
   - Retention policy (7 days)
   - Test restore procedure

6. **CI/CD Pipeline** (TD-013)
   - GitHub Actions workflow
   - Automated tests on PR
   - Deployment automation

### 7.3 Medium-Term (1-2 Months)

1. **Multi-Exchange Support** (R-007, TD-014)
   - Abstraction layer for exchanges
   - Add Binance support
   - Exchange-agnostic order interface

2. **Advanced Monitoring** (R-008, TD-011)
   - Real-time alerting (Telegram/Email)
   - Performance dashboards
   - Error tracking (Sentry)

3. **Security Hardening** (R-006, R-015)
   - API key rotation mechanism
   - JWT in httpOnly cookies
   - Rate limiting per user

4. **Performance Optimization**
   - Redis connection pooling
   - Query optimization
   - Caching strategy

5. **Documentation**
   - OpenAPI/Swagger docs
   - Developer guides
   - User manuals

### 7.4 Long-Term (2-6 Months)

1. **Scalability**
   - Horizontal scaling (multiple PM2 instances)
   - Load balancing
   - Database read replicas

2. **Advanced Features**
   - Copy trading
   - Social trading
   - Strategy marketplace

3. **Mobile App**
   - React Native app
   - Push notifications
   - Biometric auth

---

## 8. Related Documents

### 8.1 Architecture Documents
- [ARA-002: Database Schema](./ARA-002-database-schema.md) *(To be created)*
- [ARA-003: API Design Guidelines](./ARA-003-api-guidelines.md) *(To be created)*
- [ARA-004: Security Architecture](./ARA-004-security.md) *(To be created)*

### 8.2 Development Guides
- [Sprint A Tasks](../../SPRINT_A_TASKS.md) ✅
- [Developer Message](../../DEVELOPER_MESSAGE.md) ✅
- [PR Success Summary](../../PR_SUCCESS_SUMMARY.md) ✅

### 8.3 Operational Docs
- [Security Hardening](../../SECURITY_HARDENING_COMPLETE.md) ✅
- [Backup Setup](../../BACKUP_SETUP.md) ✅
- [SSL Configuration](../../apply-ssl-enhancements.sh) ✅

### 8.4 Testing
- [AI Testing Guide](../../AI_TESTING_GUIDE.md) ✅
- [Contract Tests](../../tests/contracts/) *(To be created)*

### 8.5 External References
- [Hono Framework](https://hono.dev/)
- [MEXC API Documentation](https://mxcdevelop.github.io/APIDoc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)

---

## 9. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-24 | System Architecture Team | Initial creation - Complete project overview |

---

## 10. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | @raeisisep-star | 2025-10-24 | *Pending Review* |
| Lead Developer | AI Assistant | 2025-10-24 | ✅ |
| Security Lead | AI Assistant | 2025-10-24 | ✅ |

---

**Document Status:** ✅ Complete - Ready for Review

**Next Steps:**
1. Review and approve ARA-001
2. Begin Sprint A implementation
3. Create related architecture documents (ARA-002, ARA-003, ARA-004)
4. Update as implementation progresses

---

*This document is maintained as part of the Titan Trading Platform project. Last updated: 2025-10-24*
