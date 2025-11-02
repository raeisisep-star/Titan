/**
 * TITAN Trading System - Structured Logger with Pino
 * 
 * Features:
 * - JSON structured logging for production
 * - Pretty console output for development
 * - Automatic log rotation via external logrotate
 * - Performance optimized (async logging)
 * - Multiple log levels (trace, debug, info, warn, error, fatal)
 */

import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFilePath = path.join(logDir, 'titan.log');

/**
 * Pino Logger Configuration
 */
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    
    // Base context (added to all logs)
    base: {
      service: 'titan-backend',
      env: process.env.NODE_ENV || 'development',
      hostname: process.env.HOSTNAME || 'unknown',
    },
    
    // Timestamp format
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // Pretty printing for development (disabled in production for performance)
    transport: process.env.NODE_ENV === 'production' 
      ? undefined 
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
    
    // Serializers for common objects
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    
    // Redact sensitive fields (don't log secrets)
    redact: {
      paths: [
        'password',
        'authorization',
        'JWT_SECRET',
        'DATABASE_URL',
        'REDIS_URL',
        '*.password',
        '*.secret',
        '*.token',
        'req.headers.authorization',
        'req.headers.cookie',
      ],
      remove: true,
    },
  },
  
  // Output destination (file in production, stdout in development)
  process.env.NODE_ENV === 'production'
    ? pino.destination({
        dest: logFilePath,
        sync: false, // Async for better performance
        mkdir: true,
      })
    : pino.destination(1) // stdout
);

/**
 * Create child logger with additional context
 * @param context Additional context to add to all logs
 */
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Log request/response for HTTP endpoints
 */
export function logHttpRequest(req: any, res: any, duration: number) {
  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
  
  logger[level]({
    type: 'http',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration,
    userAgent: req.headers?.['user-agent'],
    ip: req.headers?.['x-real-ip'] || req.headers?.['x-forwarded-for'] || req.ip,
  }, `${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
}

/**
 * Log database queries (for debugging)
 */
export function logDatabaseQuery(query: string, duration: number, params?: any[]) {
  logger.debug({
    type: 'database',
    query: query.substring(0, 200), // Truncate long queries
    duration,
    paramCount: params?.length || 0,
  }, `DB Query: ${duration}ms`);
}

/**
 * Log business events
 */
export function logBusinessEvent(event: string, data?: Record<string, any>) {
  logger.info({
    type: 'business_event',
    event,
    ...data,
  }, `Business Event: ${event}`);
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, data?: Record<string, any>) {
  logger.warn({
    type: 'security',
    event,
    ...data,
  }, `Security Event: ${event}`);
}

/**
 * Log performance metrics
 */
export function logPerformanceMetric(metric: string, value: number, unit: string = 'ms') {
  logger.info({
    type: 'performance',
    metric,
    value,
    unit,
  }, `Performance: ${metric} = ${value}${unit}`);
}

/**
 * Graceful shutdown - flush logs before exit
 */
export async function flushLogs(): Promise<void> {
  return new Promise((resolve) => {
    logger.flush(() => {
      resolve();
    });
  });
}

// Handle process termination
process.on('SIGINT', async () => {
  await flushLogs();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await flushLogs();
  process.exit(0);
});

// Export default logger
export default logger;
