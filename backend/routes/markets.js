/**
 * Markets Routes - Internal Price & History Adapter
 * Provides centralized market data endpoints to prevent circuit breaker issues
 * with external APIs (CoinGecko, Binance, etc.)
 */

const { Hono } = require('hono');

const router = new Hono();

// Demo mode check
const isDemoMode = () => process.env.INTERNAL_APIS_DEMO === 'true';

// Response helpers
function ok(data, meta = {}) { 
  return { success: true, data, ...meta, timestamp: new Date().toISOString() }; 
}

function error(msg = 'Error', code = 500) { 
  return { success: false, error: msg, code, timestamp: new Date().toISOString() }; 
}

/**
 * GET /api/markets/:symbol/price
 * Get current price for a symbol
 */
router.get('/:symbol/price', async (c) => {
    const symbol = c.req.param('symbol');
    const symbolUpper = symbol.toUpperCase();
    
    if (isDemoMode()) {
        // Demo mode: return mock price data
        const mockPrices = {
            'BTC': 48500,
            'ETH': 2950,
            'BNB': 425,
            'SOL': 95,
            'ADA': 0.58,
            'XRP': 0.52,
            'DOT': 6.85,
            'MATIC': 0.92
        };
        
        const basePrice = mockPrices[symbolUpper] || 100;
        const volatility = basePrice * 0.01; // 1% volatility
        const change = (Math.random() - 0.5) * 2 * volatility;
        const price = basePrice + change;
        
        return c.json(ok({
            symbol: symbolUpper,
            price: price,
            volume: Math.floor(Math.random() * 1000000) + 500000,
            marketCap: price * Math.floor(Math.random() * 10000000) + 5000000,
            change24h: ((change / basePrice) * 100).toFixed(2),
            timestamp: Date.now()
        }));
    }
    
    // Production mode: connect to real exchange APIs
    return c.json(error('Production price API not yet implemented', 501), 501);
});

/**
 * GET /api/markets/:symbol/history
 * Get historical price data for a symbol
 */
router.get('/:symbol/history', async (c) => {
    const symbol = c.req.param('symbol');
    const symbolUpper = symbol.toUpperCase();
    const interval = c.req.query('interval') || '1d';
    const limit = parseInt(c.req.query('limit') || '200');
    
    if (isDemoMode()) {
        // Demo mode: generate mock historical data
        const now = Date.now();
        const points = Math.min(limit, 500); // Max 500 points
        const intervalMs = interval === '1h' ? 60 * 60 * 1000 
                         : interval === '4h' ? 4 * 60 * 60 * 1000
                         : 24 * 60 * 60 * 1000; // default 1d
        
        const mockPrices = {
            'BTC': 48500,
            'ETH': 2950,
            'BNB': 425,
            'SOL': 95,
            'ADA': 0.58,
            'XRP': 0.52,
            'DOT': 6.85,
            'MATIC': 0.92
        };
        
        const basePrice = mockPrices[symbolUpper] || 100;
        const history = [];
        
        for (let i = points - 1; i >= 0; i--) {
            const t = now - i * intervalMs;
            const volatility = basePrice * 0.02; // 2% volatility per candle
            
            const open = basePrice + (Math.random() - 0.5) * volatility;
            const high = open + Math.random() * volatility * 0.5;
            const low = open - Math.random() * volatility * 0.5;
            const close = low + Math.random() * (high - low);
            const volume = Math.floor(Math.random() * 1000000) + 500000;
            
            history.push({
                t: t,
                time: t,
                timestamp: t,
                o: Number(open.toFixed(2)),
                h: Number(high.toFixed(2)),
                l: Number(low.toFixed(2)),
                c: Number(close.toFixed(2)),
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                v: volume,
                volume: volume
            });
        }
        
        return c.json(ok(history, {
            symbol: symbolUpper,
            interval: interval,
            points: points,
            message: 'Historical data (demo mode)'
        }));
    }
    
    // Production mode: connect to real exchange APIs
    return c.json(error('Production history API not yet implemented', 501), 501);
});

/**
 * GET /api/markets/history
 * Batch history endpoint - get history for multiple symbols at once
 */
router.get('/history', async (c) => {
    const symbols = (c.req.query('symbols') || 'BTC,ETH').split(',').map(s => s.trim().toUpperCase());
    const interval = c.req.query('interval') || '1d';
    const limit = parseInt(c.req.query('limit') || '200');
    
    if (isDemoMode()) {
        const result = {};
        
        for (const symbol of symbols) {
            const now = Date.now();
            const points = Math.min(limit, 200);
            const intervalMs = interval === '1h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            
            const mockPrices = {
                'BTC': 48500,
                'ETH': 2950,
                'BNB': 425,
                'SOL': 95,
                'ADA': 0.58,
                'XRP': 0.52,
                'DOT': 6.85,
                'MATIC': 0.92
            };
            
            const basePrice = mockPrices[symbol] || 100;
            const history = [];
            
            for (let i = points - 1; i >= 0; i--) {
                const t = now - i * intervalMs;
                const close = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
                history.push({ t, c: Number(close.toFixed(2)), time: t, close: Number(close.toFixed(2)) });
            }
            
            result[symbol] = history;
        }
        
        return c.json(ok(result, {
            symbols: symbols,
            interval: interval,
            message: 'Batch historical data (demo mode)'
        }));
    }
    
    // Production mode: connect to real exchange APIs
    return c.json(errorResponse('Production batch history API not yet implemented', 501));
});

module.exports = router;
