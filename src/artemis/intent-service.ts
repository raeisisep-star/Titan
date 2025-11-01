/**
 * Intent Service
 * Task-9: Handle intent processing with DB logging and confirmation tokens
 */

import { Pool } from 'pg';
import { IntentClassifier, ClassificationResult } from './intent-classifier';
import crypto from 'crypto';

export interface IntentRequest {
  text: string;
  user_id: number;
  session_id?: string;
  language?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface IntentResponse extends ClassificationResult {
  log_id: number;
  confirmation_token?: string;
  confirmation_expires_at?: string;
}

export class IntentService {
  private classifier: IntentClassifier;
  
  constructor(private pool: Pool) {
    this.classifier = new IntentClassifier();
  }
  
  /**
   * Process intent request
   */
  async processIntent(request: IntentRequest): Promise<IntentResponse> {
    // Classify intent
    const classification = this.classifier.classify(request.text);
    
    // Log to database
    const logId = await this.logIntent({
      user_id: request.user_id,
      session_id: request.session_id || this.generateSessionId(),
      text: request.text,
      language: request.language || 'en',
      intent: classification.intent,
      confidence: classification.confidence,
      actions: classification.actions,
      response: classification.response,
      outcome: classification.requires_confirmation ? 'pending' : 'success',
      ip_address: request.ip_address,
      user_agent: request.user_agent
    });
    
    const response: IntentResponse = {
      ...classification,
      log_id: logId
    };
    
    // Generate confirmation token for sensitive actions
    if (classification.requires_confirmation) {
      const token = await this.createConfirmationToken({
        user_id: request.user_id,
        intent_log_id: logId,
        intent: classification.intent,
        parameters: classification.parameters || {}
      });
      
      response.confirmation_token = token.token;
      response.confirmation_expires_at = token.expires_at;
      response.response += `\n\n🔐 **Confirmation Required**\nPlease confirm with token: \`${token.token}\`\nExpires: ${new Date(token.expires_at).toLocaleString()}`;
    }
    
    return response;
  }
  
  /**
   * Confirm sensitive action
   */
  async confirmIntent(token: string, user_id: number): Promise<{
    success: boolean;
    intent: string;
    parameters: any;
    message: string;
  }> {
    const result = await this.pool.query(
      `SELECT id, user_id, intent_log_id, intent, parameters, expires_at, confirmed
       FROM intent_confirmation_tokens
       WHERE token = $1`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        intent: '',
        parameters: {},
        message: 'Invalid confirmation token'
      };
    }
    
    const confirmation = result.rows[0];
    
    // Check expiration
    if (new Date(confirmation.expires_at) < new Date()) {
      return {
        success: false,
        intent: confirmation.intent,
        parameters: confirmation.parameters,
        message: 'Confirmation token expired'
      };
    }
    
    // Check user
    if (confirmation.user_id !== user_id) {
      return {
        success: false,
        intent: confirmation.intent,
        parameters: confirmation.parameters,
        message: 'Token belongs to different user'
      };
    }
    
    // Check if already confirmed
    if (confirmation.confirmed) {
      return {
        success: false,
        intent: confirmation.intent,
        parameters: confirmation.parameters,
        message: 'Token already used'
      };
    }
    
    // Mark as confirmed
    await this.pool.query(
      `UPDATE intent_confirmation_tokens
       SET confirmed = true, confirmed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [confirmation.id]
    );
    
    // Update intent log outcome
    await this.pool.query(
      `UPDATE ai_intent_logs
       SET outcome = 'success'
       WHERE id = $1`,
      [confirmation.intent_log_id]
    );
    
    return {
      success: true,
      intent: confirmation.intent,
      parameters: confirmation.parameters,
      message: `Action confirmed: ${confirmation.intent}`
    };
  }
  
  /**
   * Get user's conversation history
   */
  async getConversationHistory(user_id: number, limit: number = 10): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM get_user_recent_intents($1, $2)`,
      [user_id, limit]
    );
    
    return result.rows;
  }
  
  /**
   * Get intent statistics
   */
  async getStatistics(days: number = 7): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM get_intent_statistics($1)`,
      [days]
    );
    
    return result.rows;
  }
  
  /**
   * Log intent to database
   */
  private async logIntent(data: {
    user_id: number;
    session_id: string;
    text: string;
    language: string;
    intent: string;
    confidence: number;
    actions: string[];
    response: string;
    outcome: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<number> {
    const result = await this.pool.query(
      `INSERT INTO ai_intent_logs 
       (user_id, session_id, text, language, intent, confidence, actions, response, outcome, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
       RETURNING id`,
      [
        data.user_id,
        data.session_id,
        data.text,
        data.language,
        data.intent,
        data.confidence,
        JSON.stringify(data.actions),
        data.response,
        data.outcome,
        data.ip_address || null,
        data.user_agent || null
      ]
    );
    
    return result.rows[0].id;
  }
  
  /**
   * Create confirmation token for sensitive action
   */
  private async createConfirmationToken(data: {
    user_id: number;
    intent_log_id: number;
    intent: string;
    parameters: any;
  }): Promise<{ token: string; expires_at: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    await this.pool.query(
      `INSERT INTO intent_confirmation_tokens 
       (user_id, intent_log_id, token, intent, parameters, expires_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
      [
        data.user_id,
        data.intent_log_id,
        token,
        data.intent,
        JSON.stringify(data.parameters),
        expiresAt
      ]
    );
    
    return {
      token,
      expires_at: expiresAt.toISOString()
    };
  }
  
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  /**
   * Cleanup expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.pool.query(`SELECT cleanup_expired_intent_tokens()`);
    return result.rows[0].cleanup_expired_intent_tokens;
  }
}
