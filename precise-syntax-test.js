// More precise syntax testing
const fs = require('fs');

console.log('🔍 Precise syntax testing...');

try {
    const content = fs.readFileSync('./public/static/modules/settings.js', 'utf8');
    
    // Try to create a safe wrapper and evaluate
    const wrappedContent = `
    (function() {
        "use strict";
        
        // Mock environment
        const window = this;
        const document = {
            getElementById: () => ({ innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} } }),
            createElement: () => ({ 
                addEventListener: () => {},
                setAttribute: () => {},
                appendChild: () => {},
                style: {}
            }),
            addEventListener: () => {},
            querySelectorAll: () => [],
            body: { appendChild: () => {} }
        };
        const console = { log: ()=>{}, error: ()=>{}, warn: ()=>{} };
        const fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });
        const setTimeout = (fn) => fn();
        const setInterval = () => {};
        const clearInterval = () => {};
        
        // The actual settings code
        ${content}
        
        return { SettingsModule: typeof SettingsModule !== 'undefined' ? SettingsModule : null };
    })`;
    
    console.log('Attempting to evaluate wrapped content...');
    
    try {
        const fn = eval(wrappedContent);
        const result = fn();
        
        if (result.SettingsModule) {
            console.log('✅ SettingsModule loaded successfully');
            
            // Try to create an instance
            try {
                const settings = new result.SettingsModule();
                console.log('✅ SettingsModule instance created');
                
                // Test key methods
                const methods = ['getTradingTab', 'getSystemTab', 'getContent'];
                methods.forEach(method => {
                    if (typeof settings[method] === 'function') {
                        console.log(`✅ ${method} method exists`);
                    } else {
                        console.log(`❌ ${method} method missing`);
                    }
                });
                
            } catch (instanceError) {
                console.log('❌ Error creating instance:', instanceError.message);
            }
            
        } else {
            console.log('❌ SettingsModule not found in result');
        }
        
    } catch (evalError) {
        console.log('❌ Evaluation error:', evalError.message);
        console.log('Stack:', evalError.stack?.split('\\n').slice(0, 5).join('\\n'));
        
        // Try to identify problematic syntax by testing syntax only
        try {
            // Use Function constructor to test syntax without execution
            new Function(content);
            console.log('✅ Raw syntax is valid (Function constructor)');
        } catch (syntaxError) {
            console.log('❌ Raw syntax error:', syntaxError.message);
        }
    }
    
} catch (error) {
    console.error('❌ Failed to read file:', error.message);
}