// TITAN Trading System - Trade Model
// Trading operations and order management

import { BaseModel, ModelValidationResult } from './base-model';
import { DatabaseService } from '../services/database-service';

export interface Trade {
  id: number;
  user_id: number;
  trading_account_id: number;
  portfolio_id?: number;
  exchange_order_id?: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit' | 'trailing_stop';
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'failed';
  quantity: number;
  price?: number;
  filled_quantity: number;
  average_fill_price: number;
  fees: number;
  total_value?: number;
  stop_price?: number;
  take_profit_price?: number;
  strategy?: string;
  ai_agent?: string;
  ai_confidence?: number;
  execution_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTradeData {
  user_id: number;
  trading_account_id: number;
  portfolio_id?: number;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit' | 'trailing_stop';
  quantity: number;
  price?: number;
  stop_price?: number;
  take_profit_price?: number;
  strategy?: string;
  ai_agent?: string;
  ai_confidence?: number;
}

export interface TradeSignal {
  id: number;
  user_id?: number;
  symbol: string;
  signal_type: 'buy' | 'sell' | 'hold' | 'strong_buy' | 'strong_sell';
  source: 'ai_analysis' | 'technical_indicator' | 'news_sentiment' | 'user_manual';
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  entry_price?: number;
  target_prices: number[];
  stop_loss?: number;
  risk_reward_ratio?: number;
  timeframe?: 'scalp' | 'intraday' | 'swing' | 'position';
  analysis_data: Record<string, any>;
  expires_at?: string;
  is_active: boolean;
  executed: boolean;
  created_at: string;
}

export interface TradeStats {
  totalTrades: number;
  filledTrades: number;
  pendingTrades: number;
  cancelledTrades: number;
  totalVolume: number;
  totalFees: number;
  avgFillPrice: number;
  successRate: number;
}

export class TradeModel extends BaseModel<Trade> {
  constructor(db: DatabaseService) {
    super(
      db,
      {
        tableName: 'trades',
        primaryKey: 'id',
        timestamps: true,
      },
      [
        'user_id',
        'trading_account_id',
        'portfolio_id',
        'exchange_order_id',
        'symbol',
        'side',
        'type',
        'status',
        'quantity',
        'price',
        'filled_quantity',
        'average_fill_price',
        'fees',
        'total_value',
        'stop_price',
        'take_profit_price',
        'strategy',
        'ai_agent',
        'ai_confidence',
        'execution_time',
      ],
      [], // No hidden fields
      {
        quantity: 'float',
        price: 'float',
        filled_quantity: 'float',
        average_fill_price: 'float',
        fees: 'float',
        total_value: 'float',
        stop_price: 'float',
        take_profit_price: 'float',
        ai_confidence: 'float',
      }
    );
  }

  // ===========================
  // Validation
  // ===========================

  protected validate(data: Partial<Trade>): ModelValidationResult {
    const errors: string[] = [];

    // Required fields validation
    if (data.user_id !== undefined && (!data.user_id || data.user_id <= 0)) {
      errors.push('Valid user_id is required');
    }

    if (data.trading_account_id !== undefined && (!data.trading_account_id || data.trading_account_id <= 0)) {
      errors.push('Valid trading_account_id is required');
    }

    if (data.symbol !== undefined && !data.symbol) {
      errors.push('Symbol is required');
    }

    if (data.side !== undefined && !['buy', 'sell'].includes(data.side)) {
      errors.push('Side must be either buy or sell');
    }

    if (data.type !== undefined) {
      const validTypes = ['market', 'limit', 'stop_loss', 'take_profit', 'trailing_stop'];
      if (!validTypes.includes(data.type)) {
        errors.push('Invalid trade type');
      }
    }

    if (data.status !== undefined) {
      const validStatuses = ['pending', 'filled', 'partially_filled', 'cancelled', 'failed'];
      if (!validStatuses.includes(data.status)) {
        errors.push('Invalid trade status');
      }
    }

    // Quantity validation
    if (data.quantity !== undefined && (data.quantity <= 0)) {
      errors.push('Quantity must be greater than 0');
    }

    // Price validation for limit orders
    if (data.type === 'limit' && data.price !== undefined && data.price <= 0) {
      errors.push('Price must be greater than 0 for limit orders');
    }

    // Stop price validation
    if (data.stop_price !== undefined && data.stop_price <= 0) {
      errors.push('Stop price must be greater than 0');
    }

    // AI confidence validation
    if (data.ai_confidence !== undefined && (data.ai_confidence < 0 || data.ai_confidence > 100)) {
      errors.push('AI confidence must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ===========================
  // Trade Creation & Management
  // ===========================

  public async createTrade(tradeData: CreateTradeData): Promise<Trade | null> {
    const data = {
      ...tradeData,
      status: 'pending' as const,
      filled_quantity: 0,
      average_fill_price: 0,
      fees: 0,
    };

    const result = await this.create(data);
    if (result.success && result.meta?.lastRowId) {
      return await this.findById(result.meta.lastRowId);
    }

    return null;
  }

  public async updateTradeStatus(
    tradeId: number,
    status: Trade['status'],
    updateData: {
      filled_quantity?: number;
      average_fill_price?: number;
      fees?: number;
      execution_time?: string;
      exchange_order_id?: string;
    } = {}
  ): Promise<boolean> {
    const result = await this.update(tradeId, {
      status,
      ...updateData,
    } as any);

    return result.success;
  }

  public async fillTrade(
    tradeId: number,
    fillData: {
      filled_quantity: number;
      average_fill_price: number;
      fees: number;
      execution_time?: string;
    }
  ): Promise<boolean> {
    const trade = await this.findById(tradeId);
    if (!trade) return false;

    const totalFilled = trade.filled_quantity + fillData.filled_quantity;
    const newStatus = totalFilled >= trade.quantity ? 'filled' : 'partially_filled';

    // Calculate weighted average fill price
    const totalValue = (trade.filled_quantity * trade.average_fill_price) + 
                      (fillData.filled_quantity * fillData.average_fill_price);
    const avgFillPrice = totalValue / totalFilled;

    const result = await this.update(tradeId, {
      status: newStatus,
      filled_quantity: totalFilled,
      average_fill_price: avgFillPrice,
      fees: trade.fees + fillData.fees,
      execution_time: fillData.execution_time || new Date().toISOString(),
    } as any);

    return result.success;
  }

  public async cancelTrade(tradeId: number, reason?: string): Promise<boolean> {
    const result = await this.update(tradeId, {
      status: 'cancelled',
    } as any);

    if (result.success && reason) {
      // Log cancellation reason (could be stored in a separate table)
      console.log(`[Trade Model] Trade ${tradeId} cancelled: ${reason}`);
    }

    return result.success;
  }

  // ===========================
  // Query Methods
  // ===========================

  public async getTradesByUser(userId: number, limit: number = 50): Promise<Trade[]> {
    return await this.findMany(
      { user_id: userId },
      {
        orderBy: 'created_at DESC',
        limit,
      }
    );
  }

  public async getTradesByAccount(accountId: number, limit: number = 50): Promise<Trade[]> {
    return await this.findMany(
      { trading_account_id: accountId },
      {
        orderBy: 'created_at DESC',
        limit,
      }
    );
  }

  public async getTradesBySymbol(symbol: string, limit: number = 100): Promise<Trade[]> {
    return await this.findMany(
      { symbol },
      {
        orderBy: 'created_at DESC',
        limit,
      }
    );
  }

  public async getActiveTrades(userId?: number): Promise<Trade[]> {
    const conditions: any = {
      status: 'pending',
    };

    if (userId) {
      conditions.user_id = userId;
    }

    return await this.findMany(conditions, {
      orderBy: 'created_at ASC',
    });
  }

  public async getTradesByStatus(status: Trade['status'], userId?: number): Promise<Trade[]> {
    const conditions: any = { status };
    if (userId) {
      conditions.user_id = userId;
    }

    return await this.findMany(conditions, {
      orderBy: 'created_at DESC',
    });
  }

  public async getTradesByDateRange(
    startDate: string,
    endDate: string,
    userId?: number
  ): Promise<Trade[]> {
    let sql = 'SELECT * FROM trades WHERE created_at BETWEEN ? AND ?';
    const params: any[] = [startDate, endDate];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await this.query<Trade>(sql, params);
    return result.success && result.data ? result.data.map(trade => this.castModel(trade)) : [];
  }

  // ===========================
  // Statistics & Analytics
  // ===========================

  public async getTradeStats(userId?: number, dateRange?: { start: string; end: string }): Promise<TradeStats> {
    let whereClause = '1=1';
    const params: any[] = [];

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    }

    if (dateRange) {
      whereClause += ' AND created_at BETWEEN ? AND ?';
      params.push(dateRange.start, dateRange.end);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as totalTrades,
        SUM(CASE WHEN status = 'filled' THEN 1 ELSE 0 END) as filledTrades,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTrades,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledTrades,
        SUM(filled_quantity * average_fill_price) as totalVolume,
        SUM(fees) as totalFees,
        AVG(CASE WHEN status = 'filled' THEN average_fill_price ELSE NULL END) as avgFillPrice
      FROM trades 
      WHERE ${whereClause}
    `;

    const result = await this.query<any>(statsQuery, params);
    
    if (result.success && result.data && result.data.length > 0) {
      const stats = result.data[0];
      return {
        totalTrades: stats.totalTrades || 0,
        filledTrades: stats.filledTrades || 0,
        pendingTrades: stats.pendingTrades || 0,
        cancelledTrades: stats.cancelledTrades || 0,
        totalVolume: stats.totalVolume || 0,
        totalFees: stats.totalFees || 0,
        avgFillPrice: stats.avgFillPrice || 0,
        successRate: stats.totalTrades > 0 ? (stats.filledTrades / stats.totalTrades) * 100 : 0,
      };
    }

    return {
      totalTrades: 0,
      filledTrades: 0,
      pendingTrades: 0,
      cancelledTrades: 0,
      totalVolume: 0,
      totalFees: 0,
      avgFillPrice: 0,
      successRate: 0,
    };
  }

  public async getTopTradedSymbols(userId?: number, limit: number = 10): Promise<Array<{
    symbol: string;
    tradeCount: number;
    totalVolume: number;
  }>> {
    let sql = `
      SELECT 
        symbol,
        COUNT(*) as tradeCount,
        SUM(filled_quantity * average_fill_price) as totalVolume
      FROM trades 
      WHERE status = 'filled'
    `;
    const params: any[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' GROUP BY symbol ORDER BY totalVolume DESC LIMIT ?';
    params.push(limit);

    const result = await this.query<any>(sql, params);
    return result.success && result.data ? result.data : [];
  }

  // ===========================
  // Trade Signals Management
  // ===========================

  public async createTradeSignal(signalData: Omit<TradeSignal, 'id' | 'created_at'>): Promise<TradeSignal | null> {
    const result = await this.db.create('trade_signals', {
      ...signalData,
      target_prices: JSON.stringify(signalData.target_prices),
      analysis_data: JSON.stringify(signalData.analysis_data),
    });

    if (result.success && result.meta?.lastRowId) {
      return await this.findTradeSignal(result.meta.lastRowId);
    }

    return null;
  }

  public async findTradeSignal(signalId: number): Promise<TradeSignal | null> {
    const result = await this.db.findOne<any>('trade_signals', { id: signalId });
    
    if (result) {
      return {
        ...result,
        target_prices: JSON.parse(result.target_prices || '[]'),
        analysis_data: JSON.parse(result.analysis_data || '{}'),
      };
    }

    return null;
  }

  public async getActiveSignals(userId?: number): Promise<TradeSignal[]> {
    const conditions: any = { is_active: true };
    if (userId) {
      conditions.user_id = userId;
    }

    const result = await this.db.read<any>('trade_signals', conditions, {
      orderBy: 'created_at DESC',
    });

    if (result.success && result.data) {
      return result.data.map((signal: any) => ({
        ...signal,
        target_prices: JSON.parse(signal.target_prices || '[]'),
        analysis_data: JSON.parse(signal.analysis_data || '{}'),
      }));
    }

    return [];
  }

  public async executeSignal(signalId: number): Promise<boolean> {
    const result = await this.db.update(
      'trade_signals',
      { executed: true },
      { id: signalId }
    );

    return result.success;
  }

  public async expireOldSignals(): Promise<number> {
    const result = await this.db.execute(
      'UPDATE trade_signals SET is_active = false WHERE expires_at < ? AND is_active = true',
      [new Date().toISOString()]
    );

    return result.meta?.changes || 0;
  }

  // ===========================
  // Hooks Override
  // ===========================

  protected async afterCreate(trade: Trade): Promise<void> {
    console.log(`[Trade Model] Trade created: ${trade.symbol} ${trade.side} ${trade.quantity} @ ${trade.price || 'market'}`);
  }

  protected async afterUpdate(id: any, trade: Trade): Promise<void> {
    console.log(`[Trade Model] Trade ${id} updated: status = ${trade.status}`);
  }
}

// Export factory function
export const createTradeModel = (db: DatabaseService): TradeModel => {
  return new TradeModel(db);
};