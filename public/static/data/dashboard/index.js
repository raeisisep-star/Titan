/**
 * 📦 Dashboard Adapters - Main Export
 * 
 * Export مرکزی تمام adapters مربوط به Dashboard
 */

export { getBalance } from './balance.adapter.js';
export { getMarketPrices, getFearGreedIndex } from './market.adapter.js';
export { getActiveTrades, getTradesStats } from './activeTrades.adapter.js';
export { getComprehensiveDashboard } from './comprehensive.adapter.js';

// Re-export default objects
export { default as BalanceAdapter } from './balance.adapter.js';
export { default as MarketAdapter } from './market.adapter.js';
export { default as TradesAdapter } from './activeTrades.adapter.js';
export { default as ComprehensiveAdapter } from './comprehensive.adapter.js';
