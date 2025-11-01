/**
 * Observability Middleware for Hono
 * 
 * Implements:
 * - Request ID tracking (correlation IDs)
 * - Structured JSON logging
 * - Request/response logging
 * - Performance metrics
 */

import { Context, Next } from 'hono';

/**
 * Generate a unique request ID
 * Uses nanoid for short, URL-safe IDs
 */
function generateRequestId(): string {
  // Simple nanoid-like implementation (21 chars, URL-safe)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 21; i++) {
    id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return id;
}

/**
 * Request ID Middleware
 * 
 * Adds a unique ID to each request for tracing.
 * Uses existing X-Request-ID header if present (from load balancers).
 */
export async function withRequestId(c: Context, next: Next) {
  const id = c.req.header('x-request-id') || generateRequestId();
  c.set('reqId', id);
  
  // Echo request ID in response headers for client-side debugging
  c.header('X-Request-ID', id);
  
  await next();
}

/**
 * Structured logging interface
 */
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  reqId?: string;
  method?: string;
  path?: string;
  status?: number;
  duration?: number;
  message?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  [key: string]: any;
}

/**
 * Logger utility with structured JSON output
 */
export class Logger {
  private context: Record<string, any> = {};

  constructor(context?: Record<string, any>) {
    this.context = context || {};
  }

  private log(level: LogEntry['level'], message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...meta,
    };

    // Output as JSON (parseable by log aggregators)
    console.log(JSON.stringify(entry));
  }

  debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, any>) {
    const errorMeta = error
      ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : {};
    
    this.log('error', message, { ...errorMeta, ...meta });
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

/**
 * Request Logging Middleware
 * 
 * Logs all requests with timing information
 */
export async function requestLogger(c: Context, next: Next) {
  const reqId = c.get('reqId') as string;
  const logger = new Logger({ reqId });
  
  // Store logger in context for use in handlers
  c.set('logger', logger);
  
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  logger.info('Request started', { method, path });
  
  try {
    await next();
    
    const duration = Date.now() - start;
    const status = c.res.status;
    
    // Log level based on status code
    if (status >= 500) {
      logger.error('Request completed with server error', undefined, {
        method,
        path,
        status,
        duration,
      });
    } else if (status >= 400) {
      logger.warn('Request completed with client error', {
        method,
        path,
        status,
        duration,
      });
    } else {
      logger.info('Request completed', {
        method,
        path,
        status,
        duration,
      });
    }
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Request failed with exception', error as Error, {
      method,
      path,
      duration,
    });
    throw error; // Re-throw to let error handler deal with it
  }
}

/**
 * Error Logging Middleware
 * 
 * Catches and logs unhandled errors
 */
export async function errorLogger(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    const logger = c.get('logger') as Logger || new Logger();
    const reqId = c.get('reqId') as string;
    
    logger.error('Unhandled error in request', error as Error, {
      reqId,
      method: c.req.method,
      path: c.req.path,
    });
    
    // Return generic error to client (don't leak internals)
    return c.json(
      {
        error: 'Internal Server Error',
        reqId,
      },
      500
    );
  }
}

/**
 * Get logger from context (for use in route handlers)
 */
export function getLogger(c: Context): Logger {
  return c.get('logger') as Logger || new Logger();
}
