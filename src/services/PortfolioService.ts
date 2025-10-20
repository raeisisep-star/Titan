/**
 * Portfolio Service - Complete Implementation
 * Handles all portfolio-related operations with metadata signatures
 */

export interface PortfolioMetrics {
  totalBalance: number
  totalPnL: number
  dailyChange: number
  winRate: number
  sharpeRatio: number
  totalAssets: number
  assets: PortfolioAsset[]
}

export interface PortfolioAsset {
  symbol: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercentage: number
  allocation: number
}

export interface Transaction {
  id: number
  type: 'buy' | 'sell'
  symbol: string
  amount: number
  price: number
  total: number
  fee: number
  timestamp: number
}

export interface MetadataSignature {
  source: 'real' | 'bff' | 'mock'
  ts: number
  ttlMs: number
  stale: boolean
}

export class PortfolioService {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  /**
   * Get advanced portfolio with all metrics
   */
  async getAdvancedPortfolio(userId: number): Promise<{
    portfolio: PortfolioMetrics
    meta: MetadataSignature
  }> {
    try {
      // Get portfolio summary
      const portfolioQuery = `
        SELECT 
          SUM(pa.total_value_usd) as total_balance,
          p.total_pnl,
          p.daily_pnl,
          p.total_trades,
          p.winning_trades,
          p.available_balance,
          p.locked_balance
        FROM portfolios p
        LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id
        WHERE p.user_id = ? AND p.is_active = 1
        GROUP BY p.id
      `

      const portfolioResult = await this.db.prepare(portfolioQuery).bind(userId).first()

      // Get trade statistics
      const tradeStatsQuery = `
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
          AVG(pnl) as avg_pnl,
          SUM(pnl) as total_pnl,
          MIN(pnl) as max_drawdown_trade,
          AVG(quantity * entry_price) as avg_trade_size
        FROM trades 
        WHERE user_id = ? AND exit_time IS NOT NULL
      `

      const tradeStats = await this.db.prepare(tradeStatsQuery).bind(userId).first()

      // Get portfolio assets
      const assetsQuery = `
        SELECT 
          symbol,
          amount,
          locked_amount,
          avg_buy_price,
          current_price,
          total_value_usd,
          pnl_usd,
          pnl_percentage
        FROM portfolio_assets
        WHERE portfolio_id = (
          SELECT id FROM portfolios WHERE user_id = ? AND is_active = 1 LIMIT 1
        )
        ORDER BY total_value_usd DESC
      `

      const assetsResult = await this.db.prepare(assetsQuery).bind(userId).all()

      // Calculate metrics
      const totalBalance = portfolioResult?.total_balance || 10000
      const totalPnL = tradeStats?.total_pnl || 0
      const totalTrades = tradeStats?.total_trades || 0
      const winningTrades = tradeStats?.winning_trades || 0
      const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

      // Calculate Sharpe Ratio
      const returns = totalBalance > 0 ? totalPnL / totalBalance : 0
      const sharpeRatio = totalTrades > 10 ? Number((returns * Math.sqrt(252)).toFixed(2)) : 0

      // Calculate daily change
      const recentPerfQuery = `
        SELECT 
          SUM(CASE WHEN DATE(entry_time) = DATE('now') THEN pnl ELSE 0 END) as daily_pnl
        FROM trades 
        WHERE user_id = ? AND exit_time IS NOT NULL
      `

      const recentPerf = await this.db.prepare(recentPerfQuery).bind(userId).first()
      const dailyChange = recentPerf?.daily_pnl 
        ? Number(((recentPerf.daily_pnl / totalBalance) * 100).toFixed(2))
        : 0

      // Format assets
      const totalValue = assetsResult.results.reduce((sum: number, asset: any) => sum + (asset.total_value_usd || 0), 0)
      
      const assets: PortfolioAsset[] = assetsResult.results.map((asset: any) => ({
        symbol: asset.symbol,
        amount: asset.amount,
        avgBuyPrice: asset.avg_buy_price,
        currentPrice: asset.current_price,
        totalValue: asset.total_value_usd,
        pnl: asset.pnl_usd,
        pnlPercentage: asset.pnl_percentage,
        allocation: totalValue > 0 ? Number(((asset.total_value_usd / totalValue) * 100).toFixed(2)) : 0
      }))

      return {
        portfolio: {
          totalBalance: Math.round(totalBalance),
          totalPnL: Math.round(totalPnL),
          dailyChange,
          winRate,
          sharpeRatio,
          totalAssets: assets.length,
          assets
        },
        meta: {
          source: 'real',
          ts: Date.now(),
          ttlMs: 30000, // 30 seconds
          stale: false
        }
      }
    } catch (error) {
      console.error('❌ PortfolioService.getAdvancedPortfolio Error:', error)
      throw error
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: number, limit: number = 50): Promise<{
    transactions: Transaction[]
    meta: MetadataSignature
  }> {
    try {
      const transactionsQuery = `
        SELECT 
          id,
          side as type,
          symbol,
          quantity as amount,
          avg_fill_price as price,
          total_value as total,
          fees as fee,
          strftime('%s', filled_at) as timestamp
        FROM trading_orders
        WHERE user_id = ? AND status = 'filled'
        ORDER BY filled_at DESC
        LIMIT ?
      `

      const result = await this.db.prepare(transactionsQuery).bind(userId, limit).all()

      const transactions: Transaction[] = result.results.map((row: any) => ({
        id: row.id,
        type: row.type,
        symbol: row.symbol,
        amount: row.amount,
        price: row.price,
        total: row.total,
        fee: row.fee,
        timestamp: parseInt(row.timestamp) * 1000 // Convert to milliseconds
      }))

      return {
        transactions,
        meta: {
          source: 'real',
          ts: Date.now(),
          ttlMs: 30000,
          stale: false
        }
      }
    } catch (error) {
      console.error('❌ PortfolioService.getTransactions Error:', error)
      throw error
    }
  }
}
