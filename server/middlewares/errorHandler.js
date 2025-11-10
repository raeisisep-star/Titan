// Error Handler Middleware
// Centralized error handling for all routes

function errorHandler(err, req, res, next) {
  // Log error details
  console.error('❌ Error Handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  
  // Handle specific error types
  if (err.message.includes('MEXC API Error')) {
    statusCode = 502; // Bad Gateway - external service error
  } else if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403; // Forbidden
  } else if (err.name === 'NotFoundError') {
    statusCode = 404; // Not Found
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: getErrorMessage(err, statusCode),
    timestamp: Date.now()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || {};
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(err, statusCode) {
  // Return original message for client errors (4xx)
  if (statusCode >= 400 && statusCode < 500) {
    return err.message || 'Bad Request';
  }

  // User-friendly messages for server errors (5xx)
  if (err.message.includes('MEXC API Error')) {
    return 'خطا در ارتباط با سرویس بازار. لطفاً دوباره تلاش کنید.';
  }

  if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
    return 'خطا در اتصال به سرویس خارجی. لطفاً بعداً تلاش کنید.';
  }

  // Generic server error message
  return 'خطای سرور. لطفاً بعداً تلاش کنید.';
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `مسیر ${req.path} یافت نشد`,
    path: req.path,
    method: req.method,
    timestamp: Date.now()
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
