/**
 * Real Market Data Service - TITAN Trading System
 * Provides real-time and historical market data from multiple sources
 */

export interface MarketDataConfig {
    sources: ('coingecko' | 'binance' | 'coinbase' | 'kraken')[];
    updateInterval: number; // milliseconds
    symbols: string[];
    enableCache: boolean;
}

export interface PriceData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    timestamp: number;
    source: string;
}

export interface OHLCVData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketDataResponse {
    success: boolean;
    data: PriceData[];
    timestamp: number;
    source: string;
    cached?: boolean;
}

export interface HistoricalDataResponse {
    success: boolean;
    symbol: string;
    data: OHLCVData[];
    timeframe: string;
    source: string;
}

export class MarketDataService {
    private config: MarketDataConfig;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 60000; // 1 minute cache

    constructor(config: MarketDataConfig) {
        this.config = config;
    }

    // Get real-time prices from multiple sources
    async getCurrentPrices(symbols?: string[]): Promise<MarketDataResponse> {
        const targetSymbols = symbols || this.config.symbols;
        const cacheKey = `prices_${targetSymbols.join('_')}`;

        // Check cache first
        if (this.config.enableCache && this.isCacheValid(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            return {
                success: true,
                data: cached!.data,
                timestamp: cached!.timestamp,
                source: 'cache',
                cached: true
            };
        }

        try {
            // Try multiple sources for reliability
            for (const source of this.config.sources) {
                try {
                    const data = await this.fetchFromSource(source, targetSymbols);
                    
                    // Cache the result
                    if (this.config.enableCache) {
                        this.cache.set(cacheKey, {
                            data,
                            timestamp: Date.now()
                        });
                    }

                    return {
                        success: true,
                        data,
                        timestamp: Date.now(),
                        source
                    };
                } catch (error) {
                    console.warn(`Failed to fetch from ${source}:`, error);
                    continue;
                }
            }

            throw new Error('All market data sources failed');
        } catch (error) {
            console.error('Market data fetch error:', error);
            return {
                success: false,
                data: [],
                timestamp: Date.now(),
                source: 'error'
            };
        }
    }

    // Get historical OHLCV data
    async getHistoricalData(
        symbol: string,
        timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1d',
        days: number = 30
    ): Promise<HistoricalDataResponse> {
        const cacheKey = `historical_${symbol}_${timeframe}_${days}`;

        if (this.config.enableCache && this.isCacheValid(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            return cached!.data;
        }

        try {
            // CoinGecko is most reliable for historical data
            const data = await this.fetchHistoricalFromCoinGecko(symbol, days);
            
            const result: HistoricalDataResponse = {
                success: true,
                symbol,
                data,
                timeframe,
                source: 'coingecko'
            };

            if (this.config.enableCache) {
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }

            return result;
        } catch (error) {
            console.error('Historical data fetch error:', error);
            return {
                success: false,
                symbol,
                data: [],
                timeframe,
                source: 'error'
            };
        }
    }

    // Fetch from specific source
    private async fetchFromSource(source: string, symbols: string[]): Promise<PriceData[]> {
        switch (source) {
            case 'coingecko':
                return this.fetchFromCoinGecko(symbols);
            case 'binance':
                return this.fetchFromBinance(symbols);
            case 'coinbase':
                return this.fetchFromCoinbase(symbols);
            case 'kraken':
                return this.fetchFromKraken(symbols);
            default:
                throw new Error(`Unknown source: ${source}`);
        }
    }

    // CoinGecko API implementation
    private async fetchFromCoinGecko(symbols: string[]): Promise<PriceData[]> {
        const coinIds = this.symbolsToCoinGeckoIds(symbols);
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        return Object.entries(data).map(([coinId, info]: [string, any]) => ({
            symbol: this.coinGeckoIdToSymbol(coinId),
            price: info.usd || 0,
            change24h: info.usd_24h_change || 0,
            volume24h: info.usd_24h_vol || 0,
            timestamp: Date.now(),
            source: 'coingecko'
        }));
    }

    // Binance API implementation
    private async fetchFromBinance(symbols: string[]): Promise<PriceData[]> {
        const binanceSymbols = symbols.map(s => `${s.replace('/', '')}USDT`);
        const url = `https://api.binance.com/api/v3/ticker/24hr`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
        }

        const data = await response.json();
        
        return data
            .filter((ticker: any) => binanceSymbols.includes(ticker.symbol))
            .map((ticker: any) => ({
                symbol: this.binanceSymbolToStandard(ticker.symbol),
                price: parseFloat(ticker.lastPrice),
                change24h: parseFloat(ticker.priceChangePercent),
                volume24h: parseFloat(ticker.volume),
                timestamp: Date.now(),
                source: 'binance'
            }));
    }

    // Coinbase Pro API implementation
    private async fetchFromCoinbase(symbols: string[]): Promise<PriceData[]> {
        const results: PriceData[] = [];

        for (const symbol of symbols) {
            try {
                const coinbaseSymbol = `${symbol.replace('/', '-')}`;
                const url = `https://api.coinbase.com/v2/exchange-rates?currency=${symbol.split('/')[0]}`;

                const response = await fetch(url);
                if (!response.ok) continue;

                const data = await response.json();
                const rate = data.data?.rates?.USD;

                if (rate) {
                    results.push({
                        symbol,
                        price: parseFloat(rate),
                        change24h: 0, // Coinbase doesn't provide 24h change in this endpoint
                        volume24h: 0,
                        timestamp: Date.now(),
                        source: 'coinbase'
                    });
                }
            } catch (error) {
                continue;
            }
        }

        return results;
    }

    // Kraken API implementation
    private async fetchFromKraken(symbols: string[]): Promise<PriceData[]> {
        const krakenSymbols = symbols.map(s => `${s.replace('/', '')}USD`);
        const url = `https://api.kraken.com/0/public/Ticker?pair=${krakenSymbols.join(',')}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Kraken API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error && data.error.length > 0) {
            throw new Error(`Kraken API error: ${data.error.join(', ')}`);
        }

        return Object.entries(data.result || {}).map(([pair, info]: [string, any]) => ({
            symbol: this.krakenSymbolToStandard(pair),
            price: parseFloat(info.c[0]),
            change24h: ((parseFloat(info.c[0]) - parseFloat(info.o)) / parseFloat(info.o)) * 100,
            volume24h: parseFloat(info.v[1]),
            timestamp: Date.now(),
            source: 'kraken'
        }));
    }

    // Fetch historical data from CoinGecko
    private async fetchHistoricalFromCoinGecko(symbol: string, days: number): Promise<OHLCVData[]> {
        const coinId = this.symbolsToCoinGeckoIds([symbol])[0];
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`CoinGecko historical data error: ${response.status}`);
        }

        const data = await response.json();
        
        return data.map((ohlc: number[]) => ({
            timestamp: ohlc[0],
            open: ohlc[1],
            high: ohlc[2],
            low: ohlc[3],
            close: ohlc[4],
            volume: 0 // CoinGecko OHLC doesn't include volume
        }));
    }

    // Helper methods for symbol conversion
    private symbolsToCoinGeckoIds(symbols: string[]): string[] {
        const mapping: Record<string, string> = {
            'BTC/USD': 'bitcoin',
            'ETH/USD': 'ethereum',
            'BNB/USD': 'binancecoin',
            'ADA/USD': 'cardano',
            'SOL/USD': 'solana',
            'DOT/USD': 'polkadot',
            'MATIC/USD': 'polygon',
            'AVAX/USD': 'avalanche-2',
            'LINK/USD': 'chainlink',
            'UNI/USD': 'uniswap'
        };

        return symbols.map(symbol => mapping[symbol] || symbol.toLowerCase().split('/')[0]);
    }

    private coinGeckoIdToSymbol(coinId: string): string {
        const mapping: Record<string, string> = {
            'bitcoin': 'BTC/USD',
            'ethereum': 'ETH/USD',
            'binancecoin': 'BNB/USD',
            'cardano': 'ADA/USD',
            'solana': 'SOL/USD',
            'polkadot': 'DOT/USD',
            'polygon': 'MATIC/USD',
            'avalanche-2': 'AVAX/USD',
            'chainlink': 'LINK/USD',
            'uniswap': 'UNI/USD'
        };

        return mapping[coinId] || `${coinId.toUpperCase()}/USD`;
    }

    private binanceSymbolToStandard(binanceSymbol: string): string {
        // Convert BTCUSDT to BTC/USD
        return binanceSymbol.replace('USDT', '/USD').replace('USDC', '/USD');
    }

    private krakenSymbolToStandard(krakenSymbol: string): string {
        // Convert XXBTZUSD to BTC/USD
        return krakenSymbol.replace('XXBT', 'BTC').replace('ZUSD', '/USD').replace('USD', '/USD');
    }

    // Cache management
    private isCacheValid(key: string): boolean {
        const cached = this.cache.get(key);
        if (!cached) return false;
        return (Date.now() - cached.timestamp) < this.CACHE_TTL;
    }

    public clearCache(): void {
        this.cache.clear();
    }

    // Real-time price streaming (WebSocket implementation for future)
    async startRealTimeStream(symbols: string[], callback: (data: PriceData) => void): Promise<void> {
        // For now, use polling - can be upgraded to WebSocket later
        const poll = async () => {
            try {
                const response = await this.getCurrentPrices(symbols);
                if (response.success) {
                    response.data.forEach(callback);
                }
            } catch (error) {
                console.error('Real-time stream error:', error);
            }
        };

        // Initial fetch
        await poll();

        // Set up polling
        setInterval(poll, this.config.updateInterval);
    }
}

// Factory function to create pre-configured service
export function createMarketDataService(): MarketDataService {
    return new MarketDataService({
        sources: ['coingecko', 'binance', 'coinbase'],
        updateInterval: 30000, // 30 seconds
        symbols: ['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD'],
        enableCache: true
    });
}

// Singleton instance
let marketDataServiceInstance: MarketDataService | null = null;

export function getMarketDataService(): MarketDataService {
    if (!marketDataServiceInstance) {
        marketDataServiceInstance = createMarketDataService();
    }
    return marketDataServiceInstance;
}