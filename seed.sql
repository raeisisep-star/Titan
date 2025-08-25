-- TITAN Trading System - Seed Data
-- Test data for development and demonstration

-- ===========================
-- Insert Test Users
-- ===========================

INSERT OR IGNORE INTO users (username, email, password_hash, full_name, role, settings) VALUES 
  ('admin', 'admin@titan-trading.com', '$2b$12$LQv3c1yqBwEHxPuNYjNOuuz3P3DZzN9E2.XZG8ZNsY8P5.4RkVIti', 'مدیر سیستم تایتان', 'admin', '{"language": "fa", "theme": "dark", "notifications": {"email": true, "telegram": true, "inapp": true}}'),
  ('trader1', 'trader@titan-trading.com', '$2b$12$LQv3c1yqBwEHxPuNYjNOuuz3P3DZzN9E2.XZG8ZNsY8P5.4RkVIti', 'معامله‌گر اول', 'trader', '{"language": "fa", "theme": "dark", "risk_tolerance": "medium"}'),
  ('analyst', 'analyst@titan-trading.com', '$2b$12$LQv3c1yqBwEHxPuNYjNOuuz3P3DZzN9E2.XZG8ZNsY8P5.4RkVIti', 'تحلیل‌گر بازار', 'analyst', '{"language": "fa", "theme": "dark", "ai_preferences": {"provider": "openai"}}'),
  ('demo_user', 'demo@titan-trading.com', '$2b$12$LQv3c1yqBwEHxPuNYjNOuuz3P3DZzN9E2.XZG8ZNsY8P5.4RkVIti', 'کاربر نمایشی', 'user', '{"language": "fa", "theme": "dark", "demo_mode": true}');

-- ===========================
-- Insert Test Trading Accounts
-- ===========================

INSERT OR IGNORE INTO trading_accounts (user_id, exchange, account_name, is_testnet, is_active, balance_usd) VALUES 
  (1, 'demo', 'حساب نمایشی مدیر', TRUE, TRUE, 100000.00),
  (2, 'demo', 'حساب نمایشی معامله‌گر', TRUE, TRUE, 50000.00),
  (3, 'demo', 'حساب تحلیل‌گر', TRUE, TRUE, 25000.00),
  (4, 'demo', 'حساب آزمایشی', TRUE, TRUE, 10000.00),
  (1, 'binance', 'Binance Testnet', TRUE, TRUE, 0.00),
  (2, 'coinbase', 'Coinbase Sandbox', TRUE, TRUE, 0.00);

-- ===========================
-- Insert Test Portfolios
-- ===========================

INSERT OR IGNORE INTO portfolios (user_id, name, total_value_usd, total_pnl_usd, total_pnl_percentage, risk_level) VALUES 
  (1, 'پورتفولیو اصلی مدیر', 98500.00, -1500.00, -1.50, 'medium'),
  (2, 'پورتفولیو معامله‌گر', 52350.00, 2350.00, 4.70, 'high'),
  (3, 'پورتفولیو تحلیل‌گری', 24800.00, -200.00, -0.80, 'low'),
  (4, 'پورتفولیو آزمایشی', 9950.00, -50.00, -0.50, 'medium');

-- ===========================
-- Insert Test Holdings
-- ===========================

INSERT OR IGNORE INTO holdings (portfolio_id, trading_account_id, symbol, quantity, average_cost, current_price, market_value_usd, pnl_usd, pnl_percentage, allocation_percentage) VALUES 
  -- Portfolio 1 (Admin)
  (1, 1, 'BTC', 1.5, 45000.00, 43000.00, 64500.00, -3000.00, -4.44, 65.48),
  (1, 1, 'ETH', 10.0, 2800.00, 2600.00, 26000.00, -2000.00, -7.14, 26.40),
  (1, 1, 'BNB', 50.0, 350.00, 320.00, 16000.00, -1500.00, -8.57, 16.24),
  
  -- Portfolio 2 (Trader)  
  (2, 2, 'BTC', 0.8, 44000.00, 43000.00, 34400.00, -800.00, -2.27, 65.73),
  (2, 2, 'SOL', 100.0, 120.00, 140.00, 14000.00, 2000.00, 16.67, 26.74),
  (2, 2, 'ADA', 5000.0, 0.45, 0.38, 1900.00, -350.00, -15.56, 3.63),
  
  -- Portfolio 3 (Analyst)
  (3, 3, 'ETH', 8.0, 2750.00, 2600.00, 20800.00, -1200.00, -5.45, 83.87),
  (3, 3, 'LINK', 200.0, 18.00, 15.50, 3100.00, -500.00, -13.89, 12.50),
  (3, 3, 'UNI', 150.0, 6.00, 5.50, 825.00, -75.00, -8.33, 3.33),
  
  -- Portfolio 4 (Demo User)
  (4, 4, 'BTC', 0.2, 45000.00, 43000.00, 8600.00, -400.00, -4.44, 86.43),
  (4, 4, 'DOGE', 10000.0, 0.08, 0.07, 700.00, -100.00, -12.50, 7.04),
  (4, 4, 'MATIC', 1000.0, 0.85, 0.65, 650.00, -200.00, -23.53, 6.53);

-- ===========================
-- Insert Test Trades  
-- ===========================

INSERT OR IGNORE INTO trades (user_id, trading_account_id, portfolio_id, symbol, side, type, status, quantity, price, filled_quantity, average_fill_price, total_value, strategy, ai_agent, ai_confidence, execution_time) VALUES 
  (1, 1, 1, 'BTC', 'buy', 'market', 'filled', 0.5, 45000.00, 0.5, 45000.00, 22500.00, 'manual', 'artemis', 85.5, datetime('now', '-7 days')),
  (1, 1, 1, 'BTC', 'buy', 'limit', 'filled', 1.0, 44500.00, 1.0, 44500.00, 44500.00, 'dca', 'artemis', 78.2, datetime('now', '-5 days')),
  (2, 2, 2, 'SOL', 'buy', 'market', 'filled', 100.0, 120.00, 100.0, 120.00, 12000.00, 'momentum', 'artemis', 92.1, datetime('now', '-3 days')),
  (2, 2, 2, 'ADA', 'buy', 'limit', 'filled', 5000.0, 0.45, 5000.0, 0.45, 2250.00, 'grid', 'artemis', 67.8, datetime('now', '-2 days')),
  (3, 3, 3, 'ETH', 'buy', 'market', 'filled', 8.0, 2750.00, 8.0, 2750.00, 22000.00, 'manual', 'artemis', 88.9, datetime('now', '-6 days')),
  (4, 4, 4, 'BTC', 'buy', 'market', 'filled', 0.2, 45000.00, 0.2, 45000.00, 9000.00, 'demo', 'artemis', 75.0, datetime('now', '-4 days'));

-- ===========================
-- Insert Test AI Analyses
-- ===========================

INSERT OR IGNORE INTO ai_analyses (user_id, symbol, analysis_type, ai_provider, model_used, analysis_result, confidence_score, risk_level, signals, price_targets, recommendations, processing_time_ms, tokens_used, expires_at) VALUES 
  (1, 'BTC', 'market_analysis', 'openai', 'gpt-4o-mini', '{"summary": "بازار بیت‌کوین در حال حاضر در روند تصحیحی قرار دارد. سطح حمایت قوی در 42000 دلار و مقاومت در 48000 دلار", "details": "تحلیل تکنیکال نشان‌دهنده احتمال بازگشت قیمت"}', 78.5, 'medium', '{"buy": 65, "sell": 15, "hold": 20}', '{"short_term": 44000, "medium_term": 47000, "long_term": 52000}', '["نگهداری موقعیت فعلی", "انتظار برای شکست مقاومت"]', 2150, 842, datetime('now', '+2 hours')),
  
  (2, 'SOL', 'price_prediction', 'anthropic', 'claude-3-haiku', '{"summary": "سولانا پتانسیل رشد قوی در کوتاه‌مدت دارد. شبکه سولانا رشد DeFi قابل توجهی داشته", "details": "عوامل بنیادی مثبت و حجم معاملات بالا"}', 85.2, 'low', '{"buy": 80, "sell": 5, "hold": 15}', '{"short_term": 145, "medium_term": 160, "long_term": 180}', '["فرصت خرید مناسب", "مدیریت ریسک با استاپ لاس"]', 1890, 654, datetime('now', '+1 hour')),
  
  (3, 'ETH', 'trade_signal', 'openai', 'gpt-4o-mini', '{"summary": "اتریوم سیگنال خرید ضعیف دارد. انتظار تحکیم در محدوده فعلی", "details": "RSI در ناحیه خنثی و حجم معاملات پایین"}', 62.8, 'medium', '{"buy": 45, "sell": 25, "hold": 30}', '{"short_term": 2700, "medium_term": 2900, "long_term": 3200}', '["انتظار برای سیگنال قوی‌تر", "نظارت بر حجم معاملات"]', 2340, 756, datetime('now', '+3 hours'));

-- ===========================
-- Insert Test Market Data
-- ===========================

INSERT OR IGNORE INTO market_data (symbol, exchange, price, volume_24h, market_cap, change_1h, change_24h, change_7d, high_24h, low_24h, data_source) VALUES 
  ('BTC', 'coingecko', 43000.00, 25000000000.00, 845000000000.00, -0.5, -2.1, -5.8, 44200.00, 42800.00, 'coingecko'),
  ('ETH', 'coingecko', 2600.00, 12000000000.00, 312000000000.00, 0.2, -1.8, -3.2, 2650.00, 2580.00, 'coingecko'),
  ('BNB', 'coingecko', 320.00, 1200000000.00, 49600000000.00, -0.8, -3.5, -7.2, 335.00, 315.00, 'coingecko'),
  ('SOL', 'coingecko', 140.00, 2800000000.00, 60200000000.00, 1.2, 8.5, 15.3, 142.00, 128.00, 'coingecko'),
  ('ADA', 'coingecko', 0.38, 350000000.00, 13300000000.00, -1.5, -12.8, -18.5, 0.42, 0.37, 'coingecko'),
  ('LINK', 'coingecko', 15.50, 480000000.00, 9610000000.00, 0.8, -4.2, -8.1, 16.20, 15.10, 'coingecko'),
  ('UNI', 'coingecko', 5.50, 180000000.00, 4125000000.00, -2.1, -6.8, -11.2, 5.85, 5.40, 'coingecko'),
  ('DOGE', 'coingecko', 0.07, 950000000.00, 10220000000.00, 0.5, -8.9, -15.6, 0.078, 0.068, 'coingecko'),
  ('MATIC', 'coingecko', 0.65, 420000000.00, 6370000000.00, -1.8, -15.2, -22.1, 0.74, 0.63, 'coingecko');

-- ===========================
-- Insert Test Price History (Last 24 hours)
-- ===========================

INSERT OR IGNORE INTO price_history (symbol, timeframe, open_price, high_price, low_price, close_price, volume, timestamp) VALUES 
  -- BTC 1h candles
  ('BTC', '1h', 43500.00, 43800.00, 43200.00, 43000.00, 1200000000.00, datetime('now', '-1 hour')),
  ('BTC', '1h', 43800.00, 44000.00, 43400.00, 43500.00, 1350000000.00, datetime('now', '-2 hours')),
  ('BTC', '1h', 44200.00, 44300.00, 43700.00, 43800.00, 1180000000.00, datetime('now', '-3 hours')),
  
  -- ETH 1h candles  
  ('ETH', '1h', 2620.00, 2635.00, 2590.00, 2600.00, 520000000.00, datetime('now', '-1 hour')),
  ('ETH', '1h', 2640.00, 2650.00, 2615.00, 2620.00, 580000000.00, datetime('now', '-2 hours')),
  ('ETH', '1h', 2630.00, 2645.00, 2625.00, 2640.00, 490000000.00, datetime('now', '-3 hours')),
  
  -- SOL 1h candles
  ('SOL', '1h', 138.50, 141.00, 137.80, 140.00, 125000000.00, datetime('now', '-1 hour')),
  ('SOL', '1h', 135.20, 139.80, 134.50, 138.50, 142000000.00, datetime('now', '-2 hours')),
  ('SOL', '1h', 132.80, 136.40, 131.90, 135.20, 118000000.00, datetime('now', '-3 hours'));

-- ===========================
-- Insert Test Notifications
-- ===========================

INSERT OR IGNORE INTO notifications (user_id, type, title, message, priority, channels, status, data) VALUES 
  (1, 'trade_alert', 'معامله تکمیل شد', 'خرید 0.5 BTC به قیمت $45,000 با موفقیت انجام شد', 'high', '["inapp", "telegram", "email"]', 'sent', '{"symbol": "BTC", "quantity": 0.5, "price": 45000}'),
  (2, 'price_alert', 'هشدار قیمت SOL', 'قیمت SOL به $140 رسید (+8.5% در 24 ساعت)', 'medium', '["inapp", "telegram"]', 'sent', '{"symbol": "SOL", "price": 140, "change": 8.5}'),
  (3, 'ai_insight', 'بینش آرتمیس', 'تحلیل ETH: سیگنال خرید ضعیف، انتظار تحکیم در محدوده فعلی', 'medium', '["inapp"]', 'sent', '{"symbol": "ETH", "confidence": 62.8, "signal": "hold"}'),
  (4, 'system_alert', 'خوش‌آمدید', 'به سیستم معاملاتی تایتان خوش آمدید! حساب آزمایشی شما آماده است', 'low', '["inapp"]', 'sent', '{"account_type": "demo", "balance": 10000}');

-- ===========================
-- Insert Test Price Alerts
-- ===========================

INSERT OR IGNORE INTO price_alerts (user_id, symbol, condition_type, target_price, is_active) VALUES 
  (1, 'BTC', 'above', 50000.00, TRUE),
  (1, 'BTC', 'below', 40000.00, TRUE),
  (2, 'SOL', 'above', 150.00, TRUE),
  (2, 'ETH', 'below', 2500.00, TRUE),
  (3, 'LINK', 'percent_change', NULL, TRUE),
  (4, 'DOGE', 'above', 0.10, TRUE);

-- ===========================
-- Insert Test Trading Strategies
-- ===========================

INSERT OR IGNORE INTO trading_strategies (user_id, name, description, strategy_type, symbols, parameters, risk_management, is_active, is_paper_trading, total_pnl, win_rate, total_trades) VALUES 
  (1, 'DCA بیت‌کوین', 'خرید تدریجی بیت‌کوین هر هفته', 'dca', '["BTC"]', '{"amount_per_trade": 1000, "frequency": "weekly", "target_allocation": 50}', '{"stop_loss": 15, "max_position_size": 10000}', TRUE, FALSE, 2350.00, 75.5, 12),
  (2, 'گرید SOL/USDT', 'استراتژی گرید ترینگ برای سولانا', 'grid', '["SOL"]', '{"grid_levels": 10, "range_high": 160, "range_low": 120, "trade_amount": 500}', '{"stop_loss": 20, "take_profit": 25}', TRUE, TRUE, 850.00, 68.2, 22),
  (3, 'تحلیل‌گر AI', 'معاملات بر اساس سیگنال‌های آرتمیس', 'ai_powered', '["BTC", "ETH", "SOL"]', '{"min_confidence": 75, "max_trades_per_day": 3, "position_size": 0.1}', '{"stop_loss": 10, "take_profit": 20}', FALSE, TRUE, -120.00, 45.8, 8);

-- ===========================
-- Insert Test System Logs
-- ===========================

INSERT OR IGNORE INTO system_logs (user_id, level, category, message, data) VALUES 
  (1, 'info', 'auth', 'User logged in successfully', '{"ip": "127.0.0.1", "user_agent": "Mozilla/5.0"}'),
  (2, 'info', 'trading', 'Trade executed: BUY SOL', '{"symbol": "SOL", "quantity": 100, "price": 120}'),
  (NULL, 'info', 'ai', 'AI analysis completed for BTC', '{"provider": "openai", "processing_time": 2150}'),
  (3, 'warn', 'notifications', 'Email notification failed', '{"reason": "SMTP timeout", "retry_count": 1}'),
  (NULL, 'info', 'system', 'Database migration completed', '{"version": "0001", "duration_ms": 1250}');

-- ===========================
-- Insert Test Performance Metrics
-- ===========================

INSERT OR IGNORE INTO performance_metrics (user_id, metric_type, value, timeframe, date) VALUES 
  (1, 'portfolio_value', 98500.00, 'daily', date('now')),
  (1, 'total_pnl', -1500.00, 'daily', date('now')),
  (1, 'win_rate', 75.5, 'weekly', date('now', 'weekday 0', '-7 days')),
  (2, 'portfolio_value', 52350.00, 'daily', date('now')),
  (2, 'total_pnl', 2350.00, 'daily', date('now')),
  (2, 'sharpe_ratio', 1.85, 'monthly', date('now', 'start of month')),
  (3, 'portfolio_value', 24800.00, 'daily', date('now')),
  (3, 'max_drawdown', -8.5, 'monthly', date('now', 'start of month'));