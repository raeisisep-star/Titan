// Simple debug to test if we can access settings
console.log('🔍 Debug script loaded');

setTimeout(() => {
    console.log('🔍 Testing settings navigation...');
    
    // Test if switchMainView is available
    if (typeof switchMainView === 'function') {
        console.log('✅ switchMainView function found');
    } else {
        console.log('❌ switchMainView function not found');
    }
    
    // Test if we can access settings container
    const container = document.getElementById('settings-container');
    if (container) {
        console.log('✅ settings-container element found');
    } else {
        console.log('❌ settings-container element not found');
    }
    
}, 2000);