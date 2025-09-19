/**
 * TITAN Trading System - Exchange Management Service
 * Centralized service for managing multiple exchange connections and operations
 * 
 * Features:
 * - Multi-exchange portfolio management
 * - Unified order routing and execution
 * - Cross-exchange arbitrage detection
 * - Real-time data aggregation from all exchanges
 * - Smart order routing based on liquidity and fees
 * - Risk management and position tracking across exchanges
 */

import { ExchangeConnector, Order, Balance, Ticker, OrderBook, Trade, OrderType, TimeInForce } from '../exchanges/exchange-connector';
import { BinanceConnector } from '../exchanges/binance-connector';
import { CoinbaseConnector } from '../exchanges/coinbase-connector';
import { KrakenConnector } from '../exchanges/kraken-connector';

export type ExchangeName = 'binance' | 'coinbase' | 'kraken';

interface ExchangeConfig {
  name: ExchangeName;
  enabled: boolean;
  credentials: any;
  priority: number; // Higher number = higher priority for order routing
  maxOrderSize?: number;
  tradingPairs: string[];
}

interface AggregatedTicker {
  symbol: string;
  exchanges: {
    [exchange: string]: {
      price: number;
      bid: number;
      ask: number;
      volume: number;
      timestamp: number;
    };
  };
  bestBid: { exchange: string; price: number };
  bestAsk: { exchange: string; price: number };
  spread: number;
  volumeWeightedPrice: number;
  timestamp: number;
}

interface AggregatedOrderBook {
  symbol: string;
  aggregatedBids: Array<{ price: number; quantity: number; exchange: string }>;
  aggregatedAsks: Array<{ price: number; quantity: number; exchange: string }>;
  bestBid: number;
  bestAsk: number;
  spread: number;
  totalBidVolume: number;
  totalAskVolume: number;
  timestamp: number;
}

interface PortfolioBalance {
  asset: string;
  totalBalance: number;
  exchanges: {
    [exchange: string]: {
      free: number;
      locked: number;
      total: number;
    };
  };
  allocation: {
    [exchange: string]: number; // Percentage
  };
}

interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercentage: number;
  maxVolume: number;
  estimatedProfit: number;
  timestamp: number;
}

interface SmartOrderRequest {
  symbol: string;
  type: OrderType;
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  timeInForce?: TimeInForce;
  preferredExchange?: ExchangeName;
  strategy?: 'best_price' | 'lowest_fee' | 'highest_liquidity' | 'split_order';
  maxSlippage?: number;
}

interface SmartOrderResult {
  orders: Array<{
    exchange: string;
    orderId: string;
    amount: number;
    price: number;
    status: string;
  }>;
  totalAmount: number;
  averagePrice: number;
  totalFee: number;
  executionTime: number;
}

export class ExchangeManagementService {
  private exchanges = new Map<ExchangeName, ExchangeConnector>();
  private configs = new Map<ExchangeName, ExchangeConfig>();
  private tickerSubscriptions = new Map<string, Set<(ticker: AggregatedTicker) => void>>();
  private orderBookSubscriptions = new Map<string, Set<(orderBook: AggregatedOrderBook) => void>>();
  private isInitialized = false;

  constructor() {
    // Initialize with default configurations
    this.setupDefaultConfigs();
  }

  /**
   * Initialize the exchange management service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize all configured exchanges
      for (const [name, config] of this.configs) {
        if (config.enabled) {
          await this.initializeExchange(name, config);
        }
      }

      this.isInitialized = true;
      console.log('Exchange Management Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Exchange Management Service:', error);
      throw error;
    }
  }

  /**
   * Add or update exchange configuration
   */
  async configureExchange(config: ExchangeConfig): Promise<void> {
    this.configs.set(config.name, config);

    if (config.enabled) {
      await this.initializeExchange(config.name, config);
    } else {
      this.disconnectExchange(config.name);
    }
  }

  /**
   * Get all exchange configurations
   */
  getExchangeConfigs(): ExchangeConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get connected exchanges
   */
  getConnectedExchanges(): ExchangeName[] {
    return Array.from(this.exchanges.keys()).filter(name => 
      this.exchanges.get(name)?.isConnected
    );
  }

  /**
   * Create smart order with automatic exchange selection
   */
  async createSmartOrder(request: SmartOrderRequest): Promise<SmartOrderResult> {
    const startTime = Date.now();

    try {
      if (request.preferredExchange && this.exchanges.has(request.preferredExchange)) {
        // Use preferred exchange if specified and available
        return await this.executeSingleExchangeOrder(request.preferredExchange, request);
      }

      switch (request.strategy || 'best_price') {
        case 'best_price':
          return await this.executeBestPriceOrder(request);
        case 'lowest_fee':
          return await this.executeLowestFeeOrder(request);
        case 'highest_liquidity':
          return await this.executeHighestLiquidityOrder(request);
        case 'split_order':
          return await this.executeSplitOrder(request);
        default:
          return await this.executeBestPriceOrder(request);
      }
    } catch (error) {
      console.error('Failed to create smart order:', error);
      throw error;
    }
  }

  /**
   * Cancel order on specific exchange
   */
  async cancelOrder(exchange: ExchangeName, orderId: string): Promise<boolean> {
    const connector = this.exchanges.get(exchange);
    if (!connector) {
      throw new Error(`Exchange ${exchange} not connected`);
    }

    return await connector.cancelOrder(orderId);
  }

  /**
   * Get aggregated portfolio balances across all exchanges
   */
  async getPortfolioBalances(): Promise<PortfolioBalance[]> {
    const balanceMap = new Map<string, PortfolioBalance>();

    for (const [exchangeName, connector] of this.exchanges) {
      try {
        const balances = await connector.getBalances();
        
        for (const balance of balances) {
          if (!balanceMap.has(balance.asset)) {
            balanceMap.set(balance.asset, {
              asset: balance.asset,
              totalBalance: 0,
              exchanges: {},
              allocation: {}
            });
          }

          const portfolioBalance = balanceMap.get(balance.asset)!;
          portfolioBalance.exchanges[exchangeName] = {
            free: balance.free,
            locked: balance.locked,
            total: balance.total
          };
          portfolioBalance.totalBalance += balance.total;
        }
      } catch (error) {
        console.error(`Failed to get balances from ${exchangeName}:`, error);
      }
    }

    // Calculate allocations
    for (const portfolioBalance of balanceMap.values()) {
      for (const [exchangeName, exchangeBalance] of Object.entries(portfolioBalance.exchanges)) {
        portfolioBalance.allocation[exchangeName] = 
          portfolioBalance.totalBalance > 0 
            ? (exchangeBalance.total / portfolioBalance.totalBalance) * 100
            : 0;
      }
    }

    return Array.from(balanceMap.values());
  }

  /**
   * Get aggregated ticker data from all exchanges
   */
  async getAggregatedTicker(symbol: string): Promise<AggregatedTicker | null> {
    const tickers = await this.getTickersFromAllExchanges(symbol);
    
    if (tickers.length === 0) {
      return null;
    }

    return this.aggregateTickers(symbol, tickers);
  }

  /**
   * Get aggregated order book from all exchanges
   */
  async getAggregatedOrderBook(symbol: string, limit?: number): Promise<AggregatedOrderBook | null> {
    const orderBooks = await this.getOrderBooksFromAllExchanges(symbol, limit);
    
    if (orderBooks.length === 0) {
      return null;
    }

    return this.aggregateOrderBooks(symbol, orderBooks);
  }

  /**
   * Detect arbitrage opportunities across exchanges
   */
  async detectArbitrageOpportunities(symbols: string[]): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const symbol of symbols) {
      try {
        const tickers = await this.getTickersFromAllExchanges(symbol);
        
        if (tickers.length < 2) {
          continue;
        }

        // Sort by ask price (ascending) and bid price (descending)
        const sortedByAsk = [...tickers].sort((a, b) => a.ticker.ask - b.ticker.ask);
        const sortedByBid = [...tickers].sort((a, b) => b.ticker.bid - a.ticker.bid);

        const lowestAsk = sortedByAsk[0];
        const highestBid = sortedByBid[0];

        if (lowestAsk.exchange !== highestBid.exchange && highestBid.ticker.bid > lowestAsk.ticker.ask) {
          const spread = highestBid.ticker.bid - lowestAsk.ticker.ask;
          const spreadPercentage = (spread / lowestAsk.ticker.ask) * 100;

          // Only consider opportunities with meaningful spread (>0.1%)
          if (spreadPercentage > 0.1) {
            const orderBooks = await this.getOrderBooksFromAllExchanges(symbol);
            const maxVolume = this.calculateArbitrageVolume(orderBooks, lowestAsk.exchange, highestBid.exchange);

            opportunities.push({
              symbol,
              buyExchange: lowestAsk.exchange,
              sellExchange: highestBid.exchange,
              buyPrice: lowestAsk.ticker.ask,
              sellPrice: highestBid.ticker.bid,
              spread,
              spreadPercentage,
              maxVolume,
              estimatedProfit: spread * maxVolume,
              timestamp: Date.now()
            });
          }
        }
      } catch (error) {
        console.error(`Failed to detect arbitrage for ${symbol}:`, error);
      }
    }

    return opportunities.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
  }

  /**
   * Subscribe to aggregated ticker updates
   */
  async subscribeToAggregatedTicker(symbol: string, callback: (ticker: AggregatedTicker) => void): Promise<void> {
    if (!this.tickerSubscriptions.has(symbol)) {
      this.tickerSubscriptions.set(symbol, new Set());
      
      // Subscribe to ticker on all exchanges
      for (const [exchangeName, connector] of this.exchanges) {
        try {
          await connector.subscribeToTicker(symbol, async (ticker) => {
            const aggregatedTicker = await this.getAggregatedTicker(symbol);
            if (aggregatedTicker) {
              this.tickerSubscriptions.get(symbol)?.forEach(cb => cb(aggregatedTicker));
            }
          });
        } catch (error) {
          console.error(`Failed to subscribe to ticker on ${exchangeName}:`, error);
        }
      }
    }
    
    this.tickerSubscriptions.get(symbol)!.add(callback);
  }

  /**
   * Subscribe to aggregated order book updates
   */
  async subscribeToAggregatedOrderBook(symbol: string, callback: (orderBook: AggregatedOrderBook) => void): Promise<void> {
    if (!this.orderBookSubscriptions.has(symbol)) {
      this.orderBookSubscriptions.set(symbol, new Set());
      
      // Subscribe to order book on all exchanges
      for (const [exchangeName, connector] of this.exchanges) {
        try {
          await connector.subscribeToOrderBook(symbol, async (orderBook) => {
            const aggregatedOrderBook = await this.getAggregatedOrderBook(symbol);
            if (aggregatedOrderBook) {
              this.orderBookSubscriptions.get(symbol)?.forEach(cb => cb(aggregatedOrderBook));
            }
          });
        } catch (error) {
          console.error(`Failed to subscribe to order book on ${exchangeName}:`, error);
        }
      }
    }
    
    this.orderBookSubscriptions.get(symbol)!.add(callback);
  }

  /**
   * Disconnect all exchanges and cleanup
   */
  disconnect(): void {
    for (const connector of this.exchanges.values()) {
      connector.disconnect();
    }
    
    this.exchanges.clear();
    this.tickerSubscriptions.clear();
    this.orderBookSubscriptions.clear();
    this.isInitialized = false;
  }

  // Private helper methods
  private setupDefaultConfigs(): void {
    this.configs.set('binance', {
      name: 'binance',
      enabled: false,
      credentials: {},
      priority: 3,
      tradingPairs: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT']
    });

    this.configs.set('coinbase', {
      name: 'coinbase',
      enabled: false,
      credentials: {},
      priority: 2,
      tradingPairs: ['BTCUSDT', 'ETHUSDT', 'LTCUSDT']
    });

    this.configs.set('kraken', {
      name: 'kraken',
      enabled: false,
      credentials: {},
      priority: 1,
      tradingPairs: ['BTCUSDT', 'ETHUSDT', 'ADAUSDT']
    });
  }

  private async initializeExchange(name: ExchangeName, config: ExchangeConfig): Promise<void> {
    try {
      let connector: ExchangeConnector;

      switch (name) {
        case 'binance':
          connector = new BinanceConnector(config.credentials);
          break;
        case 'coinbase':
          connector = new CoinbaseConnector(config.credentials);
          break;
        case 'kraken':
          connector = new KrakenConnector(config.credentials);
          break;
        default:
          throw new Error(`Unsupported exchange: ${name}`);
      }

      await connector.initialize();
      this.exchanges.set(name, connector);
      
      console.log(`${name} exchange initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize ${name} exchange:`, error);
      throw error;
    }
  }

  private disconnectExchange(name: ExchangeName): void {
    const connector = this.exchanges.get(name);
    if (connector) {
      connector.disconnect();
      this.exchanges.delete(name);
    }
  }

  private async executeSingleExchangeOrder(exchange: ExchangeName, request: SmartOrderRequest): Promise<SmartOrderResult> {
    const connector = this.exchanges.get(exchange);
    if (!connector) {
      throw new Error(`Exchange ${exchange} not connected`);
    }

    const startTime = Date.now();
    const order = await connector.createOrder(
      request.symbol,
      request.type,
      request.side,
      request.amount,
      request.price,
      request.timeInForce
    );

    return {
      orders: [{
        exchange,
        orderId: order.id,
        amount: order.amount,
        price: order.price,
        status: order.status
      }],
      totalAmount: order.amount,
      averagePrice: order.price,
      totalFee: order.fee || 0,
      executionTime: Date.now() - startTime
    };
  }

  private async executeBestPriceOrder(request: SmartOrderRequest): Promise<SmartOrderResult> {
    const tickers = await this.getTickersFromAllExchanges(request.symbol);
    
    if (tickers.length === 0) {
      throw new Error('No exchange available for trading');
    }

    // Find exchange with best price
    const bestExchange = request.side === 'buy'
      ? tickers.reduce((best, current) => 
          current.ticker.ask < best.ticker.ask ? current : best
        )
      : tickers.reduce((best, current) => 
          current.ticker.bid > best.ticker.bid ? current : best
        );

    return await this.executeSingleExchangeOrder(bestExchange.exchange as ExchangeName, request);
  }

  private async executeLowestFeeOrder(request: SmartOrderRequest): Promise<SmartOrderResult> {
    // For now, use priority as a proxy for fees (higher priority = lower fees)
    const availableExchanges = Array.from(this.exchanges.keys())
      .map(name => ({
        name,
        priority: this.configs.get(name)?.priority || 0
      }))
      .sort((a, b) => b.priority - a.priority);

    if (availableExchanges.length === 0) {
      throw new Error('No exchange available for trading');
    }

    return await this.executeSingleExchangeOrder(availableExchanges[0].name, request);
  }

  private async executeHighestLiquidityOrder(request: SmartOrderRequest): Promise<SmartOrderResult> {
    const orderBooks = await this.getOrderBooksFromAllExchanges(request.symbol);
    
    if (orderBooks.length === 0) {
      throw new Error('No exchange available for trading');
    }

    // Find exchange with highest liquidity
    const bestExchange = orderBooks.reduce((best, current) => {
      const currentLiquidity = request.side === 'buy'
        ? current.orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)
        : current.orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0);
      
      const bestLiquidity = request.side === 'buy'
        ? best.orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)
        : best.orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0);

      return currentLiquidity > bestLiquidity ? current : best;
    });

    return await this.executeSingleExchangeOrder(bestExchange.exchange as ExchangeName, request);
  }

  private async executeSplitOrder(request: SmartOrderRequest): Promise<SmartOrderResult> {
    const connectedExchanges = this.getConnectedExchanges();
    
    if (connectedExchanges.length === 0) {
      throw new Error('No exchange available for trading');
    }

    const orders = [];
    const amountPerExchange = request.amount / connectedExchanges.length;
    let totalFee = 0;
    let totalAmount = 0;
    let weightedPriceSum = 0;

    for (const exchange of connectedExchanges) {
      try {
        const result = await this.executeSingleExchangeOrder(exchange, {
          ...request,
          amount: amountPerExchange
        });

        orders.push(...result.orders);
        totalFee += result.totalFee;
        totalAmount += result.totalAmount;
        weightedPriceSum += result.averagePrice * result.totalAmount;
      } catch (error) {
        console.error(`Failed to execute order on ${exchange}:`, error);
      }
    }

    return {
      orders,
      totalAmount,
      averagePrice: totalAmount > 0 ? weightedPriceSum / totalAmount : 0,
      totalFee,
      executionTime: Date.now()
    };
  }

  private async getTickersFromAllExchanges(symbol: string): Promise<Array<{exchange: string, ticker: Ticker}>> {
    const results = [];
    
    for (const [exchangeName, connector] of this.exchanges) {
      try {
        const ticker = await connector.getTicker(symbol);
        if (ticker) {
          results.push({ exchange: exchangeName, ticker });
        }
      } catch (error) {
        console.error(`Failed to get ticker from ${exchangeName}:`, error);
      }
    }
    
    return results;
  }

  private async getOrderBooksFromAllExchanges(symbol: string, limit?: number): Promise<Array<{exchange: string, orderBook: OrderBook}>> {
    const results = [];
    
    for (const [exchangeName, connector] of this.exchanges) {
      try {
        const orderBook = await connector.getOrderBook(symbol, limit);
        if (orderBook) {
          results.push({ exchange: exchangeName, orderBook });
        }
      } catch (error) {
        console.error(`Failed to get order book from ${exchangeName}:`, error);
      }
    }
    
    return results;
  }

  private aggregateTickers(symbol: string, tickers: Array<{exchange: string, ticker: Ticker}>): AggregatedTicker {
    const exchanges: any = {};
    let totalVolume = 0;
    let volumeWeightedPriceSum = 0;
    let bestBid = { exchange: '', price: 0 };
    let bestAsk = { exchange: '', price: Infinity };

    for (const { exchange, ticker } of tickers) {
      exchanges[exchange] = {
        price: ticker.price,
        bid: ticker.bid,
        ask: ticker.ask,
        volume: ticker.volume,
        timestamp: ticker.timestamp
      };

      totalVolume += ticker.volume;
      volumeWeightedPriceSum += ticker.price * ticker.volume;

      if (ticker.bid > bestBid.price) {
        bestBid = { exchange, price: ticker.bid };
      }

      if (ticker.ask < bestAsk.price) {
        bestAsk = { exchange, price: ticker.ask };
      }
    }

    return {
      symbol,
      exchanges,
      bestBid,
      bestAsk,
      spread: bestAsk.price - bestBid.price,
      volumeWeightedPrice: totalVolume > 0 ? volumeWeightedPriceSum / totalVolume : 0,
      timestamp: Date.now()
    };
  }

  private aggregateOrderBooks(symbol: string, orderBooks: Array<{exchange: string, orderBook: OrderBook}>): AggregatedOrderBook {
    const aggregatedBids: Array<{ price: number; quantity: number; exchange: string }> = [];
    const aggregatedAsks: Array<{ price: number; quantity: number; exchange: string }> = [];

    for (const { exchange, orderBook } of orderBooks) {
      for (const bid of orderBook.bids) {
        aggregatedBids.push({ ...bid, exchange });
      }
      for (const ask of orderBook.asks) {
        aggregatedAsks.push({ ...ask, exchange });
      }
    }

    // Sort bids by price (descending) and asks by price (ascending)
    aggregatedBids.sort((a, b) => b.price - a.price);
    aggregatedAsks.sort((a, b) => a.price - b.price);

    const bestBid = aggregatedBids[0]?.price || 0;
    const bestAsk = aggregatedAsks[0]?.price || 0;
    const totalBidVolume = aggregatedBids.reduce((sum, bid) => sum + bid.quantity, 0);
    const totalAskVolume = aggregatedAsks.reduce((sum, ask) => sum + ask.quantity, 0);

    return {
      symbol,
      aggregatedBids,
      aggregatedAsks,
      bestBid,
      bestAsk,
      spread: bestAsk - bestBid,
      totalBidVolume,
      totalAskVolume,
      timestamp: Date.now()
    };
  }

  private calculateArbitrageVolume(orderBooks: Array<{exchange: string, orderBook: OrderBook}>, buyExchange: string, sellExchange: string): number {
    const buyOrderBook = orderBooks.find(ob => ob.exchange === buyExchange)?.orderBook;
    const sellOrderBook = orderBooks.find(ob => ob.exchange === sellExchange)?.orderBook;

    if (!buyOrderBook || !sellOrderBook) {
      return 0;
    }

    // Calculate maximum volume that can be traded profitably
    let maxVolume = 0;
    let buyIndex = 0;
    let sellIndex = 0;

    while (buyIndex < buyOrderBook.asks.length && sellIndex < sellOrderBook.bids.length) {
      const askPrice = buyOrderBook.asks[buyIndex].price;
      const bidPrice = sellOrderBook.bids[sellIndex].price;

      if (bidPrice <= askPrice) {
        break; // No more profitable trades
      }

      const askQuantity = buyOrderBook.asks[buyIndex].quantity;
      const bidQuantity = sellOrderBook.bids[sellIndex].quantity;
      const tradeVolume = Math.min(askQuantity, bidQuantity);

      maxVolume += tradeVolume;

      if (askQuantity <= bidQuantity) {
        buyIndex++;
      }
      if (bidQuantity <= askQuantity) {
        sellIndex++;
      }
    }

    return maxVolume;
  }
}