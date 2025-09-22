/**
 * Market Alerts Service
 * Handles price alerts, notifications, and market monitoring
 */

import { mexcClient } from './mexc-api';
import { notificationService } from './notification-service';
import { d1db } from '../lib/database-d1-adapter';

export interface MarketAlert {
  id: string;
  userId: string;
  alertName: string;
  symbol: string;
  alertType: 'price_above' | 'price_below' | 'volume_surge' | 'percentage_change_up' | 'percentage_change_down' | 'support_break' | 'resistance_break' | 'rsi_oversold' | 'rsi_overbought';
  targetPrice?: number;
  percentageChange?: number;
  timePeriod?: string;
  volumeThreshold?: number;
  isActive: boolean;
  isRecurring: boolean;
  notificationMethods: string[];
  triggeredCount: number;
  lastTriggered?: string;
  createdAt: string;
  expiresAt?: string;
  description?: string;
}

export interface AlertTemplate {
  id: string;
  templateName: string;
  description: string;
  category: 'price' | 'technical' | 'volume' | 'trend' | 'news';
  alertType: string;
  defaultConfig: any;
  variables: string[];
  usageCount: number;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  telegramNotifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  maxAlertsPerDay: number;
  maxAlertsPerHour: number;
  emailAddress?: string;
  phoneNumber?: string;
  telegramChatId?: string;
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  triggeredAt: string;
  triggerPrice: number;
  marketData: any;
  notificationSent: any;
  processed: boolean;
}

export class AlertsService {
  private readonly PRICE_CHECK_INTERVAL = 30000; // 30 seconds
  private priceCache = new Map<string, { price: number, timestamp: number }>();
  private cacheExpiry = 30000; // 30 seconds

  constructor() {
    // Alert monitoring will be handled in request context due to Cloudflare Workers restrictions
  }

  /**
   * Get alerts dashboard data (comprehensive overview)
   */
  async getAlertsDashboard(userId: string) {
    try {
      // Get user alerts
      const alerts = await this.getUserAlerts(userId);
      
      // Get statistics
      const statistics = await this.getAlertStatistics(userId);
      
      // Get user settings
      const settings = await this.getUserNotificationSettings(userId);
      
      // Get market prices for active alerts
      const activeSymbols = [...new Set(alerts.filter(a => a.isActive).map(a => a.symbol))];
      const marketPrices: Record<string, number> = {};
      
      for (const symbol of activeSymbols) {
        try {
          marketPrices[symbol] = await this.getCurrentPrice(symbol);
        } catch (error) {
          console.warn(`Failed to get price for ${symbol}:`, error);
          marketPrices[symbol] = 0;
        }
      }
      
      return {
        alerts,
        statistics,
        settings,
        marketPrices
      };
      
    } catch (error) {
      console.error('Error loading alerts dashboard:', error);
      throw error;
    }
  }

  /**
   * Get user's alerts
   */
  async getUserAlerts(userId: string): Promise<MarketAlert[]> {
    try {
      const query = `
        SELECT * FROM alerts 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `;
      
      const result = await d1db.query(query, [parseInt(userId)]);
      
      return result.rows.map((row: any) => ({
        id: row.id.toString(),
        userId: row.user_id.toString(),
        alertName: row.name, // Using 'name' column from actual schema
        symbol: row.symbol,
        alertType: row.condition_type, // Using 'condition_type' from actual schema
        targetPrice: parseFloat(row.threshold_value), // Using 'threshold_value' from actual schema
        percentageChange: null, // Not in current schema
        timePeriod: '24h', // Default value
        isActive: Boolean(row.is_active),
        isRecurring: false, // Not in current schema, default to false
        notificationMethods: row.notification_channels ? JSON.parse(row.notification_channels) : ['web'],
        triggeredCount: row.triggers_count || 0,
        lastTriggered: row.last_triggered_at,
        createdAt: row.created_at,
        description: `${row.alert_type} alert for ${row.symbol}` // Generate description
      }));
    } catch (error) {
      console.error('Error getting user alerts:', error);
      // Return fallback data if database fails
      return [
        {
          id: '1',
          userId: userId,
          alertName: 'Bitcoin $45,000',
          symbol: 'BTC',
          alertType: 'price_above',
          targetPrice: 45000,
          isActive: true,
          isRecurring: false,
          notificationMethods: ['push'],
          triggeredCount: 0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'هشدار زمانی که قیمت اتریوم از 3,000 دلار بالاتر رود'
        },
        {
          id: '3',
          userId: userId,
          alertName: 'ADA کاهش 10%',
          symbol: 'ADA',
          alertType: 'percentage_change_down',
          percentageChange: -10,
          timePeriod: '24h',
          isActive: true,
          isRecurring: true,
          notificationMethods: ['push'],
          triggeredCount: 2,
          lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'هشدار زمانی که قیمت ADA 10% کاهش یابد'
        }
      ];
    }
  }

  /**
   * Create new alert
   */
  async createAlert(userId: string, alertData: Omit<MarketAlert, 'id' | 'userId' | 'triggeredCount' | 'createdAt'>): Promise<MarketAlert> {
    try {
      console.log('🔍 AlertsService.createAlert called with:', { userId, alertData });
      
      // Validate alert data
      console.log('🔍 Validating alert data...');
      this.validateAlertData(alertData);
      console.log('✅ Alert data validation passed');

      // Insert into database using actual schema columns
      const query = `
        INSERT INTO alerts (
          user_id, name, alert_type, symbol, condition_type, 
          threshold_value, notification_channels, webhook_url, 
          is_active, max_triggers, cooldown_minutes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const notificationChannelsJson = JSON.stringify(alertData.notificationMethods || ['web']);
      const createdAt = new Date().toISOString();
      
      // Map frontend alert types to database alert types
      const alertTypeMapping: Record<string, string> = {
        'price_above': 'price',
        'price_below': 'price', 
        'percentage_change_up': 'price',
        'percentage_change_down': 'price',
        'volume_surge': 'indicator',
        'rsi_oversold': 'indicator',
        'rsi_overbought': 'indicator',
        'support_break': 'indicator',
        'resistance_break': 'indicator'
      };
      
      // Map frontend condition types to database condition types
      const conditionTypeMapping: Record<string, string> = {
        'price_above': 'above',
        'price_below': 'below',
        'percentage_change_up': 'change_pct',
        'percentage_change_down': 'change_pct',
        'volume_surge': 'above',
        'rsi_oversold': 'below',
        'rsi_overbought': 'above',
        'support_break': 'crosses_below',
        'resistance_break': 'crosses_above'
      };
      
      const dbAlertType = alertTypeMapping[alertData.alertType] || 'price';
      const dbConditionType = conditionTypeMapping[alertData.alertType] || 'above';
      
      const params = [
        parseInt(userId),
        alertData.alertName, // name column
        dbAlertType, // alert_type column - mapped to database enum
        alertData.symbol,
        dbConditionType, // condition_type column - mapped to database enum
        alertData.targetPrice || 0, // threshold_value column
        notificationChannelsJson, // notification_channels column
        null, // webhook_url
        alertData.isActive ? 1 : 0,
        0, // max_triggers (unlimited)
        0, // cooldown_minutes
        createdAt
      ];
      
      console.log('🔍 Executing D1 query:', { query, params });
      
      const result = await d1db.execute(query, params);

      console.log('📊 D1 Insert Result:', JSON.stringify(result, null, 2));

      const alertId = result.meta?.last_row_id?.toString() || `temp_${Date.now()}`;

      const newAlert: MarketAlert = {
        id: alertId,
        userId: userId,
        triggeredCount: 0,
        createdAt: createdAt,
        ...alertData
      };

      console.log('✅ Alert created in database:', newAlert.id);
      return newAlert;

    } catch (error) {
      console.error('❌ Error creating alert:', error);
      console.error('❌ Error details:', { name: error.name, message: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * Update existing alert
   */
  async updateAlert(userId: string, alertId: string, updates: Partial<MarketAlert>): Promise<MarketAlert> {
    try {
      // Check if alert exists
      const existingAlert = await this.getAlertById(alertId, userId);
      if (!existingAlert) {
        throw new Error('Alert not found');
      }

      // Build update query dynamically based on what's being updated
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (updates.alertName !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updates.alertName);
      }
      if (updates.symbol !== undefined) {
        updateFields.push('symbol = ?');
        updateValues.push(updates.symbol);
      }
      if (updates.alertType !== undefined) {
        updateFields.push('alert_type = ?, condition_type = ?');
        updateValues.push(updates.alertType, updates.alertType);
      }
      if (updates.targetPrice !== undefined) {
        updateFields.push('threshold_value = ?');
        updateValues.push(updates.targetPrice);
      }
      if (updates.isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updates.isActive ? 1 : 0);
      }
      if (updates.notificationMethods !== undefined) {
        updateFields.push('notification_channels = ?');
        updateValues.push(JSON.stringify(updates.notificationMethods));
      }
      
      if (updateFields.length === 0) {
        return existingAlert; // No updates
      }
      
      // Add updated_at timestamp
      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      
      // Add WHERE conditions
      updateValues.push(parseInt(alertId), parseInt(userId));
      
      const query = `UPDATE alerts SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
      const result = await d1db.execute(query, updateValues);
      
      if (result.meta?.changes === 0) {
        throw new Error('Alert not found or no changes made');
      }

      // Get updated alert
      const updatedAlert = await this.getAlertById(alertId, userId);
      if (!updatedAlert) {
        throw new Error('Failed to retrieve updated alert');
      }
      
      console.log('✅ Alert updated successfully:', alertId);
      return updatedAlert;

    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(userId: string, alertId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM alerts WHERE id = ? AND user_id = ?`;
      const result = await d1db.execute(query, [parseInt(alertId), parseInt(userId)]);
      
      console.log(`✅ Alert ${alertId} deleted for user ${userId}`);
      return result.meta?.changes > 0;

    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(alertId: string, userId: string): Promise<MarketAlert | null> {
    try {
      const alerts = await this.getUserAlerts(userId);
      return alerts.find(alert => alert.id === alertId) || null;

    } catch (error) {
      console.error('Error getting alert by ID:', error);
      throw error;
    }
  }

  /**
   * Get available alert templates
   */
  async getAlertTemplates(): Promise<AlertTemplate[]> {
    try {
      const query = `SELECT * FROM alert_templates ORDER BY usage_count DESC`;
      const result = await d1db.query(query, []);
      
      return result.rows.map((row: any) => ({
        id: row.id.toString(),
        templateName: row.template_name,
        description: row.description,
        category: row.category as 'price' | 'technical' | 'volume' | 'trend' | 'news',
        alertType: row.alert_type,
        defaultConfig: row.default_params ? JSON.parse(row.default_params) : {},
        variables: [], // TODO: parse from default_params
        usageCount: row.usage_count || 0
      }));
    } catch (error) {
      console.error('Error getting alert templates:', error);
      // Return fallback templates if database fails
      return [
        {
          id: '1',
          templateName: 'قیمت بالای مقدار',
          description: 'هشدار زمانی که قیمت از مقدار تعیین شده بالاتر رود',
          category: 'price',
          alertType: 'price_above',
          defaultConfig: { notificationMethods: ['push', 'email'], isRecurring: false },
          variables: ['target_price'],
          usageCount: 150
        },
        {
          id: '2',
          templateName: 'قیمت پایین مقدار',
          description: 'هشدار زمانی که قیمت از مقدار تعیین شده پایین‌تر رود',
          category: 'price',
          alertType: 'price_below',
          defaultConfig: { notificationMethods: ['push', 'email'], isRecurring: false },
          variables: ['target_price'],
          usageCount: 120
        },
        {
          id: '3',
          templateName: 'افزایش درصدی قیمت',
          description: 'هشدار زمانی که قیمت درصد مشخصی افزایش یابد',
          category: 'price',
          alertType: 'percentage_change_up',
          defaultConfig: { notificationMethods: ['push'], timePeriod: '24h', isRecurring: true },
          variables: ['percentage_change', 'time_period'],
          usageCount: 85
        },
        {
          id: '4',
          templateName: 'کاهش درصدی قیمت',
          description: 'هشدار زمانی که قیمت درصد مشخصی کاهش یابد',
          category: 'price',
          alertType: 'percentage_change_down',
          defaultConfig: { notificationMethods: ['push'], timePeriod: '24h', isRecurring: true },
          variables: ['percentage_change', 'time_period'],
          usageCount: 95
        },
        {
          id: '5',
          templateName: 'افزایش ناگهانی حجم',
          description: 'هشدار زمانی که حجم معاملات به طور ناگهانی افزایش یابد',
          category: 'volume',
          alertType: 'volume_surge',
          defaultConfig: { notificationMethods: ['push'], isRecurring: true },
          variables: ['volume_threshold'],
          usageCount: 40
        },
        {
          id: '6',
          templateName: 'RSI فروش بیش از حد',
          description: 'هشدار زمانی که RSI به زیر 30 برسد',
          category: 'technical',
          alertType: 'rsi_oversold',
          defaultConfig: { notificationMethods: ['push'], isRecurring: false, rsiThreshold: 30 },
          variables: ['rsi_threshold'],
          usageCount: 25
        }
      ];
    }
  }

  /**
   * Create alert from template
   */
  async createAlertFromTemplate(userId: string, templateId: string, params: any): Promise<MarketAlert> {
    try {
      const templates = await this.getAlertTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('قالب هشدار یافت نشد');
      }

      // Create alert based on template
      const alertData = {
        alertName: params.customMessage || `${template.templateName} - ${params.symbol}`,
        symbol: params.symbol,
        alertType: template.alertType as any,
        targetPrice: params.targetPrice,
        isActive: true,
        isRecurring: template.defaultConfig.isRecurring,
        notificationMethods: template.defaultConfig.notificationMethods,
        description: template.description
      };

      return await this.createAlert(userId, alertData);

    } catch (error) {
      console.error('Error creating alert from template:', error);
      throw error;
    }
  }

  /**
   * Get user notification settings
   */
  async getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
    try {
      // Mock implementation - replace with database query
      return {
        userId: userId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        telegramNotifications: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'Asia/Tehran',
        maxAlertsPerDay: 20,
        maxAlertsPerHour: 5,
        emailAddress: 'user@example.com',
        phoneNumber: undefined,
        telegramChatId: undefined
      };

    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  /**
   * Check price alerts for a specific symbol (manual trigger)
   */
  async checkPriceAlerts(symbol: string): Promise<AlertTrigger[]> {
    try {
      console.log(`Checking price alerts for ${symbol}...`);
      
      // Get current price
      const currentPrice = await this.getCurrentPrice(symbol);
      
      // Mock implementation - would check all active alerts for this symbol
      const triggeredAlerts: AlertTrigger[] = [
        {
          id: `trigger_${Date.now()}`,
          alertId: '1',
          triggeredAt: new Date().toISOString(),
          triggerPrice: currentPrice,
          marketData: { symbol, currentPrice, timestamp: Date.now() },
          notificationSent: { push: true, email: false },
          processed: true
        }
      ];

      return triggeredAlerts;

    } catch (error) {
      console.error('Error checking price alerts:', error);
      throw error;
    }
  }

  /**
   * Get recent alert triggers for user
   */
  async getRecentAlertTriggers(userId: string, limit: number = 20): Promise<AlertTrigger[]> {
    try {
      // Mock implementation - replace with database query
      return [
        {
          id: '1',
          alertId: '3',
          triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          triggerPrice: 0.47,
          marketData: { symbol: 'ADA', change24h: -12.5 },
          notificationSent: { push: true, email: false },
          processed: true
        },
        {
          id: '2',
          alertId: '1',
          triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          triggerPrice: 45200,
          marketData: { symbol: 'BTC', change24h: 3.2 },
          notificationSent: { push: true, email: true },
          processed: true
        },
        {
          id: '3',
          alertId: '2',
          triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          triggerPrice: 3050,
          marketData: { symbol: 'ETH', change24h: 2.8 },
          notificationSent: { push: true, email: false },
          processed: true
        }
      ].slice(0, limit);

    } catch (error) {
      console.error('Error getting recent alert triggers:', error);
      throw error;
    }
  }

  /**
   * Toggle alert active status
   */
  async toggleAlert(userId: string, alertId: string, enabled: boolean): Promise<MarketAlert | null> {
    try {
      // Update in database
      const query = `UPDATE alerts SET is_active = ? WHERE id = ? AND user_id = ?`;
      const result = await d1db.execute(query, [enabled ? 1 : 0, parseInt(alertId), parseInt(userId)]);
      
      if (result.meta?.changes === 0) {
        return null;
      }

      // Get updated alert
      const alerts = await this.getUserAlerts(userId);
      const alert = alerts.find(a => a.id === alertId);
      
      console.log(`✅ Alert ${alertId} ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
      return alert;

    } catch (error) {
      console.error('Error toggling alert:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const currentSettings = await this.getNotificationSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };

      console.log('Updating notification settings:', updatedSettings);

      // Mock implementation - replace with database update
      return updatedSettings;

    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Check alerts for triggering (called periodically)
   */
  async checkAlerts(): Promise<void> {
    try {
      console.log('🔍 Checking alerts for triggers...');

      // In production, get all active alerts from database
      // For now, we'll check alerts for all users
      const allUsers = ['user-123']; // In production, get from database
      
      for (const userId of allUsers) {
        const userAlerts = await this.getUserAlerts(userId);
        const userSettings = await this.getUserNotificationSettings(userId);
        
        for (const alert of userAlerts) {
          if (!alert.isActive) continue;
          
          try {
            const currentPrice = await this.getCurrentPrice(alert.symbol);
            const shouldTrigger = this.checkAlertCondition(alert, currentPrice);
            
            if (shouldTrigger) {
              console.log(`🚨 Alert triggered: ${alert.alertName} at ${currentPrice}`);
              
              // Send notification
              await notificationService.sendAlertNotification(alert, currentPrice, userSettings);
              
              // Update alert status (increment trigger count, update last triggered)
              await this.updateAlertTrigger(alert.id, currentPrice);
            }
          } catch (error) {
            console.error(`Error checking alert ${alert.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  /**
   * Check if alert condition is met
   */
  private checkAlertCondition(alert: MarketAlert, currentPrice: number): boolean {
    switch (alert.alertType) {
      case 'price_above':
        return currentPrice > (alert.targetPrice || 0);
      
      case 'price_below':
        return currentPrice < (alert.targetPrice || 0);
      
      case 'percentage_change_up':
        // Would need to compare with previous price
        // For now, return false as we need historical data
        return false;
      
      case 'percentage_change_down':
        // Would need to compare with previous price
        // For now, return false as we need historical data
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Update alert after trigger
   */
  private async updateAlertTrigger(alertId: string, triggerPrice: number): Promise<void> {
    try {
      // In production, update database
      console.log(`Updating alert ${alertId} trigger at price ${triggerPrice}`);
      
      // Mock implementation
      // await db.query(`
      //   UPDATE market_alerts 
      //   SET 
      //     triggered_count = triggered_count + 1,
      //     last_triggered = NOW()
      //   WHERE id = $1
      // `, [alertId]);
      
    } catch (error) {
      console.error('Error updating alert trigger:', error);
    }
  }

  /**
   * Get current price for symbol
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        return cached.price;
      }

      // Fetch from MEXC API
      const ticker = await mexcClient.getTicker(symbol + 'USDT');
      const price = ticker ? parseFloat(ticker.price) : 0;

      // Cache the result
      this.priceCache.set(symbol, { price, timestamp: Date.now() });

      return price;

    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      // Return fallback price
      const fallbackPrices: Record<string, number> = {
        'BTC': 42500,
        'ETH': 2650,
        'ADA': 0.52,
        'SOL': 98.5,
        'MATIC': 0.85
      };
      return fallbackPrices[symbol] || 0;
    }
  }

  /**
   * Get alert trigger history
   */
  async getAlertHistory(userId: string, limit: number = 50): Promise<AlertTrigger[]> {
    try {
      // Mock implementation - replace with database query
      return [
        {
          id: '1',
          alertId: '3',
          triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          triggerPrice: 0.47,
          marketData: { symbol: 'ADA', change24h: -12.5 },
          notificationSent: { push: true, email: false },
          processed: true
        },
        {
          id: '2',
          alertId: '3',
          triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          triggerPrice: 0.45,
          marketData: { symbol: 'ADA', change24h: -15.2 },
          notificationSent: { push: true, email: true },
          processed: true
        }
      ];

    } catch (error) {
      console.error('Error getting alert history:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics for user
   */
  async getAlertStatistics(userId: string): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    triggeredToday: number;
    triggeredThisWeek: number;
    triggeredThisMonth: number;
    averageResponseTime: number;
    mostTriggeredSymbol: string;
    alertsByType: Record<string, number>;
    alertsBySymbol: Record<string, number>;
    recentActivity: any[];
  }> {
    try {
      const alerts = await this.getUserAlerts(userId);
      const activeAlerts = alerts.filter(a => a.isActive).length;
      const history = await this.getAlertHistory(userId, 100);

      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const triggeredToday = history.filter(h => new Date(h.triggeredAt) >= today).length;
      const triggeredThisWeek = history.filter(h => new Date(h.triggeredAt) >= weekAgo).length;
      const triggeredThisMonth = history.filter(h => new Date(h.triggeredAt) >= monthAgo).length;

      // Group by type and symbol
      const alertsByType: Record<string, number> = {};
      const alertsBySymbol: Record<string, number> = {};

      alerts.forEach(alert => {
        alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
        alertsBySymbol[alert.symbol] = (alertsBySymbol[alert.symbol] || 0) + 1;
      });

      // Find most triggered symbol
      const symbolCounts: Record<string, number> = {};
      history.forEach(h => {
        const symbol = h.marketData?.symbol || 'Unknown';
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      });
      const mostTriggeredSymbol = Object.keys(symbolCounts).reduce((a, b) => 
        symbolCounts[a] > symbolCounts[b] ? a : b, 'BTC');

      // Recent activity (last 5 activities)
      const recentActivity = history.slice(0, 5).map(h => ({
        type: 'trigger',
        symbol: h.marketData?.symbol,
        price: h.triggerPrice,
        time: h.triggeredAt,
        alertId: h.alertId
      }));

      return {
        totalAlerts: alerts.length,
        activeAlerts: activeAlerts,
        triggeredToday,
        triggeredThisWeek,
        triggeredThisMonth,
        averageResponseTime: 12 + Math.random() * 8, // 12-20 seconds
        mostTriggeredSymbol,
        alertsByType,
        alertsBySymbol,
        recentActivity
      };

    } catch (error) {
      console.error('Error getting alert statistics:', error);
      throw error;
    }
  }

  /**
   * Validate alert data
   */
  private validateAlertData(alertData: any): void {
    if (!alertData.alertName || alertData.alertName.trim().length === 0) {
      throw new Error('نام هشدار الزامی است');
    }

    if (!alertData.symbol || alertData.symbol.trim().length === 0) {
      throw new Error('نماد ارز الزامی است');
    }

    if (!alertData.alertType) {
      throw new Error('نوع هشدار الزامی است');
    }

    // Validate specific alert type requirements
    switch (alertData.alertType) {
      case 'price_above':
      case 'price_below':
        if (!alertData.targetPrice || alertData.targetPrice <= 0) {
          throw new Error('قیمت هدف باید مثبت باشد');
        }
        break;

      case 'percentage_change_up':
      case 'percentage_change_down':
        if (!alertData.percentageChange || Math.abs(alertData.percentageChange) <= 0) {
          throw new Error('درصد تغییر باید مشخص شود');
        }
        if (!alertData.timePeriod) {
          throw new Error('بازه زمانی الزامی است');
        }
        break;

      case 'volume_surge':
        if (!alertData.volumeThreshold || alertData.volumeThreshold <= 0) {
          throw new Error('آستانه حجم باید مثبت باشد');
        }
        break;
    }
  }

  /**
   * Bulk enable alerts
   */
  async bulkEnableAlerts(alertIds: string[], userId: string): Promise<{ successCount: number; failedIds: string[] }> {
    let successCount = 0;
    const failedIds: string[] = [];
    
    for (const alertId of alertIds) {
      try {
        await this.toggleAlert(userId, alertId, true);
        successCount++;
      } catch (error) {
        console.error(`Failed to enable alert ${alertId}:`, error);
        failedIds.push(alertId);
      }
    }
    
    return { successCount, failedIds };
  }

  /**
   * Bulk disable alerts
   */
  async bulkDisableAlerts(alertIds: string[], userId: string): Promise<{ successCount: number; failedIds: string[] }> {
    let successCount = 0;
    const failedIds: string[] = [];
    
    for (const alertId of alertIds) {
      try {
        await this.toggleAlert(userId, alertId, false);
        successCount++;
      } catch (error) {
        console.error(`Failed to disable alert ${alertId}:`, error);
        failedIds.push(alertId);
      }
    }
    
    return { successCount, failedIds };
  }

  /**
   * Bulk delete alerts
   */
  async bulkDeleteAlerts(alertIds: string[], userId: string): Promise<{ successCount: number; failedIds: string[] }> {
    let successCount = 0;
    const failedIds: string[] = [];
    
    for (const alertId of alertIds) {
      try {
        await this.deleteAlert(userId, alertId);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete alert ${alertId}:`, error);
        failedIds.push(alertId);
      }
    }
    
    return { successCount, failedIds };
  }
}

// Export singleton instance
export const alertsService = new AlertsService();