// Test script to verify alerts functionality
// Run this in browser console after logging in

async function testAlertsModule() {
    console.log('🧪 Testing Alerts Module...');
    
    try {
        // Check if app is available
        if (!window.app) {
            throw new Error('App not found');
        }
        
        // Load alerts module
        console.log('📦 Loading alerts module...');
        await app.loadModule('alerts');
        
        // Check if alerts module is loaded
        if (!window.alertsModule) {
            throw new Error('Alerts module not loaded');
        }
        
        console.log('✅ Alerts module loaded successfully');
        
        // Check if buttons exist after module load
        setTimeout(() => {
            console.log('🔍 Checking for alert buttons...');
            
            const editButtons = document.querySelectorAll('[onclick*="editAlert"]');
            const templateButtons = document.querySelectorAll('[onclick*="useTemplate"]');
            const deleteButtons = document.querySelectorAll('[onclick*="deleteAlert"]');
            
            console.log('📝 Edit buttons found:', editButtons.length);
            console.log('📋 Template buttons found:', templateButtons.length);
            console.log('🗑️ Delete buttons found:', deleteButtons.length);
            
            // Test edit function availability
            if (typeof window.editAlert === 'function') {
                console.log('✅ editAlert function available');
            } else {
                console.log('❌ editAlert function NOT available');
            }
            
            if (typeof window.useTemplate === 'function') {
                console.log('✅ useTemplate function available');
            } else {
                console.log('❌ useTemplate function NOT available');
            }
            
            if (typeof window.deleteAlert === 'function') {
                console.log('✅ deleteAlert function available');
            } else {
                console.log('❌ deleteAlert function NOT available');
            }
            
            // Test button click if buttons exist
            if (editButtons.length > 0) {
                console.log('🖱️ Testing edit button click...');
                try {
                    // Test click event by parsing onclick
                    const onclickCode = editButtons[0].getAttribute('onclick');
                    console.log('Edit button onclick:', onclickCode);
                } catch (error) {
                    console.error('Error testing edit button:', error);
                }
            }
            
        }, 2000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export for console use
window.testAlertsModule = testAlertsModule;

console.log('🧪 Test script loaded. Run testAlertsModule() in console after logging in');