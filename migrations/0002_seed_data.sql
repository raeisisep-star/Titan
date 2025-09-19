-- ============================================================================
-- 🌱 TITAN Trading System - Seed Data Migration
-- 
-- Initial data population for development and testing:
-- - System configuration
-- - Sample trading symbols
-- - Default AI models
-- - Sample strategies and data
-- ============================================================================

-- ============================================================================
-- ⚙️ SYSTEM CONFIGURATION
-- ============================================================================

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (key, value, data_type, description, is_public) VALUES
('app_name', 'TITAN Trading System', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Current application version', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('max_strategies_per_user', '10', 'integer', 'Maximum strategies per free user', true),
('max_backtests_per_strategy', '50', 'integer', 'Maximum backtests per strategy', true),
('default_commission', '0.001', 'float', 'Default commission rate (0.1%)', true),
('default_slippage', '0.0005', 'float', 'Default slippage (0.05%)', true),
('max_position_size', '0.25', 'float', 'Maximum position size (25%)', true),
('risk_free_rate', '0.02', 'float', 'Risk-free rate for calculations (2%)', true),
('data_retention_days', '365', 'integer', 'Data retention period in days', false),
('api_rate_limit_default', '1000', 'integer', 'Default API rate limit per hour', false),
('notification_batch_size', '100', 'integer', 'Notification batch processing size', false),
('backtest_timeout_minutes', '30', 'integer', 'Maximum backtest execution time', false);

-- ============================================================================
-- 💹 TRADING SYMBOLS & MARKET DATA
-- ============================================================================

-- Insert major cryptocurrency symbols
INSERT OR IGNORE INTO symbols (symbol, base_asset, quote_asset, exchange, symbol_type, is_active, description) VALUES
-- Bitcoin pairs
('BTC/USD', 'BTC', 'USD', 'BINANCE', 'spot', true, 'Bitcoin to US Dollar'),
('BTC/USDT', 'BTC', 'USDT', 'BINANCE', 'spot', true, 'Bitcoin to Tether'),
('BTC/EUR', 'BTC', 'EUR', 'BINANCE', 'spot', true, 'Bitcoin to Euro'),

-- Ethereum pairs
('ETH/USD', 'ETH', 'USD', 'BINANCE', 'spot', true, 'Ethereum to US Dollar'),
('ETH/USDT', 'ETH', 'USDT', 'BINANCE', 'spot', true, 'Ethereum to Tether'),
('ETH/BTC', 'ETH', 'BTC', 'BINANCE', 'spot', true, 'Ethereum to Bitcoin'),

-- Major altcoins
('ADA/USDT', 'ADA', 'USDT', 'BINANCE', 'spot', true, 'Cardano to Tether'),
('SOL/USDT', 'SOL', 'USDT', 'BINANCE', 'spot', true, 'Solana to Tether'),
('DOT/USDT', 'DOT', 'USDT', 'BINANCE', 'spot', true, 'Polkadot to Tether'),
('LINK/USDT', 'LINK', 'USDT', 'BINANCE', 'spot', true, 'Chainlink to Tether'),
('AVAX/USDT', 'AVAX', 'USDT', 'BINANCE', 'spot', true, 'Avalanche to Tether'),
('MATIC/USDT', 'MATIC', 'USDT', 'BINANCE', 'spot', true, 'Polygon to Tether'),
('UNI/USDT', 'UNI', 'USDT', 'BINANCE', 'spot', true, 'Uniswap to Tether'),
('ATOM/USDT', 'ATOM', 'USDT', 'BINANCE', 'spot', true, 'Cosmos to Tether'),

-- DeFi tokens
('AAVE/USDT', 'AAVE', 'USDT', 'BINANCE', 'spot', true, 'Aave to Tether'),
('CRV/USDT', 'CRV', 'USDT', 'BINANCE', 'spot', true, 'Curve DAO Token to Tether'),
('COMP/USDT', 'COMP', 'USDT', 'BINANCE', 'spot', true, 'Compound to Tether'),
('MKR/USDT', 'MKR', 'USDT', 'BINANCE', 'spot', true, 'Maker to Tether'),

-- Layer 2 and scaling solutions
('ARB/USDT', 'ARB', 'USDT', 'BINANCE', 'spot', true, 'Arbitrum to Tether'),
('OP/USDT', 'OP', 'USDT', 'BINANCE', 'spot', true, 'Optimism to Tether'),
('LRC/USDT', 'LRC', 'USDT', 'BINANCE', 'spot', true, 'Loopring to Tether'),

-- Meme coins (for diversification)
('DOGE/USDT', 'DOGE', 'USDT', 'BINANCE', 'spot', true, 'Dogecoin to Tether'),
('SHIB/USDT', 'SHIB', 'USDT', 'BINANCE', 'spot', true, 'Shiba Inu to Tether'),

-- Stablecoins
('USDC/USDT', 'USDC', 'USDT', 'BINANCE', 'spot', true, 'USD Coin to Tether'),
('DAI/USDT', 'DAI', 'USDT', 'BINANCE', 'spot', true, 'Dai to Tether'),
('BUSD/USDT', 'BUSD', 'USDT', 'BINANCE', 'spot', true, 'Binance USD to Tether');

-- Insert sample market ticker data
INSERT OR IGNORE INTO market_tickers (symbol, last_price, bid_price, ask_price, high_24h, low_24h, volume_24h, change_24h, change_pct_24h) VALUES
('BTC/USD', 43250.00, 43240.00, 43260.00, 44100.00, 42800.00, 1250000000.00, 450.00, 1.05),
('ETH/USD', 2650.00, 2648.50, 2651.50, 2720.00, 2580.00, 850000000.00, 35.00, 1.34),
('ADA/USDT', 0.485, 0.484, 0.486, 0.502, 0.468, 45000000.00, 0.008, 1.68),
('SOL/USDT', 98.50, 98.40, 98.60, 102.50, 95.20, 180000000.00, 2.10, 2.18),
('DOT/USDT', 7.25, 7.24, 7.26, 7.55, 7.02, 28000000.00, 0.15, 2.11),
('LINK/USDT', 15.80, 15.78, 15.82, 16.25, 15.35, 125000000.00, 0.25, 1.61),
('AVAX/USDT', 38.50, 38.45, 38.55, 40.20, 37.10, 95000000.00, 0.85, 2.26),
('MATIC/USDT', 0.925, 0.924, 0.926, 0.965, 0.895, 75000000.00, 0.018, 1.98);

-- ============================================================================
-- 🧠 AI MODELS CONFIGURATION
-- ============================================================================

-- Insert default AI models
INSERT OR IGNORE INTO ai_models (name, model_type, version, parameters, input_features, output_format, description, status, is_production) VALUES
-- Strategy validation models
('TITAN Strategy Validator v1.0', 'strategy_validation', '1.0.0', 
'{"confidence_threshold": 0.7, "ensemble_size": 3, "validation_methods": ["cross_validation", "monte_carlo", "bootstrap"]}',
'["sharpe_ratio", "max_drawdown", "win_rate", "profit_factor", "volatility", "skewness", "kurtosis"]',
'{"overall_score": "number", "validation_status": "string", "confidence": "number", "recommendations": "array"}',
'Advanced strategy validation using ensemble AI methods', 'active', true),

-- Market prediction models
('TITAN Price Predictor v2.1', 'market_prediction', '2.1.0',
'{"lookback_periods": 60, "prediction_horizon": 24, "feature_count": 25, "lstm_layers": 3}',
'["ohlcv", "volume_profile", "technical_indicators", "market_sentiment", "macro_indicators"]',
'{"predicted_price": "number", "direction": "string", "confidence": "number", "probability_distribution": "object"}',
'LSTM-based price prediction with multi-modal features', 'active', true),

-- Risk assessment models
('TITAN Risk Analyzer v1.5', 'risk_assessment', '1.5.0',
'{"risk_factors": ["market_risk", "liquidity_risk", "volatility_risk"], "confidence_level": 0.95}',
'["portfolio_composition", "correlation_matrix", "var_history", "market_conditions"]',
'{"risk_score": "number", "var_95": "number", "expected_shortfall": "number", "risk_factors": "array"}',
'Comprehensive portfolio risk assessment using modern risk metrics', 'active', true),

-- Sentiment analysis models
('TITAN Sentiment Engine v1.2', 'sentiment_analysis', '1.2.0',
'{"sentiment_sources": ["news", "social_media", "options_flow"], "aggregation_method": "weighted_average"}',
'["news_headlines", "social_mentions", "options_volume", "funding_rates"]',
'{"sentiment_score": "number", "bullish_probability": "number", "bearish_probability": "number", "confidence": "number"}',
'Multi-source market sentiment analysis', 'active', false);

-- ============================================================================
-- 👤 DEMO USER DATA
-- ============================================================================

-- Insert demo user (password: demo123!)
INSERT OR IGNORE INTO users (
    email, password_hash, first_name, last_name, username,
    timezone, currency, is_active, is_verified, risk_tolerance
) VALUES (
    'demo@titan-trading.com',
    '$2b$12$LQv3c1yqBwEHM/w4/yQI5eGl.6F2R9C8X5K8K5K8K5K8K5K8K5K8K5',  -- demo123!
    'Demo', 'User', 'demo_user',
    'UTC', 'USD', true, true, 'moderate'
);

-- Get the demo user ID (assuming it's 1 since it's the first insert)
-- In a real migration, you'd use a proper way to get the inserted ID

-- Insert demo portfolio
INSERT OR IGNORE INTO portfolios (
    user_id, name, description, base_currency, initial_value, current_value, is_paper_trading
) VALUES (
    1, 'Demo Portfolio', 'Demonstration portfolio for testing TITAN features', 'USD', 100000.00, 105250.00, true
);

-- ============================================================================
-- 📈 SAMPLE TRADING STRATEGIES
-- ============================================================================

-- Insert sample strategies
INSERT OR IGNORE INTO strategies (
    user_id, name, description, strategy_type, parameters, timeframe, symbols,
    max_position_size, stop_loss_pct, take_profit_pct, status, is_public
) VALUES 
-- Trend following strategy
(1, 'BTC Trend Follower', 'Simple moving average crossover strategy for Bitcoin', 'trend_following',
'{"fast_ma": 20, "slow_ma": 50, "rsi_oversold": 30, "rsi_overbought": 70, "volume_threshold": 1.5}',
'4h', '["BTC/USD", "BTC/USDT"]', 0.15, 3.0, 8.0, 'active', true),

-- Mean reversion strategy  
(1, 'ETH Mean Reversion', 'RSI-based mean reversion for Ethereum', 'mean_reversion',
'{"rsi_period": 14, "rsi_oversold": 25, "rsi_overbought": 75, "bollinger_period": 20, "bollinger_std": 2}',
'1h', '["ETH/USD", "ETH/USDT"]', 0.12, 2.5, 6.0, 'active', true),

-- Momentum strategy
(1, 'Altcoin Momentum', 'Multi-asset momentum strategy for altcoins', 'momentum',
'{"lookback_period": 10, "momentum_threshold": 0.05, "volume_confirmation": true, "max_positions": 5}',
'1d', '["ADA/USDT", "SOL/USDT", "DOT/USDT", "LINK/USDT", "AVAX/USDT"]', 0.08, 4.0, 12.0, 'active', true),

-- Scalping strategy (inactive for demo)
(1, 'BTC Scalping Bot', 'High-frequency scalping strategy for Bitcoin', 'scalping',
'{"tick_size": 0.01, "spread_threshold": 0.002, "position_hold_time": 300, "profit_target": 0.001}',
'1m', '["BTC/USDT"]', 0.05, 0.5, 0.8, 'paused', false);

-- ============================================================================
-- 🧪 SAMPLE BACKTEST DATA
-- ============================================================================

-- Insert sample backtests for the strategies
INSERT OR IGNORE INTO backtests (
    strategy_id, name, start_date, end_date, initial_capital,
    total_return, annualized_return, volatility, sharpe_ratio, max_drawdown,
    total_trades, winning_trades, win_rate, profit_factor, status
) VALUES
-- BTC Trend Follower backtest
(1, 'BTC Trend Q4 2023', '2023-10-01', '2023-12-31', 50000.00,
15.25, 18.30, 0.24, 0.76, -8.5, 24, 16, 66.67, 1.85, 'completed'),

-- ETH Mean Reversion backtest  
(2, 'ETH Mean Reversion Nov-Dec 2023', '2023-11-01', '2023-12-31', 30000.00,
8.75, 52.50, 0.32, 1.64, -4.2, 89, 58, 65.17, 2.12, 'completed'),

-- Altcoin Momentum backtest
(3, 'Altcoin Momentum Q4 2023', '2023-10-01', '2023-12-31', 75000.00,
22.40, 26.88, 0.28, 0.96, -12.1, 45, 31, 68.89, 2.35, 'completed');

-- ============================================================================
-- 🔔 SAMPLE ALERTS AND NOTIFICATIONS
-- ============================================================================

-- Insert sample alerts for demo user
INSERT OR IGNORE INTO alerts (
    user_id, name, alert_type, symbol, condition_type, threshold_value,
    notification_channels, is_active
) VALUES
-- Price alerts
(1, 'BTC Above $45K', 'price', 'BTC/USD', 'above', 45000.00, '["web", "email"]', true),
(1, 'ETH Below $2500', 'price', 'ETH/USD', 'below', 2500.00, '["web"]', true),

-- PnL alerts
(1, 'Portfolio Loss Alert', 'pnl', null, 'below', -5.00, '["web", "email"]', true),
(1, 'Daily Gain Alert', 'pnl', null, 'above', 2.00, '["web"]', true),

-- Risk alerts
(1, 'High Volatility Alert', 'risk', null, 'above', 0.40, '["web"]', true);

-- ============================================================================
-- 📊 SAMPLE PERFORMANCE DATA
-- ============================================================================

-- Insert sample performance snapshots
INSERT OR IGNORE INTO performance_snapshots (
    portfolio_id, snapshot_type, period_start, period_end,
    start_value, end_value, total_return, volatility, sharpe_ratio, max_drawdown,
    trades_count, win_rate, profit_factor
) VALUES
-- Daily snapshots for the last week
(1, 'daily', '2024-01-08', '2024-01-08', 105250.00, 106180.00, 0.88, 0.15, 0.58, -0.25, 3, 66.67, 1.85),
(1, 'daily', '2024-01-07', '2024-01-07', 104800.00, 105250.00, 0.43, 0.12, 0.36, -0.18, 2, 100.00, 2.15),
(1, 'daily', '2024-01-06', '2024-01-06', 104950.00, 104800.00, -0.14, 0.18, -0.08, -0.35, 4, 50.00, 0.95),
(1, 'daily', '2024-01-05', '2024-01-05', 104120.00, 104950.00, 0.80, 0.14, 0.57, -0.12, 5, 80.00, 2.35),

-- Weekly snapshot
(1, 'weekly', '2024-01-01', '2024-01-08', 102500.00, 106180.00, 3.59, 0.22, 0.63, -1.25, 18, 72.22, 1.95),

-- Monthly snapshot (partial)
(1, 'monthly', '2024-01-01', '2024-01-08', 100000.00, 106180.00, 6.18, 0.25, 0.45, -2.15, 35, 68.57, 1.78);

-- ============================================================================
-- 🔄 SYNC STATUS INITIALIZATION
-- ============================================================================

-- Initialize sync status for data sources
INSERT OR IGNORE INTO sync_status (data_source, last_sync_at, status, records_processed) VALUES
('BINANCE_PRICE_DATA', datetime('now', '-1 hour'), 'success', 2500),
('COINGECKO_MARKET_DATA', datetime('now', '-30 minutes'), 'success', 150),
('NEWS_SENTIMENT', datetime('now', '-15 minutes'), 'success', 45),
('SOCIAL_SENTIMENT', datetime('now', '-5 minutes'), 'success', 230),
('OPTIONS_FLOW', datetime('now', '-2 hours'), 'success', 89);

-- ============================================================================
-- 🎯 FINAL SETUP
-- ============================================================================

-- Update user statistics (demo user)
UPDATE users SET 
    updated_at = CURRENT_TIMESTAMP,
    last_login_at = datetime('now', '-2 hours')
WHERE id = 1;

-- Update strategy performance metrics
UPDATE strategies SET
    total_trades = (SELECT COUNT(*) FROM backtest_trades bt JOIN backtests b ON bt.backtest_id = b.id WHERE b.strategy_id = strategies.id),
    winning_trades = (SELECT COUNT(*) FROM backtest_trades bt JOIN backtests b ON bt.backtest_id = b.id WHERE b.strategy_id = strategies.id AND bt.net_pnl > 0),
    total_pnl = (SELECT COALESCE(SUM(bt.net_pnl), 0) FROM backtest_trades bt JOIN backtests b ON bt.backtest_id = b.id WHERE b.strategy_id = strategies.id),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- Calculate win rates for strategies
UPDATE strategies SET 
    win_rate = CASE 
        WHEN total_trades > 0 THEN ROUND((winning_trades * 100.0) / total_trades, 2)
        ELSE 0 
    END
WHERE user_id = 1;

-- Insert a final notification welcoming the demo user
INSERT INTO notifications (
    user_id, type, title, message, channel, status, priority, is_read
) VALUES (
    1, 'system', 'Welcome to TITAN Trading System!', 
    'Your demo account has been set up successfully. Explore our advanced trading features, AI-powered analytics, and comprehensive backtesting tools. Happy trading!', 
    'web', 'delivered', 'normal', false
);