/**
 * TITAN Trading System - Logger Wrapper (CommonJS)
 * For use in server.js (JavaScript/CommonJS environment)
 */

const pino = require('pino');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFilePath = path.join(logDir, 'titan.log');

/**
 * Pino Logger Configuration (CommonJS)
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    
    base: {
      service: 'titan-backend',
      env: process.env.NODE_ENV || 'development',
    },
    
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // Pretty printing for development
    transport: process.env.NODE_ENV === 'production' 
      ? undefined 
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
    
    // Redact sensitive fields
    redact: {
      paths: [
        'password',
        'authorization',
        'JWT_SECRET',
        'DATABASE_URL',
        '*.password',
        '*.secret',
        '*.token',
      ],
      remove: true,
    },
  },
  
  // Output destination
  process.env.NODE_ENV === 'production'
    ? pino.destination({
        dest: logFilePath,
        sync: false,
        mkdir: true,
      })
    : pino.destination(1) // stdout
);

// Replace console methods with logger
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.info(args[0]);
  } else {
    logger.info(args.join(' '));
  }
  
  // Also call original in development
  if (process.env.NODE_ENV !== 'production') {
    originalConsoleLog.apply(console, args);
  }
};

console.error = function(...args) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.error(args[0]);
  } else {
    logger.error(args.join(' '));
  }
  
  if (process.env.NODE_ENV !== 'production') {
    originalConsoleError.apply(console, args);
  }
};

console.warn = function(...args) {
  if (args.length === 1 && typeof args[0] === 'object') {
    logger.warn(args[0]);
  } else {
    logger.warn(args.join(' '));
  }
  
  if (process.env.NODE_ENV !== 'production') {
    originalConsoleWarn.apply(console, args);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.flush(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.flush(() => {
    process.exit(0);
  });
});

module.exports = logger;
