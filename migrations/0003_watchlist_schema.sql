-- Watchlist tables for favorites functionality
-- Migration: 0003_watchlist_schema.sql

-- Watchlist items table
CREATE TABLE IF NOT EXISTS watchlist_items (
  id TEXT PRIMARY KEY DEFAULT ('w' || substr(hex(randomblob(8)), 1, 16)),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'crypto', -- crypto, stock, forex, commodity
  price_alert_high REAL,
  price_alert_low REAL,
  added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint per user
  UNIQUE(user_id, symbol)
);

-- Watchlist alerts history
CREATE TABLE IF NOT EXISTS watchlist_alerts_history (
  id TEXT PRIMARY KEY DEFAULT ('wa' || substr(hex(randomblob(8)), 1, 16)),
  watchlist_item_id TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'high_price', 'low_price', 'volume_spike', 'custom'
  alert_price REAL,
  current_price REAL,
  triggered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_acknowledged BOOLEAN DEFAULT false,
  message TEXT,
  
  -- Foreign key constraint
  FOREIGN KEY (watchlist_item_id) REFERENCES watchlist_items(id) ON DELETE CASCADE
);

-- Market data cache (for performance)
CREATE TABLE IF NOT EXISTS market_data_cache (
  symbol TEXT PRIMARY KEY,
  price REAL NOT NULL,
  change_24h REAL,
  volume_24h REAL,
  high_24h REAL,
  low_24h REAL,
  market_cap REAL,
  last_update DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_items_user_id ON watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol ON watchlist_items(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_type ON watchlist_items(type);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_active ON watchlist_items(is_active);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_history_item_id ON watchlist_alerts_history(watchlist_item_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_history_triggered ON watchlist_alerts_history(triggered_date);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_update ON market_data_cache(last_update);

-- User preferences for watchlist
CREATE TABLE IF NOT EXISTS user_watchlist_preferences (
  id TEXT PRIMARY KEY DEFAULT ('uwp' || substr(hex(randomblob(8)), 1, 16)),
  user_id TEXT NOT NULL UNIQUE,
  auto_refresh_interval INTEGER DEFAULT 30, -- seconds
  show_portfolio_in_watchlist BOOLEAN DEFAULT true,
  default_alert_threshold REAL DEFAULT 5.0, -- percentage
  preferred_currency TEXT DEFAULT 'USDT',
  sort_order TEXT DEFAULT 'symbol_asc', -- symbol_asc, price_desc, change_desc
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Watchlist categories/groups
CREATE TABLE IF NOT EXISTS watchlist_categories (
  id TEXT PRIMARY KEY DEFAULT ('wc' || substr(hex(randomblob(8)), 1, 16)),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint per user
  UNIQUE(user_id, name)
);

-- Assign watchlist items to categories
CREATE TABLE IF NOT EXISTS watchlist_item_categories (
  watchlist_item_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Primary key
  PRIMARY KEY (watchlist_item_id, category_id),
  
  -- Foreign key constraints
  FOREIGN KEY (watchlist_item_id) REFERENCES watchlist_items(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES watchlist_categories(id) ON DELETE CASCADE
);

-- Insert default categories for demo user
INSERT OR IGNORE INTO watchlist_categories (id, user_id, name, color, description) VALUES 
  ('wc_crypto', 'user-123', 'کریپتو', '#F59E0B', 'ارزهای دیجیتال'),
  ('wc_defi', 'user-123', 'DeFi', '#10B981', 'پروتکل‌های مالی غیرمتمرکز'),
  ('wc_nft', 'user-123', 'NFT', '#8B5CF6', 'توکن‌های غیرقابل تعویض'),
  ('wc_gaming', 'user-123', 'Gaming', '#EF4444', 'پروژه‌های بازی');

-- Insert default watchlist preferences for demo user  
INSERT OR IGNORE INTO user_watchlist_preferences (user_id, auto_refresh_interval, show_portfolio_in_watchlist) VALUES 
  ('user-123', 30, true);

-- Insert sample watchlist items for demo user
INSERT OR IGNORE INTO watchlist_items (id, user_id, symbol, name, type, price_alert_high, price_alert_low) VALUES 
  ('w1', 'user-123', 'BTCUSDT', 'Bitcoin', 'crypto', 50000, 40000),
  ('w2', 'user-123', 'ETHUSDT', 'Ethereum', 'crypto', 3000, 2000),
  ('w3', 'user-123', 'SOLUSDT', 'Solana', 'crypto', NULL, NULL),
  ('w4', 'user-123', 'ADAUSDT', 'Cardano', 'crypto', NULL, NULL),
  ('w5', 'user-123', 'DOTUSDT', 'Polkadot', 'crypto', NULL, NULL);

-- Assign sample items to categories
INSERT OR IGNORE INTO watchlist_item_categories (watchlist_item_id, category_id) VALUES 
  ('w1', 'wc_crypto'),
  ('w2', 'wc_crypto'),
  ('w2', 'wc_defi'),
  ('w3', 'wc_crypto'),
  ('w3', 'wc_defi'),
  ('w4', 'wc_crypto'),
  ('w5', 'wc_crypto');