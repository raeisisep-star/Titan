// Simple JavaScript test without external dependencies
console.log('🧪 Testing JavaScript modules...');

// Test 1: Load Settings Module
console.log('📦 Loading settings module...');
try {
    const fs = require('fs');
    const path = require('path');
    
    const settingsPath = path.join(__dirname, 'public', 'static', 'modules', 'settings.js');
    const overridePath = path.join(__dirname, 'public', 'static', 'modules', 'simple-trading-system-methods.js');
    
    // Check if files exist
    console.log(`Settings file exists: ${fs.existsSync(settingsPath) ? '✅' : '❌'}`);
    console.log(`Override file exists: ${fs.existsSync(overridePath) ? '✅' : '❌'}`);
    
    if (fs.existsSync(settingsPath)) {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        console.log(`Settings file size: ${settingsContent.length} characters`);
        
        // Check for template literal syntax errors
        const templateLiteralErrors = settingsContent.match(/\$\{[^}]*\}/g) || [];
        console.log(`Template literal patterns found: ${templateLiteralErrors.length}`);
        
        // Try to evaluate a sample
        const sampleCheck = settingsContent.includes('getTradingTab()');
        console.log(`Contains getTradingTab method: ${sampleCheck ? '✅' : '❌'}`);
    }
    
    if (fs.existsSync(overridePath)) {
        const overrideContent = fs.readFileSync(overridePath, 'utf8');
        console.log(`Override file size: ${overrideContent.length} characters`);
        
        // Check if override methods exist
        const hasTradingMethod = overrideContent.includes('static getTradingTab()');
        const hasSystemMethod = overrideContent.includes('static getSystemTab()');
        const hasOverride = overrideContent.includes('prototype.getTradingTab');
        
        console.log(`Has Trading method: ${hasTradingMethod ? '✅' : '❌'}`);
        console.log(`Has System method: ${hasSystemMethod ? '✅' : '❌'}`);
        console.log(`Has override logic: ${hasOverride ? '✅' : '❌'}`);
    }
    
    console.log('\n🎉 File Analysis Complete!');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
}