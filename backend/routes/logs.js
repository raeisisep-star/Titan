/**
 * Logs API Routes - Phase 3.3
 * مسیرهای API برای مشاهده و مانیتورینگ لاگ‌های سیستم
 * 
 * Endpoints:
 * - GET /api/logs/recent - آخرین لاگ‌های سیستم با فیلتر و pagination
 * - GET /api/logs/errors - لاگ‌های خطا از error-alerts.log
 * - GET /api/logs/stats - آمار کلی لاگ‌ها
 * - GET /api/logs/search - جست‌وجو در لاگ‌ها
 * 
 * Security: Admin-only access via JWT
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Read last N lines from a file efficiently
 * @param {string} filePath - Path to log file
 * @param {number} lines - Number of lines to read
 * @returns {Array<string>} Array of log lines
 */
function readLastLines(filePath, lines = 100) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const allLines = fileContent.trim().split('\n').filter(line => line.trim());
    
    // Return last N lines
    return allLines.slice(-lines);
  } catch (error) {
    console.error('Error reading log file:', error);
    return [];
  }
}

/**
 * Parse JSON log line safely
 * @param {string} line - Log line in JSON format
 * @returns {Object|null} Parsed log object or null
 */
function parseLogLine(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    // If not JSON, return raw line
    return {
      level: 'info',
      time: new Date().toISOString(),
      msg: line,
      raw: true
    };
  }
}

/**
 * Filter logs by level
 * @param {Array} logs - Array of log objects
 * @param {string} level - Log level filter (error, warn, info, debug, trace)
 * @returns {Array} Filtered logs
 */
function filterByLevel(logs, level) {
  if (!level || level === 'all') return logs;
  
  const levelMap = {
    'fatal': 60,
    'error': 50,
    'warn': 40,
    'info': 30,
    'debug': 20,
    'trace': 10
  };
  
  const targetLevel = levelMap[level.toLowerCase()];
  if (!targetLevel) return logs;
  
  return logs.filter(log => {
    const logLevel = typeof log.level === 'number' 
      ? log.level 
      : levelMap[log.level?.toLowerCase()] || 30;
    return logLevel >= targetLevel;
  });
}

/**
 * Search logs by text
 * @param {Array} logs - Array of log objects
 * @param {string} query - Search query
 * @returns {Array} Matching logs
 */
function searchLogs(logs, query) {
  if (!query) return logs;
  
  const lowerQuery = query.toLowerCase();
  return logs.filter(log => {
    const msgText = log.msg?.toLowerCase() || '';
    const errText = log.err?.message?.toLowerCase() || '';
    const serviceText = log.service?.toLowerCase() || '';
    
    return msgText.includes(lowerQuery) || 
           errText.includes(lowerQuery) || 
           serviceText.includes(lowerQuery);
  });
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/logs/recent
 * دریافت آخرین لاگ‌های سیستم
 * 
 * Query Params:
 * - limit: تعداد لاگ‌ها (default: 100, max: 1000)
 * - level: فیلتر سطح (error, warn, info, debug, trace, all)
 * - search: جست‌وجو در پیام‌ها
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     logs: [...],
 *     count: 100,
 *     filters: {...}
 *   }
 * }
 */
router.get('/recent', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const level = req.query.level || 'all';
    const search = req.query.search || '';
    
    const logFilePath = path.join(process.cwd(), 'logs/titan.log');
    
    // Read last N lines
    const rawLines = readLastLines(logFilePath, limit * 2); // Read extra for filtering
    
    // Parse JSON lines
    let logs = rawLines.map(parseLogLine).filter(log => log !== null);
    
    // Apply filters
    logs = filterByLevel(logs, level);
    logs = searchLogs(logs, search);
    
    // Limit results
    logs = logs.slice(-limit);
    
    // Sort by time (newest first)
    logs.reverse();
    
    return res.json({
      success: true,
      data: {
        logs,
        count: logs.length,
        filters: {
          limit,
          level,
          search: search || null
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
});

/**
 * GET /api/logs/errors
 * دریافت لاگ‌های خطا از error-alerts.log
 * 
 * Query Params:
 * - limit: تعداد خطاها (default: 50, max: 500)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     errors: [...],
 *     count: 10
 *   }
 * }
 */
router.get('/errors', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    
    const errorLogPath = path.join(process.cwd(), 'logs/error-alerts.log');
    
    // Read error alerts
    const rawLines = readLastLines(errorLogPath, limit);
    
    // Parse each line (simple text format from error-watch.sh)
    const errors = rawLines.map((line, index) => {
      // Extract timestamp if present
      const timestampMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/);
      const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();
      
      return {
        id: index,
        timestamp,
        message: line,
        severity: 'error'
      };
    });
    
    // Newest first
    errors.reverse();
    
    return res.json({
      success: true,
      data: {
        errors,
        count: errors.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch error logs',
      message: error.message
    });
  }
});

/**
 * GET /api/logs/stats
 * دریافت آمار کلی لاگ‌ها
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     total: 1000,
 *     byLevel: { error: 10, warn: 50, info: 940 },
 *     fileSize: "2.5 MB",
 *     lastUpdate: "2025-11-02T12:00:00Z"
 *   }
 * }
 */
router.get('/stats', (req, res) => {
  try {
    const logFilePath = path.join(process.cwd(), 'logs/titan.log');
    const errorLogPath = path.join(process.cwd(), 'logs/error-alerts.log');
    
    // Get file stats
    const logStats = fs.existsSync(logFilePath) ? fs.statSync(logFilePath) : null;
    const errorStats = fs.existsSync(errorLogPath) ? fs.statSync(errorLogPath) : null;
    
    // Read recent logs to count by level
    const rawLines = readLastLines(logFilePath, 500);
    const logs = rawLines.map(parseLogLine);
    
    // Count by level
    const byLevel = {
      fatal: 0,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
      trace: 0
    };
    
    logs.forEach(log => {
      const levelNum = typeof log.level === 'number' ? log.level : 30;
      if (levelNum >= 60) byLevel.fatal++;
      else if (levelNum >= 50) byLevel.error++;
      else if (levelNum >= 40) byLevel.warn++;
      else if (levelNum >= 30) byLevel.info++;
      else if (levelNum >= 20) byLevel.debug++;
      else byLevel.trace++;
    });
    
    // Format file sizes
    const formatBytes = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    
    return res.json({
      success: true,
      data: {
        total: logs.length,
        byLevel,
        files: {
          main: {
            path: 'logs/titan.log',
            size: logStats ? formatBytes(logStats.size) : '0 B',
            lastModified: logStats ? logStats.mtime : null
          },
          errors: {
            path: 'logs/error-alerts.log',
            size: errorStats ? formatBytes(errorStats.size) : '0 B',
            lastModified: errorStats ? errorStats.mtime : null
          }
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch log stats',
      message: error.message
    });
  }
});

/**
 * GET /api/logs/search
 * جست‌وجوی پیشرفته در لاگ‌ها
 * 
 * Query Params:
 * - q: کلیدواژه جست‌وجو (required)
 * - level: فیلتر سطح
 * - limit: تعداد نتایج (default: 100)
 * - from: زمان شروع (ISO 8601)
 * - to: زمان پایان (ISO 8601)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     results: [...],
 *     count: 10,
 *     query: {...}
 *   }
 * }
 */
router.get('/search', (req, res) => {
  try {
    const query = req.query.q || '';
    const level = req.query.level || 'all';
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }
    
    const logFilePath = path.join(process.cwd(), 'logs/titan.log');
    
    // Read more lines for search
    const rawLines = readLastLines(logFilePath, 2000);
    let logs = rawLines.map(parseLogLine);
    
    // Filter by level
    logs = filterByLevel(logs, level);
    
    // Filter by time range
    if (from || to) {
      logs = logs.filter(log => {
        const logTime = new Date(log.time);
        if (from && logTime < from) return false;
        if (to && logTime > to) return false;
        return true;
      });
    }
    
    // Search
    logs = searchLogs(logs, query);
    
    // Limit and sort
    logs = logs.slice(-limit).reverse();
    
    return res.json({
      success: true,
      data: {
        results: logs,
        count: logs.length,
        query: {
          text: query,
          level,
          limit,
          from: from ? from.toISOString() : null,
          to: to ? to.toISOString() : null
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error searching logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

module.exports = router;
