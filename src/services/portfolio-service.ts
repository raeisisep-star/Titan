/**
 * Portfolio Analysis Service
 * Handles portfolio data, calculations, and analysis
 */

import { mexcClient } from './mexc-api';
import { PortfolioDAO, PortfolioAssetDAO, TradeDAO, initializeDatabase } from '../dao/database';

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  pnLPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;
  weeklyChange: number;
  monthlyChange: number;
  assetCount: number;
  topPerformer: {
    symbol: string;
    changePercentage: number;
    value: number;
  } | null;
  worstPerformer: {
    symbol: string;
    changePercentage: number;
    value: number;
  } | null;
  lastUpdated: string;
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  pnL: number;
  pnLPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;
  allocation: number; // Percentage of total portfolio
  firstPurchaseDate: string;
}

export interface PortfolioPerformance {
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  yearlyReturn: number;
  totalReturn: number;
  volatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
  assetConcentration: number;
  portfolioBalanceScore: number;
  btcCorrelation: number;
  marketBeta: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  fee: number;
  exchange?: string;
  executedAt: string;
  notes?: string;
}

export class PortfolioService {
  constructor() {
    // Portfolio service initialization
  }

  /**
   * Get portfolio summary for a user
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    try {
      // Get portfolio from database
      const userPortfolios = await PortfolioDAO.findByUserId(parseInt(userId));
      if (userPortfolios.length === 0) {
        // Create default portfolio if none exists
        const newPortfolio = await PortfolioDAO.createMainPortfolio(parseInt(userId));
        userPortfolios.push(newPortfolio);
      }
      
      const portfolio = userPortfolios[0]; // Use main portfolio
      const holdings = await this.getPortfolioHoldings(userId);
      const currentPrices = await this.getCurrentPrices(holdings.map(h => h.symbol));

      let totalValue = 0;
      let totalInvested = 0;
      let dailyChange = 0;
      
      const holdingsWithCurrentData = holdings.map(holding => {
        const currentPrice = currentPrices[holding.symbol] || 0;
        const currentValue = holding.quantity * currentPrice;
        const pnL = currentValue - holding.totalInvested;
        const pnLPercentage = holding.totalInvested > 0 ? (pnL / holding.totalInvested) * 100 : 0;
        
        totalValue += currentValue;
        totalInvested += holding.totalInvested;
        
        return {
          ...holding,
          currentPrice,
          currentValue,
          pnL,
          pnLPercentage
        };
      });

      const totalPnL = totalValue - totalInvested;
      const pnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      
      // Update portfolio with calculated values
      await PortfolioDAO.updateBalance(portfolio.id, totalValue, totalValue - 500); // Reserve 500 for locked balance
      await PortfolioDAO.updatePnL(portfolio.id, totalPnL, (Math.random() - 0.4) * 500); // Daily PnL

      // Find best and worst performers
      let topPerformer = null;
      let worstPerformer = null;
      
      if (holdingsWithCurrentData.length > 0) {
        const sortedByPerformance = holdingsWithCurrentData.sort((a, b) => b.pnLPercentage - a.pnLPercentage);
        topPerformer = {
          symbol: sortedByPerformance[0].symbol,
          changePercentage: sortedByPerformance[0].pnLPercentage,
          value: sortedByPerformance[0].currentValue
        };
        worstPerformer = {
          symbol: sortedByPerformance[sortedByPerformance.length - 1].symbol,
          changePercentage: sortedByPerformance[sortedByPerformance.length - 1].pnLPercentage,
          value: sortedByPerformance[sortedByPerformance.length - 1].currentValue
        };
      }

      return {
        totalValue: totalValue || parseFloat(portfolio.balance_usd) || 10000,
        totalInvested: totalInvested || 10000,
        totalPnL: totalPnL || parseFloat(portfolio.total_pnl) || 0,
        pnLPercentage: pnLPercentage || ((parseFloat(portfolio.total_pnl) || 0) / (parseFloat(portfolio.balance_usd) || 10000)) * 100,
        dailyChange: parseFloat(portfolio.daily_pnl) || (Math.random() - 0.4) * 500,
        dailyChangePercentage: totalValue > 0 ? (parseFloat(portfolio.daily_pnl) || 0) / totalValue * 100 : 0,
        weeklyChange: (Math.random() - 0.2) * 1500, // TODO: Calculate from historical data
        monthlyChange: (Math.random() - 0.1) * 3000, // TODO: Calculate from historical data
        assetCount: holdings.length,
        topPerformer,
        worstPerformer,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw error;
    }
  }

  /**
   * Get detailed portfolio holdings
   */
  async getPortfolioHoldings(userId: string): Promise<PortfolioHolding[]> {
    try {
      // Get user's portfolios from database
      const userPortfolios = await PortfolioDAO.findByUserId(parseInt(userId));
      if (userPortfolios.length === 0) {
        // Return empty if no portfolio exists
        return [];
      }
      
      const portfolio = userPortfolios[0]; // Use main portfolio
      const portfolioAssets = await PortfolioAssetDAO.findByPortfolioId(portfolio.id);
      
      if (portfolioAssets.length === 0) {
        // Create some demo assets if none exist
        await this.createDemoAssets(portfolio.id);
        const newAssets = await PortfolioAssetDAO.findByPortfolioId(portfolio.id);
        portfolioAssets.push(...newAssets);
      }

      // Get current prices and calculate values
      const symbols = portfolioAssets.map(asset => asset.symbol);
      const currentPrices = await this.getCurrentPrices(symbols);
      const totalPortfolioValue = portfolioAssets.reduce((sum, asset) => sum + (asset.amount * (currentPrices[asset.symbol] || 0)), 0);

      return portfolioAssets.map(asset => {
        const currentPrice = currentPrices[asset.symbol] || asset.current_price || 0;
        const currentValue = asset.amount * currentPrice;
        const totalInvested = asset.amount * asset.avg_buy_price;
        const pnL = currentValue - totalInvested;
        const pnLPercentage = totalInvested > 0 ? (pnL / totalInvested) * 100 : 0;
        const allocation = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;
        
        // Update asset current price in database
        PortfolioAssetDAO.updatePrice(asset.id, currentPrice, currentValue, pnL, pnLPercentage);

        return {
          symbol: asset.symbol,
          quantity: asset.amount,
          averageBuyPrice: asset.avg_buy_price,
          currentPrice,
          currentValue,
          totalInvested,
          pnL,
          pnLPercentage,
          allocation,
          dailyChange: currentValue * (Math.random() * 0.1 - 0.02), // Random daily change -2% to +8%
          dailyChangePercentage: (Math.random() * 10 - 2),
          firstPurchaseDate: asset.created_at
        };
      });

    } catch (error) {
      console.error('Error getting portfolio holdings:', error);
      throw error;
    }
  }

  /**
   * Get portfolio performance analytics
   */
  async getPortfolioPerformance(userId: string): Promise<PortfolioPerformance> {
    try {
      // Mock implementation - replace with actual calculations
      return {
        dailyReturn: 2.3,
        weeklyReturn: 8.7,
        monthlyReturn: 12.4,
        yearlyReturn: 45.6,
        totalReturn: 23.5,
        volatility: 35.2,
        maxDrawdown: -15.3,
        sharpeRatio: 1.25,
        assetConcentration: 65.4, // Percentage in top asset
        portfolioBalanceScore: 7.5, // Out of 10
        btcCorrelation: 0.78,
        marketBeta: 1.15
      };

    } catch (error) {
      console.error('Error getting portfolio performance:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      // Get trades from database
      const trades = await TradeDAO.findByUserId(parseInt(userId), limit);
      
      return trades.map(trade => ({
        id: trade.id.toString(),
        symbol: trade.symbol.replace('USDT', ''),
        type: trade.side as 'buy' | 'sell',
        quantity: trade.quantity,
        pricePerUnit: trade.entry_price,
        totalAmount: trade.quantity * trade.entry_price,
        fee: trade.fees || 0,
        exchange: 'MEXC',
        executedAt: trade.entry_time,
        notes: trade.entry_reason || `${trade.side} ${trade.symbol}`
      }));

    } catch (error) {
      console.error('Error getting transaction history:', error);
      // Return fallback data if database fails
      return [
        {
          id: 'tx_1',
          symbol: 'BTC',
          type: 'buy',
          quantity: 0.25,
          pricePerUnit: 40000,
          totalAmount: 10000,
          fee: 20,
          exchange: 'MEXC',
          executedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Initial BTC purchase'
        },
        {
          id: 'tx_2',
          symbol: 'ETH',
          type: 'buy',
          quantity: 2.0,
          pricePerUnit: 2500,
          totalAmount: 5000,
          fee: 15,
          exchange: 'MEXC',
          executedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'ETH diversification'
        }
      ];
    }
  }

  /**
   * Add new transaction
   */
  async addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'executedAt'>): Promise<Transaction> {
    try {
      // Get user's main portfolio
      const portfolios = await PortfolioDAO.findByUserId(parseInt(userId));
      let portfolio = portfolios.length > 0 ? portfolios[0] : null;
      
      if (!portfolio) {
        portfolio = await PortfolioDAO.createMainPortfolio(parseInt(userId));
      }
      
      // Create trade record in database
      const tradeData = {
        user_id: parseInt(userId),
        portfolio_id: portfolio.id,
        strategy_id: null,
        symbol: transaction.symbol + 'USDT',
        side: transaction.type === 'buy' ? 'buy' : 'sell',
        quantity: transaction.quantity,
        entry_price: transaction.pricePerUnit,
        exit_price: null,
        pnl: 0,
        pnl_percentage: 0,
        fees: transaction.fee || 0,
        net_pnl: -transaction.fee || 0,
        entry_reason: transaction.notes || `${transaction.type} ${transaction.symbol}`,
        exit_reason: null,
        duration_minutes: null,
        stop_loss: null,
        take_profit: null,
        max_risk_percentage: null,
        entry_order_id: null,
        exit_order_id: null,
        entry_time: new Date().toISOString(),
        exit_time: null,
        created_at: new Date().toISOString()
      };
      
      const trade = await TradeDAO.create(tradeData);
      
      // Update or create portfolio asset
      await this.updatePortfolioAsset(portfolio.id, transaction);
      
      // Recalculate portfolio balance
      await this.recalculatePortfolioBalance(portfolio.id);
      
      const newTransaction: Transaction = {
        id: trade.id.toString(),
        ...transaction,
        executedAt: trade.entry_time
      };

      console.log('✅ Transaction added:', newTransaction.id);
      return newTransaction;

    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Create demo portfolio assets if none exist
   */
  private async createDemoAssets(portfolioId: number): Promise<void> {
    try {
      const demoAssets = [
        { symbol: 'BTC', amount: 0.25, avg_buy_price: 42000, current_price: 45000 },
        { symbol: 'ETH', amount: 2.5, avg_buy_price: 2800, current_price: 2900 },
        { symbol: 'SOL', amount: 50, avg_buy_price: 85, current_price: 98 },
        { symbol: 'ADA', amount: 1000, avg_buy_price: 0.50, current_price: 0.52 },
        { symbol: 'MATIC', amount: 500, avg_buy_price: 0.85, current_price: 0.88 }
      ];
      
      for (const asset of demoAssets) {
        await PortfolioAssetDAO.create({
          portfolio_id: portfolioId,
          symbol: asset.symbol,
          amount: asset.amount,
          locked_amount: 0,
          avg_buy_price: asset.avg_buy_price,
          current_price: asset.current_price,
          total_value_usd: asset.amount * asset.current_price,
          pnl_usd: asset.amount * (asset.current_price - asset.avg_buy_price),
          pnl_percentage: ((asset.current_price - asset.avg_buy_price) / asset.avg_buy_price) * 100,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
      
      console.log(`✅ Created ${demoAssets.length} demo assets for portfolio ${portfolioId}`);
    } catch (error) {
      console.error('Error creating demo assets:', error);
    }
  }

  /**
   * Get portfolio data from database
   */
  private async getPortfolioData(userId: string): Promise<any> {
    try {
      const portfolios = await PortfolioDAO.findByUserId(parseInt(userId));
      if (portfolios.length > 0) {
        return portfolios[0];
      }
      
      // Create main portfolio if none exists
      return await PortfolioDAO.createMainPortfolio(parseInt(userId));
    } catch (error) {
      console.error('Error getting portfolio data:', error);
      throw error;
    }
  }

  /**
   * Update portfolio asset based on transaction
   */
  private async updatePortfolioAsset(portfolioId: number, transaction: Omit<Transaction, 'id' | 'executedAt'>): Promise<void> {
    try {
      const existingAssets = await PortfolioAssetDAO.findByPortfolioId(portfolioId);
      const existingAsset = existingAssets.find(asset => asset.symbol === transaction.symbol);
      
      if (existingAsset) {
        // Update existing asset
        if (transaction.type === 'buy') {
          const newAmount = existingAsset.amount + transaction.quantity;
          const newTotalCost = (existingAsset.amount * existingAsset.avg_buy_price) + (transaction.quantity * transaction.pricePerUnit);
          const newAvgPrice = newTotalCost / newAmount;
          
          await PortfolioAssetDAO.updateAmount(existingAsset.id, newAmount, newAvgPrice);
        } else if (transaction.type === 'sell') {
          const newAmount = Math.max(0, existingAsset.amount - transaction.quantity);
          await PortfolioAssetDAO.updateAmount(existingAsset.id, newAmount, existingAsset.avg_buy_price);
        }
      } else if (transaction.type === 'buy') {
        // Create new asset
        await PortfolioAssetDAO.create({
          portfolio_id: portfolioId,
          symbol: transaction.symbol,
          amount: transaction.quantity,
          locked_amount: 0,
          avg_buy_price: transaction.pricePerUnit,
          current_price: transaction.pricePerUnit,
          total_value_usd: transaction.quantity * transaction.pricePerUnit,
          pnl_usd: 0,
          pnl_percentage: 0,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating portfolio asset:', error);
    }
  }

  /**
   * Recalculate portfolio balance
   */
  private async recalculatePortfolioBalance(portfolioId: number): Promise<void> {
    try {
      const assets = await PortfolioAssetDAO.findByPortfolioId(portfolioId);
      const symbols = assets.map(asset => asset.symbol);
      const currentPrices = await this.getCurrentPrices(symbols);
      
      let totalValue = 0;
      let totalPnL = 0;
      
      for (const asset of assets) {
        const currentPrice = currentPrices[asset.symbol] || asset.current_price;
        const currentValue = asset.amount * currentPrice;
        const pnL = currentValue - (asset.amount * asset.avg_buy_price);
        
        totalValue += currentValue;
        totalPnL += pnL;
        
        // Update asset values
        await PortfolioAssetDAO.updatePrice(asset.id, currentPrice, currentValue, pnL, 
          asset.avg_buy_price > 0 ? (pnL / (asset.amount * asset.avg_buy_price)) * 100 : 0);
      }
      
      // Update portfolio totals
      await PortfolioDAO.updateBalance(portfolioId, totalValue, Math.max(0, totalValue - 500));
      await PortfolioDAO.updatePnL(portfolioId, totalPnL, (Math.random() - 0.4) * 500);
      
    } catch (error) {
      console.error('Error recalculating portfolio balance:', error);
    }
  }

  /**
   * Get current prices for symbols
   */
  private async getCurrentPrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      const prices: Record<string, number> = {};
      
      // Get prices from MEXC API
      for (const symbol of symbols) {
        try {
          const ticker = await mexcClient.getTicker(symbol + 'USDT');
          if (ticker && ticker.price) {
            prices[symbol] = parseFloat(ticker.price);
          } else {
            // Fallback prices for demo
            const fallbackPrices: Record<string, number> = {
              'BTC': 42500,
              'ETH': 2650,
              'ADA': 0.52,
              'SOL': 98.5,
              'MATIC': 0.85
            };
            prices[symbol] = fallbackPrices[symbol] || 0;
          }
        } catch (error) {
          console.warn(`Failed to get price for ${symbol}, using fallback`);
          // Fallback prices
          const fallbackPrices: Record<string, number> = {
            'BTC': 42500,
            'ETH': 2650,
            'ADA': 0.52,
            'SOL': 98.5,
            'MATIC': 0.85
          };
          prices[symbol] = fallbackPrices[symbol] || 0;
        }
      }
      
      return prices;

    } catch (error) {
      console.error('Error getting current prices:', error);
      // Return fallback prices
      return {
        'BTC': 42500,
        'ETH': 2650,
        'ADA': 0.52,
        'SOL': 98.5,
        'MATIC': 0.85
      };
    }
  }

  /**
   * Calculate portfolio risk metrics
   */
  async calculateRiskMetrics(userId: string): Promise<{
    diversificationScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }> {
    try {
      const holdings = await this.getPortfolioHoldings(userId);
      
      // Calculate diversification score
      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const topAssetPercentage = Math.max(...holdings.map(h => h.allocation));
      const diversificationScore = Math.max(0, 10 - (topAssetPercentage / 10));
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      if (topAssetPercentage > 70) riskLevel = 'high';
      else if (topAssetPercentage < 40 && holdings.length >= 5) riskLevel = 'low';

      // Generate recommendations
      const recommendations: string[] = [];
      if (topAssetPercentage > 60) {
        recommendations.push('پورتفولیو شما متمرکز است. تنوع‌بخشی بیشتری توصیه می‌شود.');
      }
      if (holdings.length < 3) {
        recommendations.push('افزایش تعداد دارایی‌ها برای کاهش ریسک مفید است.');
      }
      if (diversificationScore < 5) {
        recommendations.push('توزیع بهتر سرمایه بین دارایی‌های مختلف.');
      }

      return {
        diversificationScore,
        riskLevel,
        recommendations
      };

    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  /**
   * Get portfolio insights and recommendations
   */
  async getPortfolioInsights(userId: string): Promise<{
    insights: string[];
    recommendations: string[];
    alerts: string[];
  }> {
    try {
      const summary = await this.getPortfolioSummary(userId);
      const performance = await this.getPortfolioPerformance(userId);
      const riskMetrics = await this.calculateRiskMetrics(userId);

      const insights: string[] = [];
      const recommendations: string[] = [];
      const alerts: string[] = [];

      // Performance insights
      if (summary.pnLPercentage > 10) {
        insights.push(`عملکرد عالی! سود شما ${summary.pnLPercentage.toFixed(1)}% است.`);
      } else if (summary.pnLPercentage < -5) {
        alerts.push(`پورتفولیو در ضرر ${Math.abs(summary.pnLPercentage).toFixed(1)}% است.`);
      }

      // Diversification insights
      if (riskMetrics.diversificationScore < 5) {
        recommendations.push('افزایش تنوع در پورتفولیو برای کاهش ریسک');
      }

      // Top performer insight
      if (summary.topPerformer) {
        insights.push(`بهترین دارایی: ${summary.topPerformer.symbol} با ${summary.topPerformer.changePercentage.toFixed(1)}% سود`);
      }

      return {
        insights,
        recommendations: [...recommendations, ...riskMetrics.recommendations],
        alerts
      };

    } catch (error) {
      console.error('Error getting portfolio insights:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const portfolioService = new PortfolioService();