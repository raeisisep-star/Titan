/**
 * TITAN Trading System - Crypto Utilities
 * Web Crypto API helpers for exchange authentication
 */

export class CryptoHelper {
  /**
   * Generate HMAC-SHA256 signature using Web Crypto API
   * Compatible with Cloudflare Workers runtime
   */
  public static async hmacSha256(message: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)

    // Import the secret key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Generate signature
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    
    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Generate HMAC-SHA256 signature with base64 encoded secret
   * Used by Coinbase Pro API
   */
  public static async hmacSha256WithBase64Secret(message: string, base64Secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const messageData = encoder.encode(message)
    
    // Decode base64 secret
    const secretData = Uint8Array.from(atob(base64Secret), c => c.charCodeAt(0))

    // Import the secret key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Generate signature
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    
    // Return as base64 string for Coinbase
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
  }

  /**
   * Generate SHA256 hash
   * Used by some exchanges for payload hashing
   */
  public static async sha256(message: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Generate secure random string for nonce generation
   */
  public static generateNonce(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  /**
   * Current timestamp in milliseconds
   */
  public static timestamp(): number {
    return Date.now()
  }

  /**
   * Current timestamp in seconds (Unix timestamp)
   */
  public static unixTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * Encode parameters as URL query string
   * Properly handles arrays and objects for exchange APIs
   */
  public static encodeParams(params: Record<string, any>): string {
    const encoded: string[] = []
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => encoded.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`))
        } else {
          encoded.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
        }
      }
    }
    
    return encoded.join('&')
  }

  /**
   * Validate API key format
   */
  public static validateApiKey(apiKey: string, exchange: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false
    }

    switch (exchange.toLowerCase()) {
      case 'binance':
        return apiKey.length >= 64 && /^[A-Za-z0-9]{64,}$/.test(apiKey)
      case 'coinbase':
        return apiKey.length >= 32 && /^[A-Za-z0-9]+$/.test(apiKey)
      case 'kucoin':
        return apiKey.length >= 24 && /^[A-Za-z0-9]+$/.test(apiKey)
      default:
        return apiKey.length >= 16
    }
  }

  /**
   * Validate API secret format
   */
  public static validateApiSecret(apiSecret: string, exchange: string): boolean {
    if (!apiSecret || typeof apiSecret !== 'string') {
      return false
    }

    switch (exchange.toLowerCase()) {
      case 'binance':
        return apiSecret.length >= 64 && /^[A-Za-z0-9+/=]+$/.test(apiSecret)
      case 'coinbase':
        return apiSecret.length >= 64 && /^[A-Za-z0-9+/=]+$/.test(apiSecret)
      case 'kucoin':
        return apiSecret.length >= 36 && /^[A-Za-z0-9\-]+$/.test(apiSecret)
      default:
        return apiSecret.length >= 16
    }
  }

  /**
   * Create request headers with proper Content-Type
   */
  public static createHeaders(additionalHeaders: Record<string, string> = {}): Headers {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('User-Agent', 'TITAN-Trading-System/1.0')
    
    for (const [key, value] of Object.entries(additionalHeaders)) {
      headers.set(key, value)
    }
    
    return headers
  }

  /**
   * Safe JSON parsing with error handling
   */
  public static safeJsonParse<T = any>(text: string, fallback: T | null = null): T | null {
    try {
      return JSON.parse(text) as T
    } catch (error) {
      console.warn('JSON parse error:', error)
      return fallback
    }
  }

  /**
   * Retry wrapper for network requests
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          break
        }
        
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError || new Error(`Operation failed after ${maxRetries} attempts`)
  }

  /**
   * Rate limiting helper
   */
  public static createRateLimiter(requestsPerMinute: number) {
    const requests: number[] = []
    const windowMs = 60 * 1000 // 1 minute

    return {
      canMakeRequest(): boolean {
        const now = Date.now()
        
        // Remove old requests outside the window
        while (requests.length > 0 && now - requests[0] > windowMs) {
          requests.shift()
        }
        
        if (requests.length >= requestsPerMinute) {
          return false
        }
        
        requests.push(now)
        return true
      },
      
      getWaitTimeMs(): number {
        if (requests.length < requestsPerMinute) {
          return 0
        }
        
        const oldestRequest = requests[0]
        return windowMs - (Date.now() - oldestRequest)
      },
      
      getRemainingRequests(): number {
        const now = Date.now()
        
        // Clean old requests
        while (requests.length > 0 && now - requests[0] > windowMs) {
          requests.shift()
        }
        
        return Math.max(0, requestsPerMinute - requests.length)
      }
    }
  }
}

/**
 * Exchange-specific signature helpers
 */
export class ExchangeAuth {
  /**
   * Create Binance API signature
   * Query string is signed with HMAC-SHA256
   */
  public static async createBinanceSignature(
    queryString: string, 
    apiSecret: string
  ): Promise<string> {
    return await CryptoHelper.hmacSha256(queryString, apiSecret)
  }

  /**
   * Create Coinbase Pro API signature
   * Message: timestamp + method + requestPath + body
   */
  public static async createCoinbaseSignature(
    timestamp: string,
    method: string,
    requestPath: string,
    body: string,
    base64Secret: string
  ): Promise<string> {
    const message = timestamp + method.toUpperCase() + requestPath + body
    return await CryptoHelper.hmacSha256WithBase64Secret(message, base64Secret)
  }

  /**
   * Create KuCoin API signature
   * Message: timestamp + method + endpoint + body
   */
  public static async createKuCoinSignature(
    timestamp: string,
    method: string,
    endpoint: string,
    body: string,
    apiSecret: string
  ): Promise<string> {
    const message = timestamp + method.toUpperCase() + endpoint + body
    return await CryptoHelper.hmacSha256(message, apiSecret)
  }

  /**
   * Create KuCoin passphrase signature
   * Passphrase is signed with HMAC-SHA256 using API secret
   */
  public static async createKuCoinPassphrase(
    passphrase: string,
    apiSecret: string
  ): Promise<string> {
    return await CryptoHelper.hmacSha256(passphrase, apiSecret)
  }
}

export default CryptoHelper