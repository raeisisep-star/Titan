# Database Migrations

## Applied Migrations

| Migration | File | Status | Applied Date | Description |
|-----------|------|--------|--------------|-------------|
| 0006 | `0006_orders_and_activities.sql` | ✅ Applied | 2025-10-27 | Creates orders and activities tables for Sprint 3 |
| 0007 | `0007_alter_orders_for_manual_trading.sql` | ✅ Applied | 2025-10-27 | Adds compatibility layer for existing orders table |

## Migration Details

### 0006_orders_and_activities.sql
**Purpose:** Core Sprint 3 schema for manual trading

**Tables Created:**
- `orders` - Order lifecycle tracking (pending → filled/cancelled/rejected)
- `activities` - Audit trail for all user actions

**Indexes:**
- `idx_orders_user_id` - User order queries
- `idx_orders_status` - Status filtering
- `idx_orders_symbol` - Symbol-based queries
- `idx_orders_created_at` - Chronological ordering
- `idx_activities_user_id` - User activity queries
- `idx_activities_created_at` - Activity timeline

**Helper Functions:**
- `get_user_open_orders(user_uuid)` - Returns user's open orders
- `get_user_activities(user_uuid, limit_val)` - Returns recent activities

**Triggers:**
- `update_orders_updated_at` - Auto-update timestamp on changes

---

### 0007_alter_orders_for_manual_trading.sql
**Purpose:** Backward compatibility for existing orders table

**Changes:**
- Adds `user_id` column if not exists
- Adds `symbol` column if not exists
- Renames `quantity` → `qty`
- Renames `filled_quantity` → `filled_qty`
- Adds `metadata` JSONB column
- Adds `error_message` TEXT column
- Adds `cancelled_at` TIMESTAMP column
- Creates/updates foreign key constraints

---

## How to Apply Migrations

### Manual Application
```bash
# Source database credentials
source /home/ubuntu/Titan/.env

# Apply migration
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/0006_orders_and_activities.sql
```

### Verify Applied
```bash
# Check if tables exist
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt orders activities"

# Check columns
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d orders"
```

---

## Rollback Procedures

### Rollback 0007
```sql
-- Reverse column renames
ALTER TABLE orders RENAME COLUMN qty TO quantity;
ALTER TABLE orders RENAME COLUMN filled_qty TO filled_quantity;

-- Drop added columns
ALTER TABLE orders DROP COLUMN IF EXISTS metadata;
ALTER TABLE orders DROP COLUMN IF EXISTS error_message;
ALTER TABLE orders DROP COLUMN IF EXISTS cancelled_at;
```

### Rollback 0006
```sql
-- Drop tables (WARNING: Data loss)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_open_orders(UUID);
DROP FUNCTION IF EXISTS get_user_activities(UUID, INTEGER);
```

---

## Future Migrations

When adding new migrations:

1. **Naming:** Use format `XXXX_descriptive_name.sql` (e.g., `0008_add_trades_table.sql`)
2. **Documentation:** Update this README with migration details
3. **Testing:** Test on isolated environment before production
4. **Backup:** Always backup before applying (`/home/ubuntu/Titan/scripts/backup-database.sh`)
5. **Rollback:** Include rollback SQL in migration comments

---

**Last Updated:** 2025-10-27  
**Maintained By:** DevOps Team
