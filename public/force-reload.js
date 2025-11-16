/**
 * Force Reload Script - برای پاک کردن کامل cache
 * 
 * استفاده:
 * 1. F12 را بزنید (DevTools)
 * 2. به تب Console بروید
 * 3. این کد را copy/paste کنید و Enter بزنید
 */

(async function forceReload() {
    console.log('🗑️ Starting force reload...');
    
    // 1. Unregister Service Workers
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            await registration.unregister();
            console.log('✅ Service Worker unregistered');
        }
    }
    
    // 2. Clear Cache Storage
    if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
        console.log('✅ Cache Storage cleared:', names.length, 'caches');
    }
    
    // 3. Clear Local Storage
    localStorage.clear();
    console.log('✅ Local Storage cleared');
    
    // 4. Clear Session Storage
    sessionStorage.clear();
    console.log('✅ Session Storage cleared');
    
    // 5. Clear IndexedDB
    if ('indexedDB' in window && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
            indexedDB.deleteDatabase(db.name);
        }
        console.log('✅ IndexedDB cleared:', dbs.length, 'databases');
    }
    
    console.log('✅ All caches cleared!');
    console.log('🔄 Reloading in 2 seconds...');
    
    // Hard reload after 2 seconds
    setTimeout(() => {
        window.location.href = window.location.href + '?nocache=' + Date.now();
    }, 2000);
})();
