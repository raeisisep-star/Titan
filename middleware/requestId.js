/**
 * Request ID Middleware
 * Assigns a unique ID to each request for tracing and debugging
 */

const crypto = require('crypto');

/**
 * Generate a unique request ID
 * @returns {string} - Unique request ID (format: req_timestamp_random)
 */
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(6).toString('hex');
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Request ID middleware
 * Adds a unique request ID to each request
 * @param {Object} options - Configuration options
 * @returns {Function} - Hono middleware
 */
function requestIdMiddleware(options = {}) {
  const {
    headerName = 'X-Request-ID',
    useClientId = true // Accept client-provided request ID if present
  } = options;

  return async (c, next) => {
    // Check if client provided a request ID
    let requestId = null;
    
    if (useClientId) {
      requestId = c.req.header(headerName);
      
      // Validate client-provided ID (basic check)
      if (requestId && (requestId.length < 8 || requestId.length > 64)) {
        requestId = null; // Reject invalid format
      }
    }
    
    // Generate new ID if not provided or invalid
    if (!requestId) {
      requestId = generateRequestId();
    }
    
    // Store in context for use in handlers
    c.set('requestId', requestId);
    
    // Add to response headers
    c.res.headers.set(headerName, requestId);
    
    await next();
  };
}

module.exports = {
  requestIdMiddleware,
  generateRequestId
};
