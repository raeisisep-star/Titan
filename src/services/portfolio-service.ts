/**
 * Portfolio Analysis Service
 * Handles portfolio data, calculations, and analysis
 */

import { mexcClient } from './mexc-api';

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
      // Mock implementation - replace with actual database queries
      const portfolioData = await this.getPortfolioData(userId);
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
        totalValue,
        totalInvested,
        totalPnL,
        pnLPercentage,
        dailyChange: dailyChange,
        dailyChangePercentage: totalValue > 0 ? (dailyChange / totalValue) * 100 : 0,
        weeklyChange: 0, // Calculate from historical data
        monthlyChange: 0, // Calculate from historical data
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
      // Mock implementation - replace with database query
      const mockHoldings: PortfolioHolding[] = [
        {
          symbol: 'BTC',
          quantity: 0.25,
          averageBuyPrice: 40000,
          currentPrice: 0, // Will be filled by getCurrentPrices
          currentValue: 0,
          totalInvested: 10000,
          pnL: 0,
          pnLPercentage: 0,
          dailyChange: 0,
          dailyChangePercentage: 0,
          allocation: 0,
          firstPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          symbol: 'ETH',
          quantity: 2.0,
          averageBuyPrice: 2500,
          currentPrice: 0,
          currentValue: 0,
          totalInvested: 5000,
          pnL: 0,
          pnLPercentage: 0,
          dailyChange: 0,
          dailyChangePercentage: 0,
          allocation: 0,
          firstPurchaseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          symbol: 'ADA',
          quantity: 1000,
          averageBuyPrice: 0.50,
          currentPrice: 0,
          currentValue: 0,
          totalInvested: 500,
          pnL: 0,
          pnLPercentage: 0,
          dailyChange: 0,
          dailyChangePercentage: 0,
          allocation: 0,
          firstPurchaseDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Get current prices and calculate values
      const symbols = mockHoldings.map(h => h.symbol);
      const currentPrices = await this.getCurrentPrices(symbols);
      const totalPortfolioValue = mockHoldings.reduce((sum, h) => sum + (h.quantity * (currentPrices[h.symbol] || 0)), 0);

      return mockHoldings.map(holding => {
        const currentPrice = currentPrices[holding.symbol] || 0;
        const currentValue = holding.quantity * currentPrice;
        const pnL = currentValue - holding.totalInvested;
        const pnLPercentage = holding.totalInvested > 0 ? (pnL / holding.totalInvested) * 100 : 0;
        const allocation = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;

        return {
          ...holding,
          currentPrice,
          currentValue,
          pnL,
          pnLPercentage,
          allocation,
          dailyChange: currentValue * 0.023, // Mock 2.3% daily change
          dailyChangePercentage: 2.3
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
      // Mock implementation - replace with database query
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
        },
        {
          id: 'tx_3',
          symbol: 'ADA',
          type: 'buy',
          quantity: 1000,
          pricePerUnit: 0.50,
          totalAmount: 500,
          fee: 2,
          exchange: 'MEXC',
          executedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Small altcoin position'
        }
      ];

    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Add new transaction
   */
  async addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'executedAt'>): Promise<Transaction> {
    try {
      // Mock implementation - replace with database insert
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        ...transaction,
        executedAt: new Date().toISOString()
      };

      console.log('Adding transaction:', newTransaction);
      
      // Here you would:
      // 1. Insert into portfolio_transactions table
      // 2. Update portfolio_holdings via trigger
      // 3. Recalculate portfolio summary

      return newTransaction;

    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
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
   * Get portfolio data from database
   */
  private async getPortfolioData(userId: string): Promise<any> {
    try {
      // Mock implementation - replace with database query
      return {
        id: 1,
        userId: userId,
        portfolioName: 'Main Portfolio',
        totalInvested: 15500,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting portfolio data:', error);
      throw error;
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