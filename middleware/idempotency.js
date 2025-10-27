/**
 * Idempotency Middleware
 * Prevents duplicate processing of requests using idempotency keys
 */

const crypto = require('crypto');

// Debug logging control
const DEBUG_IDEMPOTENCY = process.env.LOG_LEVEL === 'debug' || process.env.DEBUG_IDEMPOTENCY === 'true';

/**
 * Generate SHA-256 hash of request body
 * @param {Object} body - Request body
 * @returns {string} - Hex hash
 */
function hashRequestBody(body) {
  const bodyString = JSON.stringify(body || {});
  return crypto.createHash('sha256').update(bodyString).digest('hex');
}

/**
 * Idempotency middleware factory
 * @param {Object} pool - PostgreSQL connection pool
 * @param {Object} options - Configuration options
 * @returns {Function} - Hono middleware
 */
function idempotencyMiddleware(pool, options = {}) {
  const {
    headerName = 'Idempotency-Key',
    ttlHours = 24,
    requiredMethods = ['POST', 'PUT', 'PATCH']
  } = options;

  return async (c, next) => {
    const method = c.req.method;
    
    // Only apply to specified methods
    if (!requiredMethods.includes(method)) {
      return await next();
    }

    // Get idempotency key from header
    const idempotencyKey = c.req.header(headerName);
    
    // If no key provided, proceed normally (idempotency is optional)
    if (!idempotencyKey) {
      if (DEBUG_IDEMPOTENCY) {
        console.log(`[Idempotency] No key provided for ${method} ${c.req.path}`);
      }
      return await next();
    }

    // Validate key format (should be reasonable length)
    if (idempotencyKey.length < 8 || idempotencyKey.length > 255) {
      return c.json({
        success: false,
        error: 'Invalid idempotency key format (must be 8-255 characters)'
      }, 400);
    }

    try {
      const userId = c.get('userId');
      if (!userId) {
        return c.json({
          success: false,
          error: 'User authentication required for idempotent requests'
        }, 401);
      }

      // Get request body and hash it
      const body = await c.req.json().catch(() => ({}));
      const requestHash = hashRequestBody(body);
      
      // Check if we've seen this idempotency key before
      const existingRequest = await pool.query(
        `SELECT id, request_hash, response_status, response_body, created_at, expires_at
         FROM idempotency_requests
         WHERE idempotency_key = $1 AND user_id = $2 AND expires_at > NOW()`,
        [idempotencyKey, userId]
      );

      if (existingRequest.rows.length > 0) {
        const existing = existingRequest.rows[0];
        
        // Verify request body matches (prevent key reuse with different data)
        if (existing.request_hash !== requestHash) {
          if (DEBUG_IDEMPOTENCY) {
            console.log(`[Idempotency] Hash mismatch for key ${idempotencyKey}`);
          }
          return c.json({
            success: false,
            error: 'Idempotency key already used with different request data'
          }, 409);
        }

        // Return cached response
        if (DEBUG_IDEMPOTENCY) {
          console.log(`[Idempotency] Returning cached response for key ${idempotencyKey}`);
        }
        
        return c.json(existing.response_body, existing.response_status);
      }

      // Store request context for later
      c.set('idempotencyKey', idempotencyKey);
      c.set('requestHash', requestHash);
      c.set('requestBody', body); // Store parsed body for endpoint use

      // Process request normally
      await next();

      // After processing, cache the response
      const responseStatus = c.res.status || 200;
      const responseBody = await c.res.clone().json().catch(() => ({ success: false }));

      // Only cache successful responses (2xx status codes)
      if (responseStatus >= 200 && responseStatus < 300) {
        try {
          await pool.query(
            `INSERT INTO idempotency_requests 
             (idempotency_key, user_id, endpoint, method, request_hash, response_status, response_body, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '${ttlHours} hours')
             ON CONFLICT (idempotency_key) DO NOTHING`,
            [
              idempotencyKey,
              userId,
              c.req.path,
              method,
              requestHash,
              responseStatus,
              responseBody
            ]
          );

          if (DEBUG_IDEMPOTENCY) {
            console.log(`[Idempotency] Cached response for key ${idempotencyKey}`);
          }
        } catch (error) {
          // Don't fail the request if caching fails, just log
          console.error(`[Idempotency] Failed to cache response:`, error.message);
        }
      }

    } catch (error) {
      console.error(`[Idempotency] Middleware error:`, error);
      // Don't block request on idempotency errors
      return await next();
    }
  };
}

/**
 * Cleanup expired idempotency records
 * Should be called periodically (e.g., daily cron job)
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Promise<number>} - Number of deleted records
 */
async function cleanupExpiredRecords(pool) {
  try {
    const result = await pool.query('SELECT cleanup_expired_idempotency_requests()');
    const deletedCount = result.rows[0].cleanup_expired_idempotency_requests;
    console.log(`[Idempotency] Cleaned up ${deletedCount} expired records`);
    return deletedCount;
  } catch (error) {
    console.error(`[Idempotency] Cleanup failed:`, error.message);
    throw error;
  }
}

module.exports = {
  idempotencyMiddleware,
  cleanupExpiredRecords,
  hashRequestBody
};
