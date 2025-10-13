// TITAN Trading System - Service Worker
// PWA Support + Background Notifications + Offline Caching

const CACHE_NAME = 'titan-trading-v1.0.0';
const DYNAMIC_CACHE_NAME = 'titan-dynamic-v1.0.0';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/manifest.json',
  '/static/app.js',
  '/static/styles.css',
  '/static/modules/alerts.js',
  '/static/modules/system-status.js',
  '/static/modules/settings-status-integration.js',
  '/static/modules/status-widgets.js',
  // CDN assets (cached dynamically)
  'https://cdn.tailwindcss.com/3.4.0',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css',
  'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js'
];

// API endpoints for dynamic caching
const API_ENDPOINTS = [
  '/api/health',
  '/api/dashboard/overview',
  '/api/alerts/dashboard',
  '/api/markets',
  '/api/portfolio/list'
];

// =============================================================================
// SERVICE WORKER INSTALLATION
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// =============================================================================
// SERVICE WORKER ACTIVATION
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// =============================================================================
// FETCH HANDLING (Network + Cache Strategy)
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests: Network First strategy
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/static/') || url.pathname === '/') {
    // Static assets: Cache First strategy  
    event.respondWith(handleStaticRequest(request));
  } else if (url.origin !== location.origin) {
    // External requests (CDN): Cache First strategy
    event.respondWith(handleExternalRequest(request));
  } else {
    // Default: Network First strategy
    event.respondWith(handleDefaultRequest(request));
  }
});

// Network First Strategy (for API calls)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses for offline use
    if (networkResponse.ok && API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🌐 Service Worker: Network failed, trying cache for:', request.url);
    
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for critical API calls
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'شبکه در دسترس نیست - حالت آفلاین',
        offline: true,
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Cache First Strategy (for static assets)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Cache First Strategy (for external CDN resources)
async function handleExternalRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('🌐 Service Worker: External resource failed:', request.url);
    throw error;
  }
}

// Network First Strategy (default)
async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// =============================================================================
// PUSH NOTIFICATIONS HANDLING
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('📨 Service Worker: Push notification received');
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to parse push data:', error);
    notificationData = {
      title: '🚀 تایتان - هشدار بازار',
      body: 'یک هشدار جدید دریافت شده است',
      icon: '/static/icons/icon-192x192.png'
    };
  }
  
  const title = notificationData.title || '🚀 تایتان - هشدار بازار';
  const options = {
    body: notificationData.body || 'یک هشدار جدید دریافت شده است',
    icon: notificationData.icon || '/static/icons/icon-192x192.png',
    badge: '/static/icons/icon-72x72.png',
    tag: notificationData.tag || 'titan-alert',
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: {
      url: notificationData.url || '/',
      alertId: notificationData.alertId,
      timestamp: new Date().toISOString(),
      ...notificationData
    },
    actions: [
      {
        action: 'open',
        title: '🔍 مشاهده',
        icon: '/static/icons/icon-72x72.png'
      },
      {
        action: 'dismiss', 
        title: '❌ بستن',
        icon: '/static/icons/icon-72x72.png'
      }
    ],
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    dir: 'rtl',
    lang: 'fa'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Service Worker: Notification displayed successfully');
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to show notification:', error);
      })
  );
});

// =============================================================================
// NOTIFICATION CLICK HANDLING
// =============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return; // Just close the notification
  }
  
  // Handle click actions
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navigate to the alert or focus existing window
            if (event.action === 'open' || !event.action) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                data: event.notification.data,
                action: event.action
              });
              return client.focus();
            }
          }
        }
        
        // Open new window if app is not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to handle notification click:', error);
      })
  );
});

// =============================================================================
// BACKGROUND SYNC (for offline actions)
// =============================================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-alerts-sync') {
    event.waitUntil(syncAlerts());
  } else if (event.tag === 'background-portfolio-sync') {
    event.waitUntil(syncPortfolio());
  }
});

async function syncAlerts() {
  try {
    console.log('📊 Service Worker: Syncing alerts in background...');
    
    const response = await fetch('/api/alerts/dashboard');
    if (response.ok) {
      const data = await response.json();
      
      // Cache the updated data
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/alerts/dashboard', response);
      
      console.log('✅ Service Worker: Alerts synced successfully');
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync alerts:', error);
  }
}

async function syncPortfolio() {
  try {
    console.log('💰 Service Worker: Syncing portfolio in background...');
    
    const response = await fetch('/api/portfolio/list');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/portfolio/list', response);
      
      console.log('✅ Service Worker: Portfolio synced successfully');
    }
  } catch (error) {
    console.error('❌ Service Worker: Failed to sync portfolio:', error);
  }
}

// =============================================================================
// MESSAGE HANDLING (from main thread)
// =============================================================================

self.addEventListener('message', (event) => {
  console.log('📩 Service Worker: Message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;
      
    case 'CACHE_ALERT_DATA':
      cacheAlertData(data);
      break;
      
    case 'SHOW_NOTIFICATION':
      showLocalNotification(data);
      break;
      
    case 'CLEAR_CACHE':
      clearCache();
      break;
      
    default:
      console.log('🤷 Service Worker: Unknown message type:', type);
  }
});

async function cacheAlertData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data));
    await cache.put('/api/alerts/cached-data', response);
    console.log('✅ Service Worker: Alert data cached');
  } catch (error) {
    console.error('❌ Service Worker: Failed to cache alert data:', error);
  }
}

async function showLocalNotification(data) {
  try {
    await self.registration.showNotification(data.title || '🚀 تایتان', {
      body: data.body,
      icon: '/static/icons/icon-192x192.png',
      badge: '/static/icons/icon-72x72.png',
      tag: data.tag || 'local-notification',
      data: data,
      requireInteraction: true,
      actions: [
        { action: 'open', title: '🔍 مشاهده' },
        { action: 'dismiss', title: '❌ بستن' }
      ]
    });
    console.log('✅ Service Worker: Local notification shown');
  } catch (error) {
    console.error('❌ Service Worker: Failed to show local notification:', error);
  }
}

async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ Service Worker: All caches cleared');
  } catch (error) {
    console.error('❌ Service Worker: Failed to clear cache:', error);
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

self.addEventListener('error', (event) => {
  console.error('❌ Service Worker: Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker: Unhandled rejection:', event.reason);
});

console.log('🚀 TITAN Trading System - Service Worker Loaded Successfully');
console.log('📱 PWA Features: ✅ Offline Support, ✅ Push Notifications, ✅ Background Sync');