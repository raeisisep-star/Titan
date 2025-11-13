/**
 * MEXC-Only Enforcement Middleware
 * Task-8: Validate that only MEXC exchange is used
 */

import { Context, Next } from 'hono';

/**
 * List of supported exchanges (only MEXC currently)
 */
export const SUPPORTED_EXCHANGES = ['mexc'] as const;
export type SupportedExchange = typeof SUPPORTED_EXCHANGES[number];

/**
 * Check if exchange is supported
 */
export function isSupportedExchange(exchange: string): exchange is SupportedExchange {
  return SUPPORTED_EXCHANGES.includes(exchange as any);
}

/**
 * Middleware to enforce MEXC-only trading
 * Returns 422 Unprocessable Entity for non-MEXC exchanges
 */
export function mexcOnlyMiddleware() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    
    // Only apply to POST/PATCH requests (trading operations)
    if (method !== 'POST' && method !== 'PATCH') {
      return next();
    }
    
    // Check body for exchange parameter
    let body: any;
    try {
      const contentType = c.req.header('content-type');
      if (contentType?.includes('application/json')) {
        body = await c.req.json();
        
        // Re-set the body for downstream handlers (Hono doesn't allow multiple json() calls)
        // We'll store it in context
        c.set('parsedBody', body);
      }
    } catch (error) {
      // Invalid JSON - let validation middleware handle it
      return next();
    }
    
    // Check if exchange parameter exists
    const exchange = body?.exchange;
    
    if (exchange && !isSupportedExchange(exchange)) {
      return c.json({
        success: false,
        error: 'Unsupported exchange',
        message: `Only MEXC exchange is supported. Received: "${exchange}"`,
        supported_exchanges: SUPPORTED_EXCHANGES,
        code: 'UNSUPPORTED_EXCHANGE'
      }, 422);
    }
    
    // Check query parameters (e.g., /api/wallet/balances?exchange=binance)
    const queryExchange = c.req.query('exchange');
    
    if (queryExchange && !isSupportedExchange(queryExchange)) {
      return c.json({
        success: false,
        error: 'Unsupported exchange',
        message: `Only MEXC exchange is supported. Received: "${queryExchange}"`,
        supported_exchanges: SUPPORTED_EXCHANGES,
        code: 'UNSUPPORTED_EXCHANGE'
      }, 422);
    }
    
    return next();
  };
}

/**
 * Symbol normalization for MEXC
 * Converts various formats to MEXC format (e.g., BTC/USDT -> BTCUSDT)
 */
export function normalizeMEXCSymbol(symbol: string): string {
  // Remove slashes, hyphens, underscores, spaces
  let normalized = symbol.toUpperCase().replace(/[\/\-_ ]/g, '');
  
  // Common normalizations
  const normalizations: Record<string, string> = {
    'BTC': 'BTCUSDT',
    'ETH': 'ETHUSDT',
    'BNB': 'BNBUSDT'
  };
  
  // If symbol is just a base currency, append USDT
  if (normalized.length <= 4 && normalizations[normalized]) {
    return normalizations[normalized];
  }
  
  // Ensure ends with USDT if not already
  if (!normalized.endsWith('USDT') && !normalized.endsWith('USDC')) {
    // If symbol doesn't have quote currency, assume USDT
    if (normalized.length <= 6) {
      normalized += 'USDT';
    }
  }
  
  return normalized;
}

/**
 * Validate MEXC API key format
 */
export function validateMEXCApiKey(apiKey: string): boolean {
  // MEXC API keys are typically 32-64 characters alphanumeric
  return /^[a-zA-Z0-9]{32,64}$/.test(apiKey);
}

/**
 * Get parsed body from context (set by middleware)
 */
export function getParsedBody<T = any>(c: Context): T | null {
  return c.get('parsedBody') ?? null;
}
