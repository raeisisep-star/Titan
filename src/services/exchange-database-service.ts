/**
 * TITAN Trading System - Exchange Database Integration Service
 * Database layer integration for exchange operations and trade history management
 * 
 * Features:
 * - Trade history tracking and synchronization
 * - Exchange configuration persistence
 * - Portfolio balance tracking across exchanges
 * - Order management with database persistence
 * - Performance analytics and reporting
 * - Historical data aggregation and analysis
 */

import { DatabaseService } from '../db/database-service';
import { Order, Trade, Balance } from '../exchanges/exchange-connector';
import { ExchangeName } from './exchange-management-service';

export interface ExchangeConfiguration {
  id?: number;
  user_id: number;
  exchange_name: ExchangeName;
  is_enabled: boolean;
  priority: number;
  configuration: {
    credentials: any;
    trading_pairs: string[];
    max_order_size?: number;
    trading_settings?: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TradeRecord {
  id?: number;
  user_id: number;
  exchange_name: ExchangeName;
  trade_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fee: number;
  fee_currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  executed_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderRecord {
  id?: number;
  user_id: number;
  exchange_name: ExchangeName;
  order_id: string;
  symbol: string;
  type: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  filled_amount: number;
  remaining_amount: number;
  status: string;
  time_in_force?: string;
  created_at?: string;
  updated_at?: string;
  executed_at?: string;
}

export interface BalanceRecord {
  id?: number;
  user_id: number;
  exchange_name: ExchangeName;
  asset: string;
  free_balance: number;
  locked_balance: number;
  total_balance: number;
  usd_value?: number;
  snapshot_at: string;
  created_at?: string;
}

export interface PortfolioSnapshot {
  id?: number;
  user_id: number;
  total_value_usd: number;
  total_btc_value?: number;
  exchange_distribution: { [exchange: string]: number };
  asset_distribution: { [asset: string]: number };
  snapshot_at: string;
  created_at?: string;
}

export interface TradingPerformance {
  user_id: number;
  exchange_name?: ExchangeName;
  time_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  total_trades: number;
  successful_trades: number;
  success_rate: number;
  total_profit_loss: number;
  total_volume: number;
  average_profit_per_trade: number;
  best_trade: number;
  worst_trade: number;
  total_fees: number;
  roi_percentage: number;
}

export class ExchangeDatabaseService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }

  /**
   * Exchange Configuration Management
   */
  async saveExchangeConfiguration(config: ExchangeConfiguration): Promise<number> {
    try {
      const result = await this.dbService.executeQuery(`
        INSERT OR REPLACE INTO exchange_configurations 
        (user_id, exchange_name, is_enabled, priority, configuration)
        VALUES (?, ?, ?, ?, ?)
      `, [
        config.user_id,
        config.exchange_name,
        config.is_enabled,
        config.priority,
        JSON.stringify(config.configuration)
      ]);

      return result.meta.last_row_id as number;
    } catch (error) {
      console.error('Error saving exchange configuration:', error);
      throw error;
    }
  }

  async getExchangeConfigurations(userId: number): Promise<ExchangeConfiguration[]> {
    try {
      const result = await this.dbService.executeQuery(`
        SELECT * FROM exchange_configurations 
        WHERE user_id = ? 
        ORDER BY priority DESC, exchange_name
      `, [userId]);

      return result.results.map(row => ({
        ...row,
        configuration: JSON.parse(row.configuration as string)
      })) as ExchangeConfiguration[];
    } catch (error) {
      console.error('Error getting exchange configurations:', error);
      throw error;
    }
  }

  async updateExchangeConfiguration(configId: number, updates: Partial<ExchangeConfiguration>): Promise<boolean> {
    try {
      const setParts = [];
      const values = [];

      if (updates.is_enabled !== undefined) {
        setParts.push('is_enabled = ?');
        values.push(updates.is_enabled);
      }
      if (updates.priority !== undefined) {
        setParts.push('priority = ?');
        values.push(updates.priority);
      }
      if (updates.configuration !== undefined) {
        setParts.push('configuration = ?');
        values.push(JSON.stringify(updates.configuration));
      }

      if (setParts.length === 0) {
        return false;
      }

      setParts.push('updated_at = CURRENT_TIMESTAMP');
      values.push(configId);

      const result = await this.dbService.executeQuery(`
        UPDATE exchange_configurations 
        SET ${setParts.join(', ')}
        WHERE id = ?
      `, values);

      return result.meta.changes > 0;
    } catch (error) {
      console.error('Error updating exchange configuration:', error);
      throw error;
    }
  }

  /**
   * Trade History Management
   */
  async saveTrade(trade: TradeRecord): Promise<number> {
    try {
      const result = await this.dbService.executeQuery(`
        INSERT OR REPLACE INTO trade_history 
        (user_id, exchange_name, trade_id, symbol, side, amount, price, total_value, fee, fee_currency, status, executed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        trade.user_id,
        trade.exchange_name,
        trade.trade_id,
        trade.symbol,
        trade.side,
        trade.amount,
        trade.price,
        trade.total_value,
        trade.fee,
        trade.fee_currency,
        trade.status,
        trade.executed_at
      ]);

      return result.meta.last_row_id as number;
    } catch (error) {
      console.error('Error saving trade:', error);
      throw error;
    }
  }

  async saveMultipleTrades(trades: TradeRecord[]): Promise<number[]> {
    try {
      const savedIds: number[] = [];

      for (const trade of trades) {
        const id = await this.saveTrade(trade);
        savedIds.push(id);
      }

      return savedIds;
    } catch (error) {
      console.error('Error saving multiple trades:', error);
      throw error;
    }
  }

  async getTradeHistory(userId: number, filters?: {
    exchange?: ExchangeName;
    symbol?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TradeRecord[]> {
    try {
      let whereClause = 'WHERE user_id = ?';
      const values: any[] = [userId];

      if (filters?.exchange) {
        whereClause += ' AND exchange_name = ?';
        values.push(filters.exchange);
      }

      if (filters?.symbol) {
        whereClause += ' AND symbol = ?';
        values.push(filters.symbol);
      }

      if (filters?.startDate) {
        whereClause += ' AND executed_at >= ?';
        values.push(filters.startDate);
      }

      if (filters?.endDate) {
        whereClause += ' AND executed_at <= ?';
        values.push(filters.endDate);
      }

      const limitClause = filters?.limit ? `LIMIT ${filters.limit}` : '';

      const result = await this.dbService.executeQuery(`
        SELECT * FROM trade_history 
        ${whereClause}
        ORDER BY executed_at DESC
        ${limitClause}
      `, values);

      return result.results as TradeRecord[];
    } catch (error) {
      console.error('Error getting trade history:', error);
      throw error;
    }
  }

  /**
   * Order Management
   */
  async saveOrder(order: OrderRecord): Promise<number> {
    try {
      const result = await this.dbService.executeQuery(`
        INSERT OR REPLACE INTO order_history 
        (user_id, exchange_name, order_id, symbol, type, side, amount, price, filled_amount, remaining_amount, status, time_in_force, executed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.user_id,
        order.exchange_name,
        order.order_id,
        order.symbol,
        order.type,
        order.side,
        order.amount,
        order.price,
        order.filled_amount,
        order.remaining_amount,
        order.status,
        order.time_in_force,
        order.executed_at
      ]);

      return result.meta.last_row_id as number;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, exchange: ExchangeName, status: string, filledAmount?: number): Promise<boolean> {
    try {
      const setParts = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
      const values = [status];

      if (filledAmount !== undefined) {
        setParts.push('filled_amount = ?');
        values.push(filledAmount);
        setParts.push('remaining_amount = amount - ?');
        values.push(filledAmount);
      }

      values.push(orderId, exchange);

      const result = await this.dbService.executeQuery(`
        UPDATE order_history 
        SET ${setParts.join(', ')}
        WHERE order_id = ? AND exchange_name = ?
      `, values);

      return result.meta.changes > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getActiveOrders(userId: number, exchange?: ExchangeName): Promise<OrderRecord[]> {
    try {
      let whereClause = 'WHERE user_id = ? AND status IN (?, ?)';
      const values: any[] = [userId, 'pending', 'open'];

      if (exchange) {
        whereClause += ' AND exchange_name = ?';
        values.push(exchange);
      }

      const result = await this.dbService.executeQuery(`
        SELECT * FROM order_history 
        ${whereClause}
        ORDER BY created_at DESC
      `, values);

      return result.results as OrderRecord[];
    } catch (error) {
      console.error('Error getting active orders:', error);
      throw error;
    }
  }

  /**
   * Balance Management
   */
  async saveBalanceSnapshot(balances: BalanceRecord[]): Promise<number[]> {
    try {
      const savedIds: number[] = [];

      for (const balance of balances) {
        const result = await this.dbService.executeQuery(`
          INSERT INTO balance_history 
          (user_id, exchange_name, asset, free_balance, locked_balance, total_balance, usd_value, snapshot_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          balance.user_id,
          balance.exchange_name,
          balance.asset,
          balance.free_balance,
          balance.locked_balance,
          balance.total_balance,
          balance.usd_value,
          balance.snapshot_at
        ]);

        savedIds.push(result.meta.last_row_id as number);
      }

      return savedIds;
    } catch (error) {
      console.error('Error saving balance snapshot:', error);
      throw error;
    }
  }

  async getLatestBalances(userId: number, exchange?: ExchangeName): Promise<BalanceRecord[]> {
    try {
      let whereClause = 'WHERE b1.user_id = ?';
      const values: any[] = [userId];

      if (exchange) {
        whereClause += ' AND b1.exchange_name = ?';
        values.push(exchange);
      }

      const result = await this.dbService.executeQuery(`
        SELECT b1.* FROM balance_history b1
        INNER JOIN (
          SELECT exchange_name, asset, MAX(snapshot_at) as max_snapshot
          FROM balance_history
          WHERE user_id = ?
          GROUP BY exchange_name, asset
        ) b2 ON b1.exchange_name = b2.exchange_name 
           AND b1.asset = b2.asset 
           AND b1.snapshot_at = b2.max_snapshot
        ${whereClause}
        ORDER BY b1.exchange_name, b1.total_balance DESC
      `, [userId, ...values]);

      return result.results as BalanceRecord[];
    } catch (error) {
      console.error('Error getting latest balances:', error);
      throw error;
    }
  }

  /**
   * Portfolio Management
   */
  async savePortfolioSnapshot(snapshot: PortfolioSnapshot): Promise<number> {
    try {
      const result = await this.dbService.executeQuery(`
        INSERT INTO portfolio_snapshots 
        (user_id, total_value_usd, total_btc_value, exchange_distribution, asset_distribution, snapshot_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        snapshot.user_id,
        snapshot.total_value_usd,
        snapshot.total_btc_value,
        JSON.stringify(snapshot.exchange_distribution),
        JSON.stringify(snapshot.asset_distribution),
        snapshot.snapshot_at
      ]);

      return result.meta.last_row_id as number;
    } catch (error) {
      console.error('Error saving portfolio snapshot:', error);
      throw error;
    }
  }

  async getPortfolioHistory(userId: number, days: number = 30): Promise<PortfolioSnapshot[]> {
    try {
      const result = await this.dbService.executeQuery(`
        SELECT * FROM portfolio_snapshots 
        WHERE user_id = ? 
          AND snapshot_at >= datetime('now', '-${days} days')
        ORDER BY snapshot_at DESC
      `, [userId]);

      return result.results.map(row => ({
        ...row,
        exchange_distribution: JSON.parse(row.exchange_distribution as string),
        asset_distribution: JSON.parse(row.asset_distribution as string)
      })) as PortfolioSnapshot[];
    } catch (error) {
      console.error('Error getting portfolio history:', error);
      throw error;
    }
  }

  /**
   * Performance Analytics
   */
  async calculateTradingPerformance(userId: number, options?: {
    exchange?: ExchangeName;
    startDate?: string;
    endDate?: string;
    timePeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }): Promise<TradingPerformance> {
    try {
      let whereClause = 'WHERE user_id = ? AND status = ?';
      const values: any[] = [userId, 'completed'];

      if (options?.exchange) {
        whereClause += ' AND exchange_name = ?';
        values.push(options.exchange);
      }

      if (options?.startDate) {
        whereClause += ' AND executed_at >= ?';
        values.push(options.startDate);
      }

      if (options?.endDate) {
        whereClause += ' AND executed_at <= ?';
        values.push(options.endDate);
      }

      const result = await this.dbService.executeQuery(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN side = 'sell' THEN total_value - (amount * price) ELSE -(total_value + fee) END) as total_profit_loss,
          SUM(total_value) as total_volume,
          AVG(CASE WHEN side = 'sell' THEN total_value - (amount * price) ELSE -(total_value + fee) END) as avg_profit_per_trade,
          MAX(CASE WHEN side = 'sell' THEN total_value - (amount * price) ELSE -(total_value + fee) END) as best_trade,
          MIN(CASE WHEN side = 'sell' THEN total_value - (amount * price) ELSE -(total_value + fee) END) as worst_trade,
          SUM(fee) as total_fees,
          COUNT(CASE WHEN side = 'sell' AND total_value > (amount * price) THEN 1 END) as successful_trades,
          MIN(executed_at) as start_date,
          MAX(executed_at) as end_date
        FROM trade_history 
        ${whereClause}
      `, values);

      const row = result.results[0];

      return {
        user_id: userId,
        exchange_name: options?.exchange,
        time_period: options?.timePeriod || 'monthly',
        start_date: row.start_date || options?.startDate || new Date().toISOString(),
        end_date: row.end_date || options?.endDate || new Date().toISOString(),
        total_trades: row.total_trades || 0,
        successful_trades: row.successful_trades || 0,
        success_rate: row.total_trades > 0 ? (row.successful_trades / row.total_trades) * 100 : 0,
        total_profit_loss: row.total_profit_loss || 0,
        total_volume: row.total_volume || 0,
        average_profit_per_trade: row.avg_profit_per_trade || 0,
        best_trade: row.best_trade || 0,
        worst_trade: row.worst_trade || 0,
        total_fees: row.total_fees || 0,
        roi_percentage: row.total_volume > 0 ? (row.total_profit_loss / row.total_volume) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating trading performance:', error);
      throw error;
    }
  }

  /**
   * Synchronization Helpers
   */
  async syncTradesFromExchange(userId: number, exchange: ExchangeName, trades: Trade[]): Promise<number[]> {
    try {
      const tradeRecords: TradeRecord[] = trades.map(trade => ({
        user_id: userId,
        exchange_name: exchange,
        trade_id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        amount: trade.quantity,
        price: trade.price,
        total_value: trade.quantity * trade.price,
        fee: trade.fee || 0,
        fee_currency: 'USDT', // Default, should be determined from trade
        status: 'completed',
        executed_at: new Date(trade.timestamp).toISOString()
      }));

      return await this.saveMultipleTrades(tradeRecords);
    } catch (error) {
      console.error('Error syncing trades from exchange:', error);
      throw error;
    }
  }

  async syncOrdersFromExchange(userId: number, exchange: ExchangeName, orders: Order[]): Promise<number[]> {
    try {
      const savedIds: number[] = [];

      for (const order of orders) {
        const orderRecord: OrderRecord = {
          user_id: userId,
          exchange_name: exchange,
          order_id: order.id,
          symbol: order.symbol,
          type: order.type,
          side: order.side,
          amount: order.amount,
          price: order.price,
          filled_amount: order.filled,
          remaining_amount: order.remaining,
          status: order.status,
          time_in_force: 'GTC', // Default, should be from order
          executed_at: new Date(order.timestamp).toISOString()
        };

        const id = await this.saveOrder(orderRecord);
        savedIds.push(id);
      }

      return savedIds;
    } catch (error) {
      console.error('Error syncing orders from exchange:', error);
      throw error;
    }
  }

  async syncBalancesFromExchange(userId: number, exchange: ExchangeName, balances: Balance[]): Promise<number[]> {
    try {
      const balanceRecords: BalanceRecord[] = balances
        .filter(balance => balance.total > 0) // Only save non-zero balances
        .map(balance => ({
          user_id: userId,
          exchange_name: exchange,
          asset: balance.asset,
          free_balance: balance.free,
          locked_balance: balance.locked,
          total_balance: balance.total,
          snapshot_at: new Date().toISOString()
        }));

      return await this.saveBalanceSnapshot(balanceRecords);
    } catch (error) {
      console.error('Error syncing balances from exchange:', error);
      throw error;
    }
  }

  /**
   * Data Cleanup and Maintenance
   */
  async cleanupOldData(options?: {
    keepDays?: number;
    exchanges?: ExchangeName[];
  }): Promise<{ trades: number; orders: number; balances: number }> {
    try {
      const keepDays = options?.keepDays || 365; // Keep 1 year by default
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      const cutoffDateStr = cutoffDate.toISOString();

      let exchangeFilter = '';
      if (options?.exchanges && options.exchanges.length > 0) {
        const exchangePlaceholders = options.exchanges.map(() => '?').join(',');
        exchangeFilter = ` AND exchange_name IN (${exchangePlaceholders})`;
      }

      // Clean old trades
      const tradesResult = await this.dbService.executeQuery(`
        DELETE FROM trade_history 
        WHERE executed_at < ?${exchangeFilter}
      `, [cutoffDateStr, ...(options?.exchanges || [])]);

      // Clean old completed orders
      const ordersResult = await this.dbService.executeQuery(`
        DELETE FROM order_history 
        WHERE created_at < ? AND status IN ('filled', 'cancelled', 'rejected')${exchangeFilter}
      `, [cutoffDateStr, ...(options?.exchanges || [])]);

      // Clean old balance snapshots (keep only latest per day per asset)
      const balancesResult = await this.dbService.executeQuery(`
        DELETE FROM balance_history 
        WHERE id NOT IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
              PARTITION BY exchange_name, asset, DATE(snapshot_at) 
              ORDER BY snapshot_at DESC
            ) as rn
            FROM balance_history
            WHERE snapshot_at < ?${exchangeFilter}
          ) ranked WHERE rn = 1
        ) AND snapshot_at < ?
      `, [cutoffDateStr, ...(options?.exchanges || []), cutoffDateStr]);

      return {
        trades: tradesResult.meta.changes,
        orders: ordersResult.meta.changes,
        balances: balancesResult.meta.changes
      };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}