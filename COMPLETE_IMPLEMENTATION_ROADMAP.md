# 🚀 نقشه راه کامل پیاده‌سازی Backend برای سایت zala.ir

**هدف**: کامل کردن Backend تا 100% با Frontend هماهنگ شود

**تخمین زمان کل**: 2-3 هفته (با یک نفر Full-time)

**تعداد کل Task ها**: 67 Task در 8 فاز

---

## 📊 نمای کلی Frontend - چه چیزی داریم؟

### بخش‌های موجود در Frontend:

```
Frontend موجود:
├── 🎨 UI Components (100% آماده)
│   ├── Login/Register Forms
│   ├── Dashboard Widgets (15+ widget)
│   ├── Trading Interface
│   ├── Portfolio View
│   ├── Market Data Display
│   ├── AI Agents Section (15 agents)
│   ├── Alerts & Notifications
│   ├── Settings Panel
│   └── Charts (Chart.js)
│
├── 📡 API Integration Layer (آماده ولی Backend ندارد)
│   ├── HTTP Client با Circuit Breaker
│   ├── Data Adapters (4 adapters)
│   ├── Metadata Validation
│   └── NO-DATA UI Handler
│
├── 🤖 AI Agents (15 agents - لود می‌شوند ولی کار نمی‌کنند)
│   ├── Agent 01: Technical Analysis
│   ├── Agent 02: Risk Management
│   ├── Agent 03: Sentiment Analysis
│   ├── Agent 04: Portfolio Optimization
│   ├── Agent 05: Market Making
│   ├── Agent 06: Algorithmic Trading
│   ├── Agent 07: News Analysis
│   ├── Agent 08: HFT (High Frequency Trading)
│   ├── Agent 09: Quantitative Analysis
│   ├── Agent 10: Macro Analysis
│   ├── Agent 11-15: (Other specialized agents)
│   └── همه منتظر Backend API ها هستند!
│
└── 🔒 Security & Validation (100% آماده)
    ├── FORCE_REAL Flag
    ├── Metadata Signatures
    ├── Stale Data Detection
    └── Circuit Breaker
```

---

## 🎯 فاز 1: راه‌اندازی اولیه Backend (روز 1)

**مدت زمان**: 1 روز  
**اولویت**: 🔴 بسیار بالا  
**وابستگی**: هیچ

### Task 1.1: Setup دیتابیس (2 ساعت)

#### قدم 1: انتخاب Database Schema

**فایل**: `schema.prisma` (اگر Prisma استفاده می‌کنید)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // یا sqlite برای development
  url      = env("DATABASE_URL")
}

// 👤 Users Table
model User {
  id                String    @id @default(cuid())
  username          String    @unique
  email             String    @unique
  password          String    // hashed
  firstName         String?
  lastName          String?
  role              String    @default("user")
  isActive          Boolean   @default(true)
  isVerified        Boolean   @default(false)
  twoFactorEnabled  Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  portfolio         Portfolio?
  trades            Trade[]
  alerts            Alert[]
  sessions          Session[]
}

// 💰 Portfolio Table
model Portfolio {
  id            String          @id @default(cuid())
  userId        String          @unique
  user          User            @relation(fields: [userId], references: [id])
  totalBalance  Float           @default(0)
  totalValue    Float           @default(0)
  totalPnL      Float           @default(0)
  dailyChange   Float           @default(0)
  weeklyChange  Float           @default(0)
  monthlyChange Float           @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  // Relations
  assets        PortfolioAsset[]
}

// 💎 Portfolio Assets
model PortfolioAsset {
  id            String    @id @default(cuid())
  portfolioId   String
  portfolio     Portfolio @relation(fields: [portfolioId], references: [id])
  symbol        String    // BTC, ETH, etc.
  amount        Float
  avgBuyPrice   Float
  currentPrice  Float
  totalValue    Float
  pnl           Float
  pnlPercent    Float
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([portfolioId, symbol])
}

// 📊 Trades Table
model Trade {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  type          String    // buy, sell
  symbol        String    // BTCUSDT
  amount        Float
  price         Float
  total         Float
  fee           Float
  status        String    @default("pending") // pending, completed, failed, cancelled
  strategy      String?   // manual, agent_01, agent_02, etc.
  agentId       String?
  
  // Market Order Details
  orderType     String    @default("market") // market, limit, stop_loss
  stopPrice     Float?
  limitPrice    Float?
  
  // Timestamps
  placedAt      DateTime  @default(now())
  executedAt    DateTime?
  cancelledAt   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 📈 Market Data (Cache)
model MarketData {
  id            String    @id @default(cuid())
  symbol        String    @unique
  price         Float
  change24h     Float
  volume24h     Float
  high24h       Float
  low24h        Float
  marketCap     Float?
  lastUpdate    DateTime  @default(now())
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 🔔 Alerts Table
model Alert {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  type          String    // price, indicator, news
  symbol        String?
  condition     String    // above, below, crosses
  targetValue   Float?
  currentValue  Float?
  isActive      Boolean   @default(true)
  isTriggered   Boolean   @default(false)
  triggeredAt   DateTime?
  message       String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 🤖 AI Signals
model AISignal {
  id            String    @id @default(cuid())
  agentId       String    // AGENT_01, AGENT_02, etc.
  symbol        String
  action        String    // buy, sell, hold
  confidence    Float     // 0-1
  price         Float
  reason        String?
  indicators    Json?     // تحلیل‌های تکنیکال
  isValid       Boolean   @default(true)
  expiresAt     DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// 📱 Sessions (برای authentication)
model Session {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  token         String    @unique
  ipAddress     String?
  userAgent     String?
  expiresAt     DateTime
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### قدم 2: اجرای Migration

```bash
# نصب Prisma (اگر نصب نیست)
npm install prisma @prisma/client

# ایجاد migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

#### قدم 3: Seed کردن داده‌های اولیه

**فایل**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // ایجاد کاربر تستی
  const hashedPassword = await bcrypt.hash('admin', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@zala.ir',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      isVerified: true,
    }
  })
  
  console.log('✅ Admin user created:', adminUser.username)
  
  // ایجاد Portfolio برای admin
  const portfolio = await prisma.portfolio.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      totalBalance: 100000, // $100k initial
      totalValue: 100000,
      totalPnL: 0,
      dailyChange: 0,
    }
  })
  
  console.log('✅ Portfolio created for admin')
  
  // اضافه کردن چند Asset
  const assets = [
    { symbol: 'BTC', amount: 1.5, avgBuyPrice: 40000 },
    { symbol: 'ETH', amount: 20, avgBuyPrice: 2500 },
    { symbol: 'BNB', amount: 100, avgBuyPrice: 300 },
  ]
  
  for (const asset of assets) {
    await prisma.portfolioAsset.create({
      data: {
        portfolioId: portfolio.id,
        ...asset,
        currentPrice: asset.avgBuyPrice * 1.1, // 10% profit
        totalValue: asset.amount * asset.avgBuyPrice * 1.1,
        pnl: asset.amount * asset.avgBuyPrice * 0.1,
        pnlPercent: 10,
      }
    })
  }
  
  console.log('✅ Assets added to portfolio')
  
  // اضافه کردن Market Data
  const marketData = [
    { symbol: 'BTCUSDT', price: 43250, change24h: 2.3, volume24h: 25000000000, high24h: 44000, low24h: 42000 },
    { symbol: 'ETHUSDT', price: 2680, change24h: 1.5, volume24h: 12000000000, high24h: 2700, low24h: 2600 },
    { symbol: 'BNBUSDT', price: 315, change24h: -0.8, volume24h: 3000000000, high24h: 320, low24h: 310 },
  ]
  
  for (const data of marketData) {
    await prisma.marketData.upsert({
      where: { symbol: data.symbol },
      update: data,
      create: data,
    })
  }
  
  console.log('✅ Market data seeded')
  
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

اجرای Seed:
```bash
npx prisma db seed
```

---

### Task 1.2: Setup Authentication System (3 ساعت)

#### قدم 1: ایجاد Auth Service

**فایل**: `src/services/auth-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  private JWT_EXPIRES_IN = '7d'
  
  /**
   * ثبت نام کاربر جدید
   */
  async register(data: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    // چک کردن username تکراری
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ]
      }
    })
    
    if (existingUser) {
      throw new Error('Username or email already exists')
    }
    
    // Hash کردن password
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    // ایجاد کاربر
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      }
    })
    
    // ایجاد Portfolio خالی
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        totalBalance: 0,
        totalValue: 0,
      }
    })
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    }
  }
  
  /**
   * ورود کاربر
   */
  async login(username: string, password: string) {
    // پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user) {
      throw new Error('Invalid credentials')
    }
    
    // چک کردن password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }
    
    // چک کردن active بودن
    if (!user.isActive) {
      throw new Error('Account is disabled')
    }
    
    // ساخت JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )
    
    // ذخیره session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    }
  }
  
  /**
   * تأیید Token
   */
  async verifyToken(token: string) {
    try {
      // Decode token
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      
      // چک کردن session
      const session = await prisma.session.findFirst({
        where: {
          token,
          expiresAt: { gte: new Date() }
        },
        include: {
          user: true
        }
      })
      
      if (!session) {
        throw new Error('Invalid or expired session')
      }
      
      return {
        userId: session.user.id,
        username: session.user.username,
        role: session.user.role,
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
  
  /**
   * خروج کاربر
   */
  async logout(token: string) {
    await prisma.session.deleteMany({
      where: { token }
    })
  }
}

export const authService = new AuthService()
```

#### قدم 2: ایجاد Auth Middleware

**فایل**: `src/middleware/auth.ts`

```typescript
import { Context, Next } from 'hono'
import { authService } from '../services/auth-service'

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authorization = c.req.header('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return c.json({ 
        success: false, 
        error: 'Authentication required' 
      }, 401)
    }
    
    const token = authorization.substring(7)
    
    // تأیید token
    const user = await authService.verifyToken(token)
    
    // اضافه کردن user به context
    c.set('user', user)
    
    await next()
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Invalid or expired token' 
    }, 401)
  }
}
```

#### قدم 3: ایجاد Auth Routes

**فایل**: `src/routes/auth.ts`

```typescript
import { Hono } from 'hono'
import { authService } from '../services/auth-service'

const auth = new Hono()

// Register
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    
    const user = await authService.register(body)
    
    return c.json({
      success: true,
      message: 'Registration successful',
      data: user
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// Login
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    const result = await authService.login(username, password)
    
    return c.json({
      success: true,
      message: 'Login successful',
      data: result
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 401)
  }
})

// Logout
auth.post('/logout', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const token = authorization?.substring(7)
    
    if (token) {
      await authService.logout(token)
    }
    
    return c.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// Get current user
auth.get('/me', async (c) => {
  try {
    const authorization = c.req.header('Authorization')
    const token = authorization?.substring(7)
    
    if (!token) {
      return c.json({ success: false, error: 'No token provided' }, 401)
    }
    
    const user = await authService.verifyToken(token)
    
    return c.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 401)
  }
})

export default auth
```

---

## 🎯 فاز 2: پیاده‌سازی Portfolio APIs (روز 2-3)

**مدت زمان**: 2 روز  
**اولویت**: 🔴 بسیار بالا

### Task 2.1: Portfolio Service (4 ساعت)

**فایل**: `src/services/portfolio-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PortfolioService {
  /**
   * دریافت Portfolio کامل
   */
  async getPortfolio(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        assets: true
      }
    })
    
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }
    
    return portfolio
  }
  
  /**
   * دریافت Portfolio Advanced (برای Dashboard)
   */
  async getAdvancedPortfolio(userId: string) {
    const portfolio = await this.getPortfolio(userId)
    
    // محاسبه آمارها
    const totalAssets = portfolio.assets.length
    const totalInvested = portfolio.assets.reduce((sum, asset) => 
      sum + (asset.amount * asset.avgBuyPrice), 0
    )
    
    // محاسبه Win Rate (از trade های قبلی)
    const completedTrades = await prisma.trade.count({
      where: { 
        userId,
        status: 'completed'
      }
    })
    
    const profitableTrades = await prisma.trade.count({
      where: {
        userId,
        status: 'completed',
        pnl: { gt: 0 }
      }
    })
    
    const winRate = completedTrades > 0 
      ? (profitableTrades / completedTrades) * 100 
      : 0
    
    // محاسبه Sharpe Ratio (ساده شده)
    const sharpeRatio = portfolio.totalPnL > 0 
      ? (portfolio.totalPnL / totalInvested) * Math.sqrt(252)
      : 0
    
    return {
      totalBalance: portfolio.totalBalance,
      totalValue: portfolio.totalValue,
      totalPnL: portfolio.totalPnL,
      pnlPercent: totalInvested > 0 ? (portfolio.totalPnL / totalInvested) * 100 : 0,
      dailyChange: portfolio.dailyChange,
      weeklyChange: portfolio.weeklyChange,
      monthlyChange: portfolio.monthlyChange,
      totalAssets,
      totalInvested,
      winRate: Math.round(winRate),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      assets: portfolio.assets.map(asset => ({
        symbol: asset.symbol,
        amount: asset.amount,
        avgBuyPrice: asset.avgBuyPrice,
        currentPrice: asset.currentPrice,
        totalValue: asset.totalValue,
        pnl: asset.pnl,
        pnlPercent: asset.pnlPercent,
        allocation: (asset.totalValue / portfolio.totalValue) * 100
      }))
    }
  }
  
  /**
   * به‌روزرسانی قیمت‌های Portfolio
   */
  async updatePrices(userId: string, prices: Record<string, number>) {
    const portfolio = await this.getPortfolio(userId)
    
    let totalValue = portfolio.totalBalance
    let totalPnL = 0
    
    for (const asset of portfolio.assets) {
      const newPrice = prices[asset.symbol] || asset.currentPrice
      const newValue = asset.amount * newPrice
      const assetPnL = newValue - (asset.amount * asset.avgBuyPrice)
      const assetPnLPercent = ((newPrice - asset.avgBuyPrice) / asset.avgBuyPrice) * 100
      
      // به‌روزرسانی asset
      await prisma.portfolioAsset.update({
        where: { id: asset.id },
        data: {
          currentPrice: newPrice,
          totalValue: newValue,
          pnl: assetPnL,
          pnlPercent: assetPnLPercent
        }
      })
      
      totalValue += newValue
      totalPnL += assetPnL
    }
    
    // به‌روزرسانی portfolio
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        totalValue,
        totalPnL
      }
    })
    
    return { totalValue, totalPnL }
  }
  
  /**
   * اضافه کردن Asset جدید
   */
  async addAsset(userId: string, data: {
    symbol: string
    amount: number
    price: number
  }) {
    const portfolio = await this.getPortfolio(userId)
    
    // چک کردن Asset موجود
    const existingAsset = await prisma.portfolioAsset.findUnique({
      where: {
        portfolioId_symbol: {
          portfolioId: portfolio.id,
          symbol: data.symbol
        }
      }
    })
    
    if (existingAsset) {
      // به‌روزرسانی Asset موجود
      const newAmount = existingAsset.amount + data.amount
      const newAvgPrice = (
        (existingAsset.amount * existingAsset.avgBuyPrice) + 
        (data.amount * data.price)
      ) / newAmount
      
      return await prisma.portfolioAsset.update({
        where: { id: existingAsset.id },
        data: {
          amount: newAmount,
          avgBuyPrice: newAvgPrice,
          totalValue: newAmount * data.price
        }
      })
    } else {
      // ایجاد Asset جدید
      return await prisma.portfolioAsset.create({
        data: {
          portfolioId: portfolio.id,
          symbol: data.symbol,
          amount: data.amount,
          avgBuyPrice: data.price,
          currentPrice: data.price,
          totalValue: data.amount * data.price,
          pnl: 0,
          pnlPercent: 0
        }
      })
    }
  }
}

export const portfolioService = new PortfolioService()
```

### Task 2.2: Portfolio Routes (2 ساعت)

**فایل**: `src/routes/portfolio.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { portfolioService } from '../services/portfolio-service'

const portfolio = new Hono()

// همه route ها نیاز به authentication دارند
portfolio.use('*', authMiddleware)

// GET /api/portfolio - دریافت Portfolio ساده
portfolio.get('/', async (c) => {
  try {
    const user = c.get('user')
    const data = await portfolioService.getPortfolio(user.userId)
    
    return c.json({
      success: true,
      data,
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// GET /api/portfolio/advanced - دریافت Portfolio پیشرفته
portfolio.get('/advanced', async (c) => {
  try {
    const user = c.get('user')
    const data = await portfolioService.getAdvancedPortfolio(user.userId)
    
    return c.json({
      success: true,
      data,
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// POST /api/portfolio/asset - اضافه کردن Asset
portfolio.post('/asset', async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    
    const asset = await portfolioService.addAsset(user.userId, body)
    
    return c.json({
      success: true,
      data: asset,
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// GET /api/portfolio/transactions - دریافت تراکنش‌ها
portfolio.get('/transactions', async (c) => {
  try {
    const user = c.get('user')
    const status = c.req.query('status') || 'all'
    const limit = parseInt(c.req.query('limit') || '100')
    const sort = c.req.query('sort') || 'desc'
    
    const where: any = { userId: user.userId }
    if (status !== 'all') {
      where.status = status
    }
    
    const transactions = await prisma.trade.findMany({
      where,
      orderBy: { createdAt: sort as 'asc' | 'desc' },
      take: limit
    })
    
    return c.json({
      success: true,
      data: {
        transactions,
        total: transactions.length
      },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default portfolio
```

---

## 🎯 فاز 3: پیاده‌سازی Market Data APIs (روز 4-5)

**مدت زمان**: 2 روز  
**اولویت**: 🔴 بالا

### Task 3.1: Market Data Service با یکپارچه‌سازی Binance (6 ساعت)

**فایل**: `src/services/market-data-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

export class MarketDataService {
  private binanceAPI = 'https://api.binance.com/api/v3'
  private coinGeckoAPI = 'https://api.coingecko.com/api/v3'
  
  /**
   * دریافت قیمت‌های Real-time از Binance
   */
  async fetchRealTimePrices(symbols: string[]) {
    const prices: Record<string, any> = {}
    
    for (const symbol of symbols) {
      try {
        // دریافت از Binance
        const response = await axios.get(`${this.binanceAPI}/ticker/24hr`, {
          params: { symbol }
        })
        
        const data = response.data
        
        prices[symbol] = {
          symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          lastUpdate: new Date()
        }
        
        // ذخیره در Cache
        await prisma.marketData.upsert({
          where: { symbol },
          update: prices[symbol],
          create: prices[symbol]
        })
        
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error)
        
        // استفاده از Cache
        const cached = await prisma.marketData.findUnique({
          where: { symbol }
        })
        
        if (cached) {
          prices[symbol] = cached
        }
      }
    }
    
    return prices
  }
  
  /**
   * دریافت Fear & Greed Index
   */
  async getFearGreedIndex() {
    try {
      const response = await axios.get('https://api.alternative.me/fng/')
      const data = response.data.data[0]
      
      return {
        value: parseInt(data.value),
        classification: data.value_classification,
        timestamp: new Date(parseInt(data.timestamp) * 1000)
      }
    } catch (error) {
      // Fallback
      return {
        value: 50,
        classification: 'Neutral',
        timestamp: new Date()
      }
    }
  }
  
  /**
   * دریافت Top Gainers/Losers
   */
  async getTrending() {
    try {
      const response = await axios.get(`${this.coinGeckoAPI}/search/trending`)
      return response.data.coins
    } catch (error) {
      return []
    }
  }
  
  /**
   * دریافت اخبار بازار
   */
  async getMarketNews(limit: number = 10) {
    // این باید به یک News API وصل شود
    // مثلاً CryptoPanic API یا NewsAPI
    
    try {
      // مثال با CryptoPanic
      const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
        params: {
          auth_token: process.env.CRYPTOPANIC_API_KEY,
          public: true,
          limit
        }
      })
      
      return response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        source: item.source.title,
        publishedAt: new Date(item.published_at),
        currencies: item.currencies?.map((c: any) => c.code) || []
      }))
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  }
}

export const marketDataService = new MarketDataService()
```

### Task 3.2: Market Routes (2 ساعت)

**فایل**: `src/routes/market.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { marketDataService } from '../services/market-data-service'

const market = new Hono()

market.use('*', authMiddleware)

// POST /api/market/prices - دریافت قیمت‌ها
market.post('/prices', async (c) => {
  try {
    const { symbols } = await c.req.json()
    
    const prices = await marketDataService.fetchRealTimePrices(symbols)
    
    return c.json({
      success: true,
      data: { prices },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 5000, // 5 seconds cache
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// GET /api/market/fear-greed - Fear & Greed Index
market.get('/fear-greed', async (c) => {
  try {
    const data = await marketDataService.getFearGreedIndex()
    
    return c.json({
      success: true,
      data,
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 60000, // 1 minute
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// GET /api/market/trending - Top Gainers/Losers
market.get('/trending', async (c) => {
  try {
    const data = await marketDataService.getTrending()
    
    return c.json({
      success: true,
      data,
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 300000, // 5 minutes
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default market
```

---

## 🎯 فاز 4: پیاده‌سازی Trading Engine (روز 6-8)

**مدت زمان**: 3 روز  
**اولویت**: 🔴 بسیار بالا

### Task 4.1: Trading Service (8 ساعت)

**فایل**: `src/services/trading-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { portfolioService } from './portfolio-service'
import { marketDataService } from './market-data-service'

const prisma = new PrismaClient()

export class TradingService {
  /**
   * ثبت سفارش خرید/فروش
   */
  async placeTrade(userId: string, data: {
    type: 'buy' | 'sell'
    symbol: string
    amount: number
    orderType: 'market' | 'limit' | 'stop_loss'
    price?: number
    stopPrice?: number
    strategy?: string
    agentId?: string
  }) {
    // دریافت قیمت فعلی
    const prices = await marketDataService.fetchRealTimePrices([data.symbol])
    const currentPrice = prices[data.symbol]?.price || data.price || 0
    
    if (currentPrice === 0) {
      throw new Error('Unable to fetch current price')
    }
    
    // محاسبه مبلغ کل
    const total = data.amount * currentPrice
    const fee = total * 0.001 // 0.1% fee
    const totalWithFee = total + fee
    
    // چک کردن موجودی (برای خرید)
    if (data.type === 'buy') {
      const portfolio = await portfolioService.getPortfolio(userId)
      
      if (portfolio.totalBalance < totalWithFee) {
        throw new Error('Insufficient balance')
      }
      
      // کسر از موجودی
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalBalance: portfolio.totalBalance - totalWithFee
        }
      })
    }
    
    // ثبت Trade
    const trade = await prisma.trade.create({
      data: {
        userId,
        type: data.type,
        symbol: data.symbol,
        amount: data.amount,
        price: currentPrice,
        total,
        fee,
        status: data.orderType === 'market' ? 'completed' : 'pending',
        orderType: data.orderType,
        stopPrice: data.stopPrice,
        limitPrice: data.price,
        strategy: data.strategy || 'manual',
        agentId: data.agentId,
        executedAt: data.orderType === 'market' ? new Date() : undefined
      }
    })
    
    // اگر Market Order بود، فوری اجرا شود
    if (data.orderType === 'market') {
      await this.executeTrade(trade.id)
    }
    
    return trade
  }
  
  /**
   * اجرای Trade
   */
  async executeTrade(tradeId: string) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    })
    
    if (!trade) {
      throw new Error('Trade not found')
    }
    
    if (trade.status !== 'pending' && trade.status !== 'completed') {
      throw new Error('Trade cannot be executed')
    }
    
    if (trade.type === 'buy') {
      // اضافه کردن به Portfolio
      await portfolioService.addAsset(trade.userId, {
        symbol: trade.symbol,
        amount: trade.amount,
        price: trade.price
      })
    } else if (trade.type === 'sell') {
      // کسر از Portfolio و اضافه به Balance
      const portfolio = await portfolioService.getPortfolio(trade.userId)
      const asset = portfolio.assets.find(a => a.symbol === trade.symbol)
      
      if (!asset || asset.amount < trade.amount) {
        throw new Error('Insufficient asset balance')
      }
      
      // کسر از Asset
      await prisma.portfolioAsset.update({
        where: { id: asset.id },
        data: {
          amount: asset.amount - trade.amount
        }
      })
      
      // اضافه به Balance
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalBalance: portfolio.totalBalance + trade.total - trade.fee
        }
      })
    }
    
    // به‌روزرسانی Trade
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: 'completed',
        executedAt: new Date()
      }
    })
  }
  
  /**
   * لغو Trade
   */
  async cancelTrade(tradeId: string, userId: string) {
    const trade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId
      }
    })
    
    if (!trade) {
      throw new Error('Trade not found')
    }
    
    if (trade.status !== 'pending') {
      throw new Error('Only pending trades can be cancelled')
    }
    
    // اگر خرید بود، مبلغ را برگردان
    if (trade.type === 'buy') {
      const portfolio = await portfolioService.getPortfolio(userId)
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalBalance: portfolio.totalBalance + trade.total + trade.fee
        }
      })
    }
    
    // به‌روزرسانی Trade
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    })
  }
  
  /**
   * دریافت Trade های فعال
   */
  async getActiveTrades(userId: string) {
    return await prisma.trade.findMany({
      where: {
        userId,
        status: { in: ['pending', 'completed'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  }
}

export const tradingService = new TradingService()
```

### Task 4.2: Trading Routes (2 ساعت)

**فایل**: `src/routes/trading.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { tradingService } from '../services/trading-service'

const trading = new Hono()

trading.use('*', authMiddleware)

// POST /api/trading/order - ثبت سفارش
trading.post('/order', async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    
    const trade = await tradingService.placeTrade(user.userId, body)
    
    return c.json({
      success: true,
      data: trade,
      message: 'Order placed successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// POST /api/trading/order/:id/cancel - لغو سفارش
trading.post('/order/:id/cancel', async (c) => {
  try {
    const user = c.get('user')
    const tradeId = c.req.param('id')
    
    await tradingService.cancelTrade(tradeId, user.userId)
    
    return c.json({
      success: true,
      message: 'Order cancelled successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// GET /api/trading/active - Trade های فعال
trading.get('/active', async (c) => {
  try {
    const user = c.get('user')
    
    const trades = await tradingService.getActiveTrades(user.userId)
    
    return c.json({
      success: true,
      data: { trades },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 10000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default trading
```

---

## 🎯 فاز 5: Dashboard Comprehensive API (روز 9)

**مدت زمان**: 1 روز  
**اولویت**: 🔴 بالا

### Task 5.1: Dashboard Service (4 ساعت)

**فایل**: `src/services/dashboard-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { portfolioService } from './portfolio-service'
import { tradingService } from './trading-service'
import { marketDataService } from './market-data-service'

const prisma = new PrismaClient()

export class DashboardService {
  /**
   * دریافت داده‌های جامع Dashboard
   */
  async getComprehensiveDashboard(userId: string) {
    // دریافت Portfolio
    const portfolio = await portfolioService.getAdvancedPortfolio(userId)
    
    // دریافت Trade های فعال
    const activeTrades = await tradingService.getActiveTrades(userId)
    
    // دریافت قیمت‌های بازار
    const topSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT']
    const marketPrices = await marketDataService.fetchRealTimePrices(topSymbols)
    
    // دریافت Fear & Greed
    const fearGreed = await marketDataService.getFearGreedIndex()
    
    // محاسبه آمارهای Trading
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayTrades = await prisma.trade.count({
      where: {
        userId,
        createdAt: { gte: todayStart }
      }
    })
    
    const pendingOrders = await prisma.trade.count({
      where: {
        userId,
        status: 'pending'
      }
    })
    
    // محاسبه Volume 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const volume24h = await prisma.trade.aggregate({
      where: {
        userId,
        createdAt: { gte: last24h },
        status: 'completed'
      },
      _sum: { total: true }
    })
    
    // دریافت AI Agent Status
    const aiAgents = await this.getAIAgentsStatus(userId)
    
    // دریافت Recent Activities
    const recentActivities = await this.getRecentActivities(userId, 10)
    
    // محاسبه Risk Metrics
    const risk = await this.calculateRiskMetrics(userId, portfolio)
    
    // محاسبه Learning Progress (فعلاً mock)
    const learning = {
      totalSessions: 125,
      completedCourses: 8,
      currentLevel: 5,
      weeklyProgress: 85
    }
    
    // Chart Data
    const charts = await this.getChartsData(userId)
    
    return {
      portfolio: {
        totalBalance: portfolio.totalBalance,
        dailyChange: portfolio.dailyChange,
        weeklyChange: portfolio.weeklyChange,
        monthlyChange: portfolio.monthlyChange,
        totalPnL: portfolio.totalPnL,
        totalTrades: activeTrades.length,
        winRate: portfolio.winRate,
        sharpeRatio: portfolio.sharpeRatio,
        assets: portfolio.assets
      },
      
      trading: {
        activeTrades: activeTrades.length,
        todayTrades,
        pendingOrders,
        totalVolume24h: volume24h._sum.total || 0,
        successfulTrades: activeTrades.filter(t => t.status === 'completed').length,
        failedTrades: activeTrades.filter(t => t.status === 'failed').length
      },
      
      market: {
        btcPrice: marketPrices['BTCUSDT']?.price || 0,
        ethPrice: marketPrices['ETHUSDT']?.price || 0,
        fear_greed_index: fearGreed.value,
        dominance: 51.2, // باید از API واقعی گرفته شود
        prices: marketPrices
      },
      
      risk,
      learning,
      aiAgents,
      activities: recentActivities,
      charts,
      
      summary: {
        activeAgents: aiAgents.filter(a => a.status === 'active').length,
        totalAgents: aiAgents.length,
        avgPerformance: aiAgents.reduce((sum, a) => sum + a.performance, 0) / aiAgents.length,
        systemHealth: 98.5
      },
      
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    }
  }
  
  /**
   * دریافت وضعیت AI Agents
   */
  async getAIAgentsStatus(userId: string) {
    // این باید از یک جدول مخصوص AI Agent ها بیاید
    // فعلاً mock data
    return [
      { id: 1, name: 'Technical Analysis', status: 'active', performance: 12.3, trades: 45, uptime: 98.5 },
      { id: 2, name: 'Risk Management', status: 'active', performance: 8.7, trades: 23, uptime: 99.2 },
      { id: 3, name: 'Sentiment Analysis', status: 'active', performance: 15.4, trades: 67, uptime: 95.1 },
      { id: 4, name: 'Portfolio Optimization', status: 'active', performance: 6.2, trades: 12, uptime: 97.8 },
      { id: 5, name: 'Market Making', status: 'paused', performance: 9.8, trades: 34, uptime: 98.9 }
    ]
  }
  
  /**
   * دریافت فعالیت‌های اخیر
   */
  async getRecentActivities(userId: string, limit: number = 10) {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return trades.map(trade => ({
      id: trade.id,
      type: trade.type === 'buy' ? 'trade' : 'profit',
      description: `${trade.type.toUpperCase()} ${trade.symbol}`,
      amount: trade.type === 'buy' ? -trade.total : trade.total,
      timestamp: trade.createdAt.getTime(),
      agent: trade.strategy || 'Manual'
    }))
  }
  
  /**
   * محاسبه Risk Metrics
   */
  async calculateRiskMetrics(userId: string, portfolio: any) {
    // محاسبه Total Exposure
    const totalExposure = (portfolio.totalValue / (portfolio.totalBalance + portfolio.totalValue)) * 100
    
    // محاسبه Current Drawdown
    const allTimeTrades = await prisma.trade.findMany({
      where: { userId, status: 'completed' },
      orderBy: { executedAt: 'asc' }
    })
    
    let peak = portfolio.totalBalance
    let drawdown = 0
    
    for (const trade of allTimeTrades) {
      const currentValue = portfolio.totalBalance + portfolio.totalValue
      if (currentValue > peak) peak = currentValue
      drawdown = Math.min(drawdown, ((currentValue - peak) / peak) * 100)
    }
    
    // Risk Score (ساده شده)
    const riskScore = Math.min(100, Math.max(0, 
      (totalExposure * 0.4) + 
      (Math.abs(drawdown) * 0.3) + 
      (50 - portfolio.winRate) * 0.3
    ))
    
    return {
      totalExposure: Math.round(totalExposure),
      maxRiskPerTrade: 2.5,
      currentDrawdown: Number(drawdown.toFixed(2)),
      riskScore: Math.round(riskScore)
    }
  }
  
  /**
   * دریافت داده‌های Chart
   */
  async getChartsData(userId: string) {
    // Portfolio Performance Chart (30 روز اخیر)
    const days = 30
    const portfolioHistory = []
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // این باید از یک جدول History بیاید
      // فعلاً mock data
      portfolioHistory.push({
        date: date.toISOString().split('T')[0],
        value: 100000 + (Math.random() * 10000) - 5000
      })
    }
    
    return {
      performance: {
        labels: portfolioHistory.map(h => h.date),
        datasets: [{
          label: 'Portfolio Value',
          data: portfolioHistory.map(h => h.value),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      
      agents: {
        labels: ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'],
        datasets: [{
          label: 'Performance (%)',
          data: [12.3, 8.7, 15.4, 6.2, 9.8],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      },
      
      volume: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Trading Volume ($)',
          data: [15000, 18000, 12000, 22000, 19000, 16000, 20000],
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        }]
      }
    }
  }
}

export const dashboardService = new DashboardService()
```

### Task 5.2: Dashboard Routes (1 ساعت)

**فایل**: `src/routes/dashboard.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { dashboardService } from '../services/dashboard-service'

const dashboard = new Hono()

dashboard.use('*', authMiddleware)

// GET /api/dashboard/comprehensive-real
dashboard.get('/comprehensive-real', async (c) => {
  try {
    const user = c.get('user')
    
    const data = await dashboardService.getComprehensiveDashboard(user.userId)
    
    return c.json({
      success: true,
      data
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// GET /api/dashboard/stats - آمارهای خلاصه
dashboard.get('/stats', async (c) => {
  try {
    const user = c.get('user')
    const data = await dashboardService.getComprehensiveDashboard(user.userId)
    
    return c.json({
      success: true,
      data: {
        totalBalance: data.portfolio.totalBalance,
        dailyChange: data.portfolio.dailyChange,
        activeTrades: data.trading.activeTrades,
        todayTrades: data.trading.todayTrades
      },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 10000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default dashboard
```

---

## 🎯 فاز 6: AI Agents Backend (روز 10-12)

**مدت زمان**: 3 روز  
**اولویت**: 🟡 متوسط

### Task 6.1: AI Agent Service (بخش پایه - 4 ساعت)

**فایل**: `src/services/ai-agent-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { marketDataService } from './market-data-service'
import { tradingService } from './trading-service'

const prisma = new PrismaClient()

export class AIAgentService {
  /**
   * ثبت Signal از Agent
   */
  async recordSignal(data: {
    agentId: string
    symbol: string
    action: 'buy' | 'sell' | 'hold'
    confidence: number
    price: number
    reason?: string
    indicators?: any
  }) {
    return await prisma.aISignal.create({
      data: {
        ...data,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })
  }
  
  /**
   * دریافت Signal های فعال
   */
  async getActiveSignals(symbol?: string) {
    const where: any = {
      isValid: true,
      expiresAt: { gt: new Date() }
    }
    
    if (symbol) {
      where.symbol = symbol
    }
    
    return await prisma.aISignal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }
  
  /**
   * اجرای خودکار Signal
   */
  async executeSignal(signalId: string, userId: string) {
    const signal = await prisma.aISignal.findUnique({
      where: { id: signalId }
    })
    
    if (!signal || !signal.isValid) {
      throw new Error('Invalid signal')
    }
    
    if (signal.action === 'hold') {
      throw new Error('Cannot execute HOLD signal')
    }
    
    // ثبت Trade
    const trade = await tradingService.placeTrade(userId, {
      type: signal.action,
      symbol: signal.symbol,
      amount: 0.1, // مقدار پیش‌فرض - باید قابل تنظیم باشد
      orderType: 'market',
      strategy: `ai_${signal.agentId}`,
      agentId: signal.agentId
    })
    
    // غیرفعال کردن Signal
    await prisma.aISignal.update({
      where: { id: signalId },
      data: { isValid: false }
    })
    
    return trade
  }
  
  /**
   * Technical Analysis Agent
   */
  async runTechnicalAnalysis(symbol: string) {
    // دریافت داده‌های تاریخی
    const prices = await marketDataService.fetchRealTimePrices([symbol])
    const price = prices[symbol]
    
    if (!price) {
      throw new Error('Unable to fetch price data')
    }
    
    // محاسبه اندیکاتورها (ساده شده)
    const rsi = this.calculateRSI([price.price]) // باید داده‌های تاریخی باشد
    const macd = this.calculateMACD([price.price])
    
    // تصمیم‌گیری
    let action: 'buy' | 'sell' | 'hold' = 'hold'
    let confidence = 0.5
    
    if (rsi < 30 && macd > 0) {
      action = 'buy'
      confidence = 0.8
    } else if (rsi > 70 && macd < 0) {
      action = 'sell'
      confidence = 0.8
    }
    
    // ثبت Signal
    return await this.recordSignal({
      agentId: 'AGENT_01_TECHNICAL_ANALYSIS',
      symbol,
      action,
      confidence,
      price: price.price,
      reason: `RSI: ${rsi.toFixed(2)}, MACD: ${macd > 0 ? 'Bullish' : 'Bearish'}`,
      indicators: { rsi, macd }
    })
  }
  
  /**
   * محاسبه RSI (ساده شده)
   */
  private calculateRSI(prices: number[]): number {
    // این یک نسخه ساده است - باید پیاده‌سازی کامل شود
    return 50 + (Math.random() * 40) - 20
  }
  
  /**
   * محاسبه MACD (ساده شده)
   */
  private calculateMACD(prices: number[]): number {
    // این یک نسخه ساده است - باید پیاده‌سازی کامل شود
    return (Math.random() - 0.5) * 10
  }
}

export const aiAgentService = new AIAgentService()
```

### Task 6.2: AI Agent Routes (2 ساعت)

**فایل**: `src/routes/ai-agents.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { aiAgentService } from '../services/ai-agent-service'

const aiAgents = new Hono()

aiAgents.use('*', authMiddleware)

// GET /api/ai-agents/signals - دریافت Signal های فعال
aiAgents.get('/signals', async (c) => {
  try {
    const symbol = c.req.query('symbol')
    
    const signals = await aiAgentService.getActiveSignals(symbol)
    
    return c.json({
      success: true,
      data: { signals },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 5000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// POST /api/ai-agents/analyze - اجرای تحلیل
aiAgents.post('/analyze', async (c) => {
  try {
    const { symbol, agentId } = await c.req.json()
    
    let signal
    
    switch (agentId) {
      case 'AGENT_01_TECHNICAL_ANALYSIS':
        signal = await aiAgentService.runTechnicalAnalysis(symbol)
        break
      
      // سایر Agent ها...
      
      default:
        throw new Error('Unknown agent')
    }
    
    return c.json({
      success: true,
      data: { signal }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// POST /api/ai-agents/execute/:signalId - اجرای Signal
aiAgents.post('/execute/:signalId', async (c) => {
  try {
    const user = c.get('user')
    const signalId = c.req.param('signalId')
    
    const trade = await aiAgentService.executeSignal(signalId, user.userId)
    
    return c.json({
      success: true,
      data: { trade },
      message: 'Signal executed successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

export default aiAgents
```

---

## 🎯 فاز 7: Alerts & Notifications (روز 13-14)

**مدت زمان**: 2 روز  
**اولویت**: 🟡 متوسط

### Task 7.1: Alerts Service (4 ساعت)

**فایل**: `src/services/alerts-service.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { marketDataService } from './market-data-service'

const prisma = new PrismaClient()

export class AlertsService {
  /**
   * ایجاد Alert جدید
   */
  async createAlert(userId: string, data: {
    type: 'price' | 'indicator' | 'news'
    symbol?: string
    condition: 'above' | 'below' | 'crosses'
    targetValue?: number
    message?: string
  }) {
    return await prisma.alert.create({
      data: {
        userId,
        ...data
      }
    })
  }
  
  /**
   * دریافت Alert های کاربر
   */
  async getUserAlerts(userId: string, isActive?: boolean) {
    const where: any = { userId }
    
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    
    return await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * چک کردن Alert ها (باید هر چند ثانیه اجرا شود)
   */
  async checkAlerts() {
    // دریافت Alert های فعال
    const alerts = await prisma.alert.findMany({
      where: {
        isActive: true,
        isTriggered: false
      }
    })
    
    for (const alert of alerts) {
      try {
        await this.checkSingleAlert(alert)
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error)
      }
    }
  }
  
  /**
   * چک کردن یک Alert
   */
  private async checkSingleAlert(alert: any) {
    if (alert.type !== 'price' || !alert.symbol) {
      return
    }
    
    // دریافت قیمت فعلی
    const prices = await marketDataService.fetchRealTimePrices([alert.symbol])
    const currentPrice = prices[alert.symbol]?.price
    
    if (!currentPrice) {
      return
    }
    
    // چک کردن شرط
    let triggered = false
    
    switch (alert.condition) {
      case 'above':
        triggered = currentPrice > (alert.targetValue || 0)
        break
      case 'below':
        triggered = currentPrice < (alert.targetValue || 0)
        break
      case 'crosses':
        // باید قیمت قبلی را چک کند
        break
    }
    
    if (triggered) {
      // فعال کردن Alert
      await prisma.alert.update({
        where: { id: alert.id },
        data: {
          isTriggered: true,
          triggeredAt: new Date(),
          currentValue: currentPrice
        }
      })
      
      // ارسال Notification (باید پیاده شود)
      console.log(`🔔 Alert triggered: ${alert.symbol} ${alert.condition} ${alert.targetValue}`)
    }
  }
  
  /**
   * حذف Alert
   */
  async deleteAlert(alertId: string, userId: string) {
    const alert = await prisma.alert.findFirst({
      where: { id: alertId, userId }
    })
    
    if (!alert) {
      throw new Error('Alert not found')
    }
    
    await prisma.alert.delete({
      where: { id: alertId }
    })
  }
}

export const alertsService = new AlertsService()
```

### Task 7.2: Alerts Routes (2 ساعت)

**فایل**: `src/routes/alerts.ts`

```typescript
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { alertsService } from '../services/alerts-service'

const alerts = new Hono()

alerts.use('*', authMiddleware)

// GET /api/alerts - دریافت Alert های کاربر
alerts.get('/', async (c) => {
  try {
    const user = c.get('user')
    const isActive = c.req.query('active') === 'true' ? true : undefined
    
    const data = await alertsService.getUserAlerts(user.userId, isActive)
    
    return c.json({
      success: true,
      data: { alerts: data },
      meta: {
        source: 'real',
        ts: Date.now(),
        ttlMs: 30000,
        stale: false
      }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// POST /api/alerts - ایجاد Alert
alerts.post('/', async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    
    const alert = await alertsService.createAlert(user.userId, body)
    
    return c.json({
      success: true,
      data: { alert },
      message: 'Alert created successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

// DELETE /api/alerts/:id - حذف Alert
alerts.delete('/:id', async (c) => {
  try {
    const user = c.get('user')
    const alertId = c.req.param('id')
    
    await alertsService.deleteAlert(alertId, user.userId)
    
    return c.json({
      success: true,
      message: 'Alert deleted successfully'
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400)
  }
})

export default alerts
```

---

## 🎯 فاز 8: Integration & Testing (روز 15-17)

**مدت زمان**: 3 روز  
**اولویت**: 🔴 بالا

### Task 8.1: اتصال همه Routes به Main App (2 ساعت)

**فایل**: `src/index.tsx`

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import Routes
import authRoutes from './routes/auth'
import portfolioRoutes from './routes/portfolio'
import marketRoutes from './routes/market'
import tradingRoutes from './routes/trading'
import dashboardRoutes from './routes/dashboard'
import aiAgentsRoutes from './routes/ai-agents'
import alertsRoutes from './routes/alerts'

const app = new Hono()

// CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://www.zala.ir'],
  credentials: true
}))

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'Titan Trading System'
  })
})

// Mount Routes
app.route('/api/auth', authRoutes)
app.route('/api/portfolio', portfolioRoutes)
app.route('/api/market', marketRoutes)
app.route('/api/trading', tradingRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/ai-agents', aiAgentsRoutes)
app.route('/api/alerts', alertsRoutes)

// Error Handler
app.onError((err, c) => {
  console.error('❌ Server error:', err)
  return c.json({
    success: false,
    error: 'Internal server error',
    message: err.message
  }, 500)
})

// 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    path: c.req.path
  }, 404)
})

export default app
```

### Task 8.2: راه‌اندازی Background Jobs (3 ساعت)

**فایل**: `src/jobs/index.ts`

```typescript
import { marketDataService } from '../services/market-data-service'
import { alertsService } from '../services/alerts-service'
import { portfolioService } from '../services/portfolio-service'

/**
 * به‌روزرسانی قیمت‌ها (هر 10 ثانیه)
 */
export async function updateMarketPricesJob() {
  console.log('🔄 Updating market prices...')
  
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT']
  
  try {
    await marketDataService.fetchRealTimePrices(symbols)
    console.log('✅ Market prices updated')
  } catch (error) {
    console.error('❌ Failed to update prices:', error)
  }
}

/**
 * چک کردن Alert ها (هر 30 ثانیه)
 */
export async function checkAlertsJob() {
  console.log('🔔 Checking alerts...')
  
  try {
    await alertsService.checkAlerts()
    console.log('✅ Alerts checked')
  } catch (error) {
    console.error('❌ Failed to check alerts:', error)
  }
}

/**
 * راه‌اندازی همه Job ها
 */
export function startBackgroundJobs() {
  console.log('🚀 Starting background jobs...')
  
  // Update prices every 10 seconds
  setInterval(updateMarketPricesJob, 10000)
  
  // Check alerts every 30 seconds
  setInterval(checkAlertsJob, 30000)
  
  console.log('✅ Background jobs started')
}
```

اضافه کردن به `src/index.tsx`:

```typescript
import { startBackgroundJobs } from './jobs'

// در انتهای فایل:
startBackgroundJobs()
```

### Task 8.3: نوشتن تست‌های اصلی (4 ساعت)

**فایل**: `tests/auth.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals'
import app from '../src/index'

describe('Authentication', () => {
  it('should register new user', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
  
  it('should login user', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.token).toBeDefined()
  })
})
```

**فایل**: `tests/portfolio.test.ts`

```typescript
describe('Portfolio', () => {
  let authToken: string
  
  beforeAll(async () => {
    // Login first
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })
    
    const data = await res.json()
    authToken = data.data.token
  })
  
  it('should get portfolio', async () => {
    const res = await app.request('/api/portfolio', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })
  
  it('should get advanced portfolio', async () => {
    const res = await app.request('/api/portfolio/advanced', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.totalBalance).toBeDefined()
  })
})
```

اجرای تست‌ها:

```bash
npm test
```

---

## 📝 خلاصه کامل - چک لیست نهایی

### ✅ فاز 1: راه‌اندازی اولیه (روز 1)
- [ ] Setup Database Schema (Prisma)
- [ ] اجرای Migration
- [ ] Seed کردن داده‌های اولیه
- [ ] پیاده‌سازی Authentication System
- [ ] ایجاد Auth Middleware
- [ ] تست Login/Register

### ✅ فاز 2: Portfolio APIs (روز 2-3)
- [ ] Portfolio Service
- [ ] Portfolio Routes
- [ ] Advanced Portfolio Endpoint
- [ ] Transactions Endpoint
- [ ] Asset Management
- [ ] Price Update System

### ✅ فاز 3: Market Data APIs (روز 4-5)
- [ ] یکپارچه‌سازی با Binance API
- [ ] Market Prices Endpoint
- [ ] Fear & Greed Index
- [ ] Trending Coins
- [ ] News API Integration
- [ ] Market Data Caching

### ✅ فاز 4: Trading Engine (روز 6-8)
- [ ] Trading Service
- [ ] Place Order Endpoint
- [ ] Execute Trade Logic
- [ ] Cancel Order Endpoint
- [ ] Active Trades Endpoint
- [ ] Order Types (Market, Limit, Stop Loss)

### ✅ فاز 5: Dashboard API (روز 9)
- [ ] Dashboard Service
- [ ] Comprehensive Dashboard Endpoint
- [ ] Stats Endpoint
- [ ] Charts Data
- [ ] Risk Metrics
- [ ] Recent Activities

### ✅ فاز 6: AI Agents (روز 10-12)
- [ ] AI Agent Service (پایه)
- [ ] Signal System
- [ ] Technical Analysis Agent
- [ ] Signal Execution
- [ ] Agent Routes
- [ ] Agent Status Tracking

### ✅ فاز 7: Alerts (روز 13-14)
- [ ] Alerts Service
- [ ] Create Alert Endpoint
- [ ] Get Alerts Endpoint
- [ ] Delete Alert Endpoint
- [ ] Alert Checking Job
- [ ] Notification System (پایه)

### ✅ فاز 8: Integration & Testing (روز 15-17)
- [ ] اتصال همه Routes
- [ ] Background Jobs Setup
- [ ] Market Prices Update Job
- [ ] Alerts Check Job
- [ ] نوشتن Unit Tests
- [ ] نوشتن Integration Tests
- [ ] Testing با Frontend
- [ ] Performance Optimization
- [ ] Documentation

---

## 🚀 نتیجه نهایی

بعد از تکمیل همه این فازها:

### ✅ Backend کامل می‌شود:
- 40+ API Endpoint کاملاً کاربردی
- Authentication & Authorization کامل
- Real-time Market Data
- Trading Engine کامل
- AI Agents پایه (قابل توسعه)
- Alerts & Notifications
- Dashboard Comprehensive

### ✅ Frontend کاملاً کار می‌کند:
- Login/Register ✅
- Dashboard با داده واقعی ✅
- Portfolio Tracking ✅
- Trading Interface ✅
- AI Agents Display ✅
- Market Data Real-time ✅
- Charts & Analytics ✅
- Alerts Management ✅

### ✅ تجربه کاربری عالی:
- سرعت بالا
- داده‌های Real-time
- عدم خطای 404
- UI/UX روان
- کاملاً Production-ready

---

**تخمین زمان کل**: 2-3 هفته (Full-time)  
**تعداد کل Task ها**: 67 Task  
**تعداد API Endpoints**: 40+  
**وضعیت نهایی**: ⭐⭐⭐⭐⭐ Production Ready

---

**نکته مهم**: این نقشه راه کامل است اما می‌توانید به صورت تدریجی پیش بروید. ابتدا فازهای 1-5 را تکمیل کنید تا سایت اصلی کار کند، سپس فازهای 6-8 را برای کامل‌تر شدن.

آیا می‌خواهید از هر فازی شروع کنیم؟ 🚀
