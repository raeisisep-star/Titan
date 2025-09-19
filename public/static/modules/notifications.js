/**
 * In-App Notifications System
 * Toast notifications, Push notifications, PWA support
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 seconds
        this.pushSubscription = null;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize notification container
            this.createNotificationContainer();
            
            // Register service worker for PWA
            await this.registerServiceWorker();
            
            // Request notification permission
            await this.requestNotificationPermission();
            
            // Initialize push notifications
            await this.initializePushNotifications();
            
            console.log('✅ Notification Manager initialized successfully');
        } catch (error) {
            console.error('❌ Notification Manager initialization failed:', error);
        }
    }

    // =============================================================================
    // SERVICE WORKER & PWA SETUP
    // =============================================================================

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/static/service-worker.js', {
                    scope: '/'
                });
                
                this.serviceWorkerRegistration = registration;
                
                console.log('✅ Service Worker registered successfully');
                
                // Handle service worker updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                    const newWorker = registration.installing;
                    
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showToast({
                                    title: '🔄 به‌روزرسانی موجود',
                                    message: 'نسخه جدید تایتان آماده است',
                                    type: 'info',
                                    duration: 0,
                                    actions: [{
                                        text: 'به‌روزرسانی',
                                        action: () => {
                                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                                            window.location.reload();
                                        }
                                    }, {
                                        text: 'بعداً',
                                        action: 'dismiss'
                                    }]
                                });
                            }
                        });
                    }
                });
                
                // Handle service worker messages
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });
                
                return registration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
                throw error;
            }
        } else {
            console.warn('⚠️ Service Worker not supported');
            return null;
        }
    }

    handleServiceWorkerMessage(message) {
        console.log('📩 Service Worker message:', message);
        
        const { type, data } = message;
        
        switch (type) {
            case 'NOTIFICATION_CLICK':
                this.handleNotificationClick(data);
                break;
                
            case 'BACKGROUND_SYNC_COMPLETE':
                this.showToast({
                    title: '🔄 همگام‌سازی کامل شد',
                    message: 'داده‌های جدید دریافت شد',
                    type: 'success'
                });
                break;
                
            case 'OFFLINE_MODE':
                this.showToast({
                    title: '📱 حالت آفلاین',
                    message: 'اتصال اینترنت قطع شده - از حافظه محلی استفاده می‌شود',
                    type: 'warning',
                    duration: 0
                });
                break;
                
            case 'ONLINE_MODE':
                this.showToast({
                    title: '🌐 اتصال برقرار شد',
                    message: 'دوباره آنلاین هستید',
                    type: 'success'
                });
                break;
        }
    }

    // =============================================================================
    // PUSH NOTIFICATIONS
    // =============================================================================

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Browser notifications not supported');
            return false;
        }

        let permission = Notification.permission;
        
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.warn('⚠️ Notification permission denied');
            this.showToast({
                title: '🔔 مجوز اعلان‌ها',
                message: 'برای دریافت هشدارها، مجوز اعلان‌ها را فعال کنید',
                type: 'warning',
                duration: 0,
                actions: [{
                    text: 'درخواست مجدد',
                    action: () => this.requestNotificationPermission()
                }]
            });
            return false;
        }
    }

    async initializePushNotifications() {
        if (!this.serviceWorkerRegistration) {
            console.warn('⚠️ Service Worker not available for push notifications');
            return;
        }

        try {
            // Check if push messaging is supported
            if (!('PushManager' in window)) {
                console.warn('⚠️ Push messaging not supported');
                return;
            }

            // Get existing subscription
            this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
            
            if (this.pushSubscription) {
                console.log('✅ Existing push subscription found');
                await this.sendSubscriptionToServer(this.pushSubscription);
            } else {
                console.log('📝 No push subscription found');
            }
            
        } catch (error) {
            console.error('❌ Push notification initialization failed:', error);
        }
    }

    async subscribeToPushNotifications() {
        if (!this.serviceWorkerRegistration) {
            throw new Error('Service Worker not registered');
        }

        try {
            // VAPID public key (should be generated on server)
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NObzOUmzhA9to0GUd4W5F8UgW9kLBbezSJpJOHYhp9w_rr_bHA';
            
            const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });
            
            this.pushSubscription = subscription;
            
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            
            console.log('✅ Push notifications subscribed successfully');
            
            this.showToast({
                title: '🔔 اعلان‌ها فعال شد',
                message: 'هشدارهای بازار را دریافت خواهید کرد',
                type: 'success'
            });
            
            return subscription;
            
        } catch (error) {
            console.error('❌ Push subscription failed:', error);
            
            this.showToast({
                title: '❌ خطا در فعال‌سازی اعلان‌ها',
                message: 'امکان فعال‌سازی اعلان‌ها وجود ندارد',
                type: 'error'
            });
            
            throw error;
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            const response = await axios.post('/api/notifications/subscribe', {
                subscription: subscription.toJSON(),
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
            
            if (response.data.success) {
                console.log('✅ Push subscription sent to server');
            } else {
                console.warn('⚠️ Failed to send subscription to server:', response.data.error);
            }
        } catch (error) {
            console.error('❌ Error sending subscription to server:', error);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // =============================================================================
    // IN-APP TOAST NOTIFICATIONS
    // =============================================================================

    createNotificationContainer() {
        // Check if container already exists
        if (document.getElementById('notification-container')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 left-4 z-50 space-y-2 max-w-sm';
        container.style.direction = 'rtl';
        
        document.body.appendChild(container);
    }

    showToast({ title, message, type = 'info', duration = null, icon = null, actions = [] }) {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            duration: duration !== null ? duration : this.defaultDuration,
            icon: icon || this.getIconForType(type),
            actions,
            timestamp: new Date().toISOString()
        };

        this.notifications.push(notification);
        
        // Remove oldest notifications if exceeding max
        while (this.notifications.length > this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.removeToastElement(oldest.id);
        }

        this.renderToast(notification);
        
        // Auto-dismiss if duration is set
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismissToast(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }

    renderToast(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.id = `toast-${notification.id}`;
        toast.className = `
            bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 
            transform transition-all duration-300 ease-in-out
            animate-slideInRight max-w-sm
        `;

        // Apply type-specific styling
        const typeStyles = {
            success: 'border-green-500 bg-green-900/20',
            error: 'border-red-500 bg-red-900/20', 
            warning: 'border-yellow-500 bg-yellow-900/20',
            info: 'border-blue-500 bg-blue-900/20'
        };
        
        toast.className += ` ${typeStyles[notification.type] || typeStyles.info}`;

        toast.innerHTML = `
            <div class="flex items-start space-x-3 space-x-reverse">
                <div class="flex-shrink-0">
                    <div class="w-6 h-6 text-lg">${notification.icon}</div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white mb-1">
                        ${notification.title}
                    </div>
                    <div class="text-sm text-gray-300">
                        ${notification.message}
                    </div>
                    ${notification.actions.length > 0 ? this.renderToastActions(notification) : ''}
                </div>
                <button 
                    onclick="notificationManager.dismissToast('${notification.id}')"
                    class="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${notification.duration > 0 ? this.renderProgressBar(notification) : ''}
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
    }

    renderToastActions(notification) {
        if (!notification.actions || notification.actions.length === 0) {
            return '';
        }

        return `
            <div class="mt-3 flex space-x-2 space-x-reverse">
                ${notification.actions.map(action => `
                    <button 
                        onclick="notificationManager.handleToastAction('${notification.id}', '${action.action}')"
                        class="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 
                               text-white rounded transition-colors"
                    >
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderProgressBar(notification) {
        return `
            <div class="mt-2 w-full bg-gray-700 rounded-full h-1">
                <div class="bg-blue-500 h-1 rounded-full animate-progress" 
                     style="animation-duration: ${notification.duration}ms;"></div>
            </div>
        `;
    }

    handleToastAction(notificationId, action) {
        const notification = this.notifications.find(n => n.id == notificationId);
        if (!notification) return;

        const actionConfig = notification.actions.find(a => a.action === action);
        if (!actionConfig) return;

        if (action === 'dismiss' || !actionConfig.action) {
            this.dismissToast(notificationId);
        } else if (typeof actionConfig.action === 'function') {
            actionConfig.action();
            this.dismissToast(notificationId);
        }
    }

    dismissToast(notificationId) {
        this.removeToastElement(notificationId);
        this.notifications = this.notifications.filter(n => n.id != notificationId);
    }

    removeToastElement(notificationId) {
        const toast = document.getElementById(`toast-${notificationId}`);
        if (toast) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    getIconForType(type) {
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // =============================================================================
    // BROWSER NOTIFICATIONS (for background)
    // =============================================================================

    showBrowserNotification({ title, body, icon, tag, data = {} }) {
        if (Notification.permission !== 'granted') {
            console.warn('⚠️ Browser notifications not permitted');
            return;
        }

        try {
            const notification = new Notification(title, {
                body,
                icon: icon || '/static/icons/icon-192x192.png',
                badge: '/static/icons/icon-72x72.png',
                tag: tag || 'titan-notification',
                renotify: true,
                requireInteraction: true,
                data: {
                    timestamp: new Date().toISOString(),
                    ...data
                },
                lang: 'fa',
                dir: 'rtl'
            });

            notification.onclick = (event) => {
                window.focus();
                this.handleNotificationClick(event.target.data);
                notification.close();
            };

            // Auto-close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);

            return notification;
            
        } catch (error) {
            console.error('❌ Browser notification failed:', error);
            
            // Fallback to toast notification
            this.showToast({
                title,
                message: body,
                type: 'info',
                duration: 8000
            });
        }
    }

    handleNotificationClick(data) {
        console.log('🖱️ Notification clicked:', data);
        
        // Handle specific notification types
        if (data.alertId) {
            // Navigate to alerts page
            if (typeof loadAlerts === 'function') {
                loadAlerts();
            }
        } else if (data.url) {
            // Navigate to specific URL
            window.location.hash = data.url;
        }
    }

    // =============================================================================
    // ALERT-SPECIFIC NOTIFICATIONS
    // =============================================================================

    showAlertNotification(alertData) {
        const { alertName, symbol, targetPrice, message, alertType } = alertData;
        
        // Show in-app toast
        const toastId = this.showToast({
            title: `🚨 ${alertName}`,
            message: `${symbol}: $${targetPrice} - ${message}`,
            type: 'warning',
            duration: 0, // Don't auto-dismiss
            icon: '📈',
            actions: [
                {
                    text: '🔍 مشاهده',
                    action: () => {
                        if (typeof loadAlerts === 'function') {
                            loadAlerts();
                        }
                    }
                },
                {
                    text: '❌ بستن',
                    action: 'dismiss'
                }
            ]
        });

        // Show browser notification if app is in background
        if (document.hidden || !document.hasFocus()) {
            this.showBrowserNotification({
                title: `🚨 هشدار بازار: ${symbol}`,
                body: `${alertName}\nقیمت: $${targetPrice}\n${message}`,
                tag: `alert-${alertData.id}`,
                data: {
                    alertId: alertData.id,
                    symbol,
                    url: '#alerts'
                }
            });
        }

        // Send to service worker for background processing
        if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
            this.serviceWorkerRegistration.active.postMessage({
                type: 'CACHE_ALERT_DATA',
                data: alertData
            });
        }

        return toastId;
    }

    // =============================================================================
    // CONNECTION STATUS
    // =============================================================================

    initializeConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.showToast({
                title: '🌐 اتصال برقرار شد',
                message: 'دوباره آنلاین هستید',
                type: 'success'
            });
        });

        window.addEventListener('offline', () => {
            this.showToast({
                title: '📱 حالت آفلاین',
                message: 'اتصال اینترنت قطع شده - از حافظه محلی استفاده می‌شود',
                type: 'warning',
                duration: 0
            });
        });
    }

    // =============================================================================
    // PWA INSTALL PROMPT
    // =============================================================================

    initializePWAInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💾 PWA install prompt available');
            
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            // Show custom install notification
            this.showToast({
                title: '📱 نصب اپلیکیشن',
                message: 'تایتان را روی دستگاه خود نصب کنید',
                type: 'info',
                duration: 0,
                icon: '💾',
                actions: [
                    {
                        text: '📱 نصب',
                        action: async () => {
                            if (deferredPrompt) {
                                deferredPrompt.prompt();
                                const { outcome } = await deferredPrompt.userChoice;
                                
                                if (outcome === 'accepted') {
                                    this.showToast({
                                        title: '✅ نصب موفق',
                                        message: 'تایتان روی دستگاه شما نصب شد',
                                        type: 'success'
                                    });
                                }
                                
                                deferredPrompt = null;
                            }
                        }
                    },
                    {
                        text: '❌ بعداً',
                        action: 'dismiss'
                    }
                ]
            });
        });

        // Handle PWA installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            
            this.showToast({
                title: '🎉 نصب کامل شد',
                message: 'تایتان با موفقیت نصب شد',
                type: 'success'
            });
            
            deferredPrompt = null;
        });
    }

    // =============================================================================
    // PUBLIC API METHODS
    // =============================================================================

    // Method for other modules to show notifications
    notify(options) {
        return this.showToast(options);
    }

    // Method to show alert-specific notifications
    alertTriggered(alertData) {
        return this.showAlertNotification(alertData);
    }

    // Method to clear all notifications
    clearAll() {
        this.notifications.forEach(notification => {
            this.removeToastElement(notification.id);
        });
        this.notifications = [];
    }

    // Method to get current notification permission status
    getPermissionStatus() {
        return {
            notifications: Notification.permission,
            pushSupported: 'PushManager' in window,
            serviceWorkerSupported: 'serviceWorker' in navigator,
            pushSubscribed: !!this.pushSubscription
        };
    }
}

// =============================================================================
// CSS ANIMATIONS (injected dynamically)
// =============================================================================

function injectNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes progress {
            from {
                width: 100%;
            }
            to {
                width: 0%;
            }
        }

        .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
        }

        .animate-progress {
            animation: progress linear;
        }

        #notification-container {
            pointer-events: none;
        }

        #notification-container > div {
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize styles
injectNotificationStyles();

// Global notification manager instance
let notificationManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationManager = new NotificationManager();
    });
} else {
    notificationManager = new NotificationManager();
}

// Export for use by other modules
window.notificationManager = notificationManager;