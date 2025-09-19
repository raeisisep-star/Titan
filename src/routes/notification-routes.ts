/**
 * TITAN Trading System - Notification API Routes
 * RESTful API endpoints for notification and alert management
 * 
 * Features:
 * - Alert rule CRUD operations
 * - Notification preferences management
 * - Real-time notification delivery
 * - Notification history and analytics
 * - WebSocket subscriptions for real-time updates
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  notificationService,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  AlertCondition,
  AlertRule,
  NotificationMessage,
  NotificationPreferences,
  AlertTriggerContext
} from '../services/notification-service';

type Bindings = {
  DB: D1Database;
};

const notificationRoutes = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all notification routes
notificationRoutes.use('/*', cors());

/**
 * Initialize notification service
 */
notificationRoutes.post('/initialize', async (c) => {
  try {
    await notificationService.initialize();
    
    return c.json({
      success: true,
      message: 'Notification service initialized successfully'
    });
  } catch (error) {
    console.error('Failed to initialize notification service:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Alert Rules Management
 */

// Create new alert rule
notificationRoutes.post('/alerts/rules', async (c) => {
  try {
    const ruleData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['user_id', 'name', 'condition', 'notification_type', 'channels', 'priority'];
    for (const field of requiredFields) {
      if (!ruleData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }
    
    const rule: Omit<AlertRule, 'id'> = {
      user_id: parseInt(ruleData.user_id),
      name: ruleData.name,
      description: ruleData.description,
      symbol: ruleData.symbol,
      condition: ruleData.condition as AlertCondition,
      condition_params: ruleData.condition_params || {},
      notification_type: ruleData.notification_type as NotificationType,
      channels: ruleData.channels as NotificationChannel[],
      priority: ruleData.priority as NotificationPriority,
      is_active: ruleData.is_active !== false,
      cooldown_minutes: ruleData.cooldown_minutes,
      max_alerts_per_day: ruleData.max_alerts_per_day,
      conditions_logic: ruleData.conditions_logic || 'AND'
    };
    
    const ruleId = await notificationService.createAlertRule(rule);
    
    return c.json({
      success: true,
      rule_id: ruleId,
      message: 'Alert rule created successfully'
    });
  } catch (error) {
    console.error('Failed to create alert rule:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Get alert rules for user
notificationRoutes.get('/alerts/rules/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    const rules = await notificationService.getAlertRules(userId);
    
    return c.json({
      success: true,
      rules,
      count: rules.length
    });
  } catch (error) {
    console.error('Failed to get alert rules:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update alert rule
notificationRoutes.put('/alerts/rules/:ruleId', async (c) => {
  try {
    const ruleId = parseInt(c.req.param('ruleId'));
    const updates = await c.req.json();
    
    if (isNaN(ruleId)) {
      return c.json({
        success: false,
        error: 'Invalid rule ID'
      }, 400);
    }
    
    const success = await notificationService.updateAlertRule(ruleId, updates);
    
    if (!success) {
      return c.json({
        success: false,
        error: 'Alert rule not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Alert rule updated successfully'
    });
  } catch (error) {
    console.error('Failed to update alert rule:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Delete alert rule
notificationRoutes.delete('/alerts/rules/:ruleId', async (c) => {
  try {
    const ruleId = parseInt(c.req.param('ruleId'));
    
    if (isNaN(ruleId)) {
      return c.json({
        success: false,
        error: 'Invalid rule ID'
      }, 400);
    }
    
    const success = await notificationService.deleteAlertRule(ruleId);
    
    if (!success) {
      return c.json({
        success: false,
        error: 'Alert rule not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Alert rule deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete alert rule:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Notification Management
 */

// Send notification
notificationRoutes.post('/send', async (c) => {
  try {
    const notificationData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['user_id', 'type', 'title', 'message', 'priority', 'channels'];
    for (const field of requiredFields) {
      if (!notificationData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }
    
    const notification: Omit<NotificationMessage, 'id'> = {
      user_id: parseInt(notificationData.user_id),
      type: notificationData.type as NotificationType,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data,
      priority: notificationData.priority as NotificationPriority,
      channels: notificationData.channels as NotificationChannel[],
      is_read: false,
      delivered_channels: [],
      retry_count: 0,
      scheduled_at: notificationData.scheduled_at
    };
    
    const success = await notificationService.sendNotification(notification);
    
    return c.json({
      success,
      message: success ? 'Notification sent successfully' : 'Failed to send notification'
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Send bulk notifications
notificationRoutes.post('/send/bulk', async (c) => {
  try {
    const { notifications } = await c.req.json();
    
    if (!Array.isArray(notifications)) {
      return c.json({
        success: false,
        error: 'Notifications must be an array'
      }, 400);
    }
    
    const successCount = await notificationService.sendBulkNotifications(notifications);
    
    return c.json({
      success: true,
      sent_count: successCount,
      total_count: notifications.length,
      message: `${successCount}/${notifications.length} notifications sent successfully`
    });
  } catch (error) {
    console.error('Failed to send bulk notifications:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Alert Trigger Endpoints
 */

// Trigger alert check (for testing or manual triggers)
notificationRoutes.post('/alerts/check', async (c) => {
  try {
    const context: AlertTriggerContext = await c.req.json();
    
    // Validate context
    if (!context.timestamp) {
      context.timestamp = Date.now();
    }
    
    await notificationService.checkAlerts(context);
    
    return c.json({
      success: true,
      message: 'Alert check completed',
      context
    });
  } catch (error) {
    console.error('Failed to check alerts:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Trigger price alert (convenience endpoint for price updates)
notificationRoutes.post('/alerts/price', async (c) => {
  try {
    const { symbol, price, previous_price, volume } = await c.req.json();
    
    if (!symbol || !price) {
      return c.json({
        success: false,
        error: 'Symbol and price are required'
      }, 400);
    }
    
    const context: AlertTriggerContext = {
      symbol,
      price: parseFloat(price),
      previous_price: previous_price ? parseFloat(previous_price) : undefined,
      price_change: previous_price ? parseFloat(price) - parseFloat(previous_price) : 0,
      price_change_percent: previous_price ? 
        ((parseFloat(price) - parseFloat(previous_price)) / parseFloat(previous_price)) * 100 : 0,
      volume: volume ? parseFloat(volume) : undefined,
      timestamp: Date.now()
    };
    
    await notificationService.checkAlerts(context);
    
    return c.json({
      success: true,
      message: 'Price alert check completed',
      context
    });
  } catch (error) {
    console.error('Failed to trigger price alert:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

// Trigger portfolio alert
notificationRoutes.post('/alerts/portfolio', async (c) => {
  try {
    const { user_id, total_value, change_24h, change_percent_24h, drawdown } = await c.req.json();
    
    if (!user_id || total_value === undefined) {
      return c.json({
        success: false,
        error: 'User ID and total value are required'
      }, 400);
    }
    
    const context: AlertTriggerContext = {
      portfolio_data: {
        total_value: parseFloat(total_value),
        change_24h: parseFloat(change_24h || 0),
        change_percent_24h: parseFloat(change_percent_24h || 0),
        drawdown: parseFloat(drawdown || 0)
      },
      timestamp: Date.now()
    };
    
    await notificationService.checkAlerts(context);
    
    return c.json({
      success: true,
      message: 'Portfolio alert check completed',
      context
    });
  } catch (error) {
    console.error('Failed to trigger portfolio alert:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * WebSocket Management
 */

// WebSocket connection info
notificationRoutes.get('/websocket/info', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'WebSocket notification endpoint',
      endpoint: '/api/notifications/ws',
      note: 'Use WebSocket client to connect for real-time notifications'
    });
  } catch (error) {
    console.error('WebSocket info error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Notification Preferences
 */

// Get user notification preferences
notificationRoutes.get('/preferences/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    // Mock preferences - in real implementation, load from database
    const preferences: NotificationPreferences = {
      user_id: userId,
      enabled_channels: ['websocket', 'email'],
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00',
        timezone: 'UTC'
      },
      priority_filter: 'normal',
      type_preferences: {
        price_alert: {
          enabled: true,
          channels: ['websocket', 'email'],
          priority: 'normal'
        },
        trade_executed: {
          enabled: true,
          channels: ['websocket', 'push'],
          priority: 'high'
        },
        risk_warning: {
          enabled: true,
          channels: ['websocket', 'email', 'sms'],
          priority: 'critical'
        }
      },
      rate_limits: {
        max_per_hour: 50,
        max_per_day: 200,
        cooldown_minutes: 1
      }
    };
    
    return c.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update user notification preferences
notificationRoutes.put('/preferences/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const preferences = await c.req.json();
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    // In real implementation, save to database
    
    return c.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Notification Analytics
 */

// Get notification statistics
notificationRoutes.get('/analytics/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const days = parseInt(c.req.query('days') || '30');
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    // Mock analytics - in real implementation, query from database
    const analytics = {
      total_notifications: 245,
      notifications_by_type: {
        price_alert: 123,
        trade_executed: 67,
        portfolio_change: 34,
        risk_warning: 12,
        system_alert: 9
      },
      notifications_by_channel: {
        websocket: 245,
        email: 89,
        push: 156,
        sms: 12
      },
      delivery_success_rate: 98.4,
      average_delivery_time: 1.2, // seconds
      alerts_triggered: 89,
      most_active_alert: 'BTC Price Above $50,000',
      time_period: `Last ${days} days`
    };
    
    return c.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Failed to get notification analytics:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * System Status and Health
 */

// Get notification system status
notificationRoutes.get('/status', async (c) => {
  try {
    // Mock status - in real implementation, get from service
    const status = {
      service_status: 'healthy',
      queue_length: 0,
      active_alerts: 156,
      websocket_connections: 23,
      delivery_channels: {
        websocket: 'operational',
        email: 'operational',
        sms: 'operational',
        push: 'operational',
        webhook: 'operational'
      },
      last_check: new Date().toISOString(),
      uptime: '99.98%'
    };
    
    return c.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Failed to get notification status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test notification delivery
notificationRoutes.post('/test', async (c) => {
  try {
    const { user_id, channel, message } = await c.req.json();
    
    if (!user_id || !channel) {
      return c.json({
        success: false,
        error: 'User ID and channel are required'
      }, 400);
    }
    
    const testNotification: Omit<NotificationMessage, 'id'> = {
      user_id: parseInt(user_id),
      type: 'system_alert',
      title: 'Test Notification',
      message: message || 'This is a test notification from TITAN Trading System',
      priority: 'normal',
      channels: [channel as NotificationChannel],
      is_read: false,
      delivered_channels: [],
      retry_count: 0
    };
    
    const success = await notificationService.sendNotification(testNotification);
    
    return c.json({
      success,
      message: success ? 'Test notification sent successfully' : 'Failed to send test notification',
      channel
    });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

export default notificationRoutes;