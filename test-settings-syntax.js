// Test settings.js syntax in isolated environment
console.log('🔍 Testing settings.js syntax...');

try {
    // Load the settings file
    const fs = require('fs');
    const path = require('path');
    
    const settingsPath = path.join(__dirname, 'public', 'static', 'modules', 'settings.js');
    const settingsCode = fs.readFileSync(settingsPath, 'utf8');
    
    console.log('✅ File read successfully');
    console.log(`📊 File size: ${settingsCode.length} characters`);
    
    // Try to evaluate the code in a VM context
    const vm = require('vm');
    const context = {
        console: console,
        window: {},
        document: {
            getElementById: () => ({ innerHTML: '', style: {} }),
            createElement: () => ({ addEventListener: () => {} }),
            addEventListener: () => {},
            querySelectorAll: () => []
        },
        fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
        setTimeout: (fn, delay) => fn(),
        setInterval: () => {},
        clearInterval: () => {}
    };
    
    vm.createContext(context);
    
    console.log('🚀 Executing settings.js...');
    vm.runInContext(settingsCode, context);
    
    console.log('✅ Settings.js executed successfully!');
    
    // Test creating SettingsModule
    if (context.SettingsModule) {
        console.log('✅ SettingsModule class found');
        
        const settings = new context.SettingsModule();
        console.log('✅ SettingsModule instance created');
        
        // Test key methods
        if (typeof settings.getTradingTab === 'function') {
            console.log('✅ getTradingTab method exists');
        }
        
        if (typeof settings.getSystemTab === 'function') {
            console.log('✅ getSystemTab method exists');
        }
        
        if (typeof settings.getContent === 'function') {
            console.log('✅ getContent method exists');
            
            // Test getContent method
            try {
                const content = await settings.getContent();
                console.log('✅ getContent() executed successfully');
                console.log(`📏 Content length: ${content.length} characters`);
            } catch (e) {
                console.error('❌ getContent() failed:', e.message);
            }
        }
        
    } else {
        console.error('❌ SettingsModule class not found');
    }
    
} catch (error) {
    console.error('❌ Error testing settings.js:', error.message);
    console.error('Stack:', error.stack);
}