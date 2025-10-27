/**
 * Log Masking Utility
 * Masks sensitive data in logs to prevent information leakage
 */

/**
 * Sensitive field patterns to mask
 */
const SENSITIVE_PATTERNS = {
  // API Keys and Tokens
  apiKey: /api[_-]?key/i,
  token: /token|jwt|bearer/i,
  secret: /secret|password|pwd/i,
  authorization: /authorization/i,
  
  // Personal Information
  email: /email|e-mail/i,
  phone: /phone|mobile|telephone/i,
  ssn: /ssn|social[_-]?security/i,
  
  // Financial
  cardNumber: /card[_-]?number|credit[_-]?card|cc[_-]?number/i,
  cvv: /cvv|cvc|security[_-]?code/i,
  bankAccount: /bank[_-]?account|account[_-]?number/i,
  
  // Binance/Exchange specific
  binanceKey: /binance[_-]?(api)?[_-]?key/i,
  exchangeSecret: /exchange[_-]?secret/i
};

/**
 * Mask a string value
 * @param {string} value - Value to mask
 * @param {number} visibleChars - Number of characters to show at start/end
 * @returns {string} - Masked value
 */
function maskString(value, visibleChars = 4) {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }
  
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '*'.repeat(Math.max(8, value.length - (visibleChars * 2)));
  
  return `${start}${masked}${end}`;
}

/**
 * Check if a field name is sensitive
 * @param {string} fieldName - Field name to check
 * @returns {boolean} - True if sensitive
 */
function isSensitiveField(fieldName) {
  if (typeof fieldName !== 'string') return false;
  
  for (const [category, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    if (pattern.test(fieldName)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Mask sensitive fields in an object (recursive)
 * @param {Object} obj - Object to mask
 * @param {Object} options - Masking options
 * @returns {Object} - Masked copy of object
 */
function maskObject(obj, options = {}) {
  const {
    visibleChars = 4,
    maskEmails = true,
    customPatterns = []
  } = options;
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => maskObject(item, options));
  }
  
  // Handle non-objects
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Create a copy to avoid mutating original
  const masked = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if field is sensitive
    if (isSensitiveField(key)) {
      if (typeof value === 'string') {
        masked[key] = maskString(value, visibleChars);
      } else {
        masked[key] = '[REDACTED]';
      }
    }
    // Special handling for email
    else if (maskEmails && key.toLowerCase() === 'email' && typeof value === 'string') {
      masked[key] = maskEmail(value);
    }
    // Recurse into nested objects
    else if (typeof value === 'object' && value !== null) {
      masked[key] = maskObject(value, options);
    }
    // Keep other values as-is
    else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Mask an email address
 * @param {string} email - Email to mask
 * @returns {string} - Masked email
 */
function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    return email;
  }
  
  const [local, domain] = email.split('@');
  
  if (local.length <= 2) {
    return `**@${domain}`;
  }
  
  const maskedLocal = local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask a URL with sensitive query parameters
 * @param {string} url - URL to mask
 * @returns {string} - Masked URL
 */
function maskUrl(url) {
  if (typeof url !== 'string') {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Mask sensitive query parameters
    for (const [key, value] of urlObj.searchParams.entries()) {
      if (isSensitiveField(key)) {
        urlObj.searchParams.set(key, maskString(value, 2));
      }
    }
    
    return urlObj.toString();
  } catch (error) {
    // Not a valid URL, return as-is
    return url;
  }
}

/**
 * Safe console.log wrapper that masks sensitive data
 * @param {string} level - Log level (log, info, warn, error)
 * @param  {...any} args - Arguments to log
 */
function safeLog(level = 'log', ...args) {
  const maskedArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return maskObject(arg);
    }
    return arg;
  });
  
  console[level](...maskedArgs);
}

/**
 * Create safe logger functions
 */
const logger = {
  log: (...args) => safeLog('log', ...args),
  info: (...args) => safeLog('info', ...args),
  warn: (...args) => safeLog('warn', ...args),
  error: (...args) => safeLog('error', ...args),
  debug: (...args) => {
    if (process.env.LOG_LEVEL === 'debug') {
      safeLog('log', '[DEBUG]', ...args);
    }
  }
};

module.exports = {
  maskString,
  maskObject,
  maskEmail,
  maskUrl,
  isSensitiveField,
  logger,
  safeLog
};
