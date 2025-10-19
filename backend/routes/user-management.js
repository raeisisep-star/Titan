/**
 * User Management API Routes
 * مسیرهای مدیریت کاربران - CRUD, Roles, Permissions, Sessions
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// ============================================================================
// USER CRUD OPERATIONS
// ============================================================================

/**
 * GET /api/users - لیست تمام کاربران با فیلتر و pagination
 */
router.get('/users', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            status = '', 
            role = '',
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Search filter
        if (search) {
            whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Status filter
        if (status === 'active') {
            whereClause += ` AND is_active = true AND is_suspended = false`;
        } else if (status === 'inactive') {
            whereClause += ` AND is_active = false`;
        } else if (status === 'suspended') {
            whereClause += ` AND is_suspended = true`;
        }

        // Role filter
        if (role) {
            whereClause += ` AND role = $${paramIndex}`;
            params.push(role);
            paramIndex++;
        }

        // Count total users
        const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Fetch users
        const query = `
            SELECT 
                id, username, email, first_name, last_name, role, 
                is_active, is_verified, is_suspended, suspended_reason,
                last_login_at, last_login_ip, created_at, updated_at,
                failed_login_attempts, account_locked_until
            FROM users 
            ${whereClause}
            ORDER BY ${sort} ${order}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: {
                users: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/users/stats - آمار کاربران
 */
router.get('/users/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM v_user_statistics');
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/users/:id - جزئیات یک کاربر
 */
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                id, username, email, first_name, last_name, phone, country, 
                timezone, language, role, is_active, is_verified, is_suspended, 
                suspended_reason, suspended_until, last_login_at, last_login_ip, 
                failed_login_attempts, account_locked_until, created_at, updated_at,
                settings
            FROM users 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'کاربر یافت نشد' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/users - ایجاد کاربر جدید
 */
router.post('/users', async (req, res) => {
    try {
        const { 
            username, email, password, first_name, last_name, 
            phone, country, role, is_active, is_verified 
        } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'نام کاربری، ایمیل و رمز عبور الزامی است' 
            });
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'نام کاربری یا ایمیل قبلاً ثبت شده است' 
            });
        }

        // Hash password (in production, use bcrypt)
        const password_hash = password; // TODO: Use bcrypt

        // Insert user
        const result = await pool.query(`
            INSERT INTO users (
                username, email, password_hash, first_name, last_name, 
                phone, country, role, is_active, is_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, username, email, first_name, last_name, role, is_active, created_at
        `, [
            username, email, password_hash, first_name, last_name, 
            phone, country, role || 'user', is_active !== false, is_verified || false
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'کاربر با موفقیت ایجاد شد'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * PUT /api/users/:id - ویرایش کاربر
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            username, email, first_name, last_name, phone, country, 
            timezone, language, role, is_active, is_verified, settings 
        } = req.body;

        const result = await pool.query(`
            UPDATE users SET
                username = COALESCE($1, username),
                email = COALESCE($2, email),
                first_name = COALESCE($3, first_name),
                last_name = COALESCE($4, last_name),
                phone = COALESCE($5, phone),
                country = COALESCE($6, country),
                timezone = COALESCE($7, timezone),
                language = COALESCE($8, language),
                role = COALESCE($9, role),
                is_active = COALESCE($10, is_active),
                is_verified = COALESCE($11, is_verified),
                settings = COALESCE($12, settings),
                updated_at = NOW()
            WHERE id = $13
            RETURNING id, username, email, first_name, last_name, role, is_active, updated_at
        `, [
            username, email, first_name, last_name, phone, country, 
            timezone, language, role, is_active, is_verified, settings, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'کاربر یافت نشد' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'کاربر با موفقیت بروزرسانی شد'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * DELETE /api/users/:id - حذف کاربر
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'کاربر یافت نشد' 
            });
        }

        res.json({
            success: true,
            message: 'کاربر با موفقیت حذف شد'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/users/:id/suspend - تعلیق کاربر
 */
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, duration_hours = 24 } = req.body;

        const suspended_until = new Date(Date.now() + duration_hours * 60 * 60 * 1000);

        const result = await pool.query(`
            UPDATE users SET
                is_suspended = true,
                suspended_reason = $1,
                suspended_until = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, username, is_suspended, suspended_until
        `, [reason, suspended_until, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'کاربر یافت نشد' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'کاربر با موفقیت تعلیق شد'
        });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/users/:id/unsuspend - رفع تعلیق کاربر
 */
router.post('/users/:id/unsuspend', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE users SET
                is_suspended = false,
                suspended_reason = NULL,
                suspended_until = NULL,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, username, is_suspended
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'کاربر یافت نشد' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'تعلیق کاربر با موفقیت برداشته شد'
        });
    } catch (error) {
        console.error('Error unsuspending user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================================================
// SESSIONS MANAGEMENT
// ============================================================================

/**
 * GET /api/users/sessions/active - لیست جلسات فعال
 */
router.get('/users/sessions/active', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM v_active_sessions ORDER BY last_activity DESC');

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * DELETE /api/users/sessions/:id - حذف جلسه (logout)
 */
router.delete('/users/sessions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE user_sessions SET is_active = false WHERE id = $1 RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'جلسه یافت نشد' 
            });
        }

        res.json({
            success: true,
            message: 'جلسه با موفقیت حذف شد'
        });
    } catch (error) {
        console.error('Error terminating session:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

/**
 * GET /api/users/:id/activities - فعالیت‌های یک کاربر
 */
router.get('/users/:id/activities', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const result = await pool.query(`
            SELECT * FROM user_activity_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `, [id, limit]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/users/activities/suspicious - فعالیت‌های مشکوک
 */
router.get('/users/activities/suspicious', async (req, res) => {
    try {
        const { resolved = 'false' } = req.query;

        const result = await pool.query(`
            SELECT 
                sa.*,
                u.username,
                u.email
            FROM suspicious_activities sa
            LEFT JOIN users u ON sa.user_id = u.id
            WHERE sa.is_resolved = $1
            ORDER BY sa.created_at DESC
            LIMIT 50
        `, [resolved === 'true']);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching suspicious activities:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/users/activities/suspicious/:id/resolve - حل فعالیت مشکوک
 */
router.post('/users/activities/suspicious/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const { resolved_by } = req.body;

        const result = await pool.query(`
            UPDATE suspicious_activities SET
                is_resolved = true,
                resolved_by = $1,
                resolved_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [resolved_by, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'فعالیت مشکوک یافت نشد' 
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'فعالیت مشکوک حل شد'
        });
    } catch (error) {
        console.error('Error resolving suspicious activity:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
