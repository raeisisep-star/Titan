// Test localStorage and settings initialization issue
async function testSettingsInit() {
    const baseUrl = 'https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev';
    
    // Create a test page that shows localStorage content and settings structure
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Settings Init Debug</title>
        <style>
            body { background: #1a1a1a; color: white; font-family: monospace; padding: 20px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #333; }
            pre { background: #333; padding: 10px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>Settings Initialization Debug</h1>
        
        <div class="section">
            <h3>1. LocalStorage Content</h3>
            <pre id="localStorage-content">Loading...</pre>
        </div>
        
        <div class="section">
            <h3>2. Default Settings Structure</h3>
            <pre id="default-settings">Loading...</pre>
        </div>
        
        <div class="section">
            <h3>3. Final Settings After Load</h3>
            <pre id="final-settings">Loading...</pre>
        </div>
        
        <div class="section">
            <h3>4. Test Access</h3>
            <pre id="test-access">Loading...</pre>
        </div>
        
        <script>
            function log(elementId, content) {
                document.getElementById(elementId).textContent = content;
            }
            
            // Check localStorage
            const savedSettings = localStorage.getItem('titan_settings');
            log('localStorage-content', savedSettings ? JSON.stringify(JSON.parse(savedSettings), null, 2) : 'No saved settings');
            
            // Load settings.js and test
            const script = document.createElement('script');
            script.src = '/static/modules/settings.js?v=' + Date.now();
            
            script.onload = function() {
                setTimeout(() => {
                    try {
                        const settings = new SettingsModule();
                        
                        // Show default settings structure
                        log('default-settings', JSON.stringify(settings.settings.trading, null, 2));
                        
                        // Initialize settings (this calls loadSettings)
                        settings.initialize().then(() => {
                            // Show final settings after load
                            log('final-settings', JSON.stringify(settings.settings.trading, null, 2));
                            
                            // Test specific property access
                            let testResults = [];
                            
                            try {
                                const val1 = settings.settings.trading.risk_management.max_risk_per_trade;
                                testResults.push('✅ risk_management.max_risk_per_trade: ' + val1);
                            } catch (e) {
                                testResults.push('❌ risk_management.max_risk_per_trade: ' + e.message);
                            }
                            
                            try {
                                const val2 = settings.settings.trading.advanced_rules.global_rules.min_volume_24h;
                                testResults.push('✅ advanced_rules.global_rules.min_volume_24h: ' + val2);
                            } catch (e) {
                                testResults.push('❌ advanced_rules.global_rules.min_volume_24h: ' + e.message);
                            }
                            
                            try {
                                const val3 = Math.round(settings.settings.trading.auto_trading.min_confidence * 100);
                                testResults.push('✅ Math.round(auto_trading.min_confidence * 100): ' + val3);
                            } catch (e) {
                                testResults.push('❌ Math.round(auto_trading.min_confidence * 100): ' + e.message);
                            }
                            
                            log('test-access', testResults.join('\\n'));
                            
                        }).catch(e => {
                            log('final-settings', 'Initialize error: ' + e.message);
                            log('test-access', 'Initialize failed: ' + e.message);
                        });
                        
                    } catch (error) {
                        log('default-settings', 'Error creating SettingsModule: ' + error.message);
                        log('final-settings', 'Error: ' + error.message);
                        log('test-access', 'Error: ' + error.message);
                    }
                }, 500);
            };
            
            document.head.appendChild(script);
        </script>
    </body>
    </html>`;
    
    const fs = require('fs');
    fs.writeFileSync('./settings-debug.html', testHtml);
    console.log('💾 Settings debug file created: settings-debug.html');
    console.log('🔗 Access at:', baseUrl + '/static/settings-debug.html');
}

testSettingsInit().catch(console.error);