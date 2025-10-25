#!/bin/bash
# Seed sample data for dashboard testing

echo "🌱 Seeding sample data for dashboard..."

PGPASSWORD='Titan@2024!Strong' psql -U titan_user -d titan_trading -h localhost -p 5433 << 'EOF'

-- Clear existing test data
TRUNCATE trades CASCADE;

-- Add sample trades for user 1
INSERT INTO trades (user_id, portfolio_id, symbol, side, quantity, price, total_value, status, executed_at, strategy)
SELECT 
    u.id as user_id,
    p.id as portfolio_id,
    symbols.sym as symbol,
    CASE WHEN (random() * 10)::int % 2 = 0 THEN 'buy' ELSE 'sell' END as side,
    (random() * 0.5 + 0.01)::numeric(20,8) as quantity,
    prices.price::numeric(20,8) as price,
    ((random() * 0.5 + 0.01) * prices.price)::numeric(20,8) as total_value,
    'completed' as status,
    (NOW() - (random() * interval '7 days'))::timestamp as executed_at,
    agents.agent as strategy
FROM users u
CROSS JOIN portfolios p
CROSS JOIN (VALUES 
    ('BTC/USDT', 43000),
    ('ETH/USDT', 2300),
    ('BNB/USDT', 310),
    ('SOL/USDT', 105),
    ('ADA/USDT', 0.42),
    ('XRP/USDT', 0.55),
    ('DOT/USDT', 6.8),
    ('MATIC/USDT', 0.75),
    ('LINK/USDT', 14.5),
    ('UNI/USDT', 5.2)
) AS symbols(sym, price)
CROSS JOIN (VALUES 
    ('Scalping Master'),
    ('Trend Follower'),
    ('Grid Trading Pro'),
    ('Manual'),
    (NULL)
) AS agents(agent)
WHERE p.user_id = u.id
  AND u.id = (SELECT id FROM users LIMIT 1)
LIMIT 50;

-- Add some pending orders
INSERT INTO orders (user_id, portfolio_id, symbol, side, quantity, price, order_type, status)
SELECT 
    u.id,
    p.id,
    'BTC/USDT',
    'buy',
    0.001,
    42000,
    'limit',
    'pending'
FROM users u
JOIN portfolios p ON p.user_id = u.id
LIMIT 3;

-- Update portfolio balances based on trades
UPDATE portfolios p
SET 
    total_balance = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN t.side = 'buy' THEN -t.total_value
                ELSE t.total_value
            END
        ), 0) + 100000
        FROM trades t
        WHERE t.portfolio_id = p.id AND t.status = 'completed'
    ),
    total_pnl = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN t.side = 'sell' THEN t.total_value * 0.02
                ELSE 0
            END
        ), 0)
        FROM trades t
        WHERE t.portfolio_id = p.id AND t.status = 'completed'
    ),
    daily_pnl = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN t.side = 'sell' THEN t.total_value * 0.02
                ELSE 0
            END
        ), 0)
        FROM trades t
        WHERE t.portfolio_id = p.id 
          AND t.status = 'completed'
          AND t.executed_at::date = CURRENT_DATE
    );

-- Update total_pnl_percentage
UPDATE portfolios
SET total_pnl_percentage = CASE 
    WHEN total_balance > 0 THEN (total_pnl / total_balance) * 100 
    ELSE 0 
END;

-- Report
SELECT 
    'Seeded Data Summary' as report,
    (SELECT COUNT(*) FROM trades) as total_trades,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT COUNT(*) FROM portfolios WHERE total_balance > 0) as active_portfolios;

-- Show sample data
SELECT 
    'Sample Trades' as type,
    symbol,
    side,
    quantity,
    price,
    total_value,
    executed_at,
    strategy
FROM trades
ORDER BY executed_at DESC
LIMIT 10;

EOF

echo "✅ Sample data seeded successfully!"
echo ""
echo "📊 Quick Stats:"
PGPASSWORD='Titan@2024!Strong' psql -U titan_user -d titan_trading -h localhost -p 5433 -c "
SELECT 
    (SELECT COUNT(*) FROM trades) as trades,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT SUM(total_balance) FROM portfolios) as total_balance
" -t

echo ""
echo "✅ Ready to test dashboard endpoints!"
