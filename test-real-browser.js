// Test in real browser environment via fetch
async function testInRealBrowser() {
    const baseUrl = 'https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev';
    
    console.log('🌐 Testing in real browser environment...');
    
    // 1. Login first
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin@titan.com',
            password: 'admin123'
        })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
        console.log('❌ Login failed');
        return;
    }
    
    console.log('✅ Login successful');
    
    // 2. Test settings.js file directly
    const settingsResponse = await fetch(`${baseUrl}/static/modules/settings.js?v=${Date.now()}`);
    const settingsText = await settingsResponse.text();
    
    console.log(`📂 Settings.js loaded: ${settingsText.length} characters`);
    
    // 3. Test in browser-like environment
    const browserTestHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Direct Settings Test</title>
        <style>
            body { background: #1a1a1a; color: white; font-family: Arial; padding: 20px; }
            .log { margin: 5px 0; }
            .error { color: #ff6b6b; }
            .success { color: #51cf66; }
        </style>
    </head>
    <body>
        <h1>Direct Settings.js Test</h1>
        <div id="log"></div>
        
        <script>
            function log(msg, type = 'log') {
                const div = document.createElement('div');
                div.className = 'log ' + type;
                div.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
                document.getElementById('log').appendChild(div);
                console.log(msg);
            }
            
            // Comprehensive error handling
            window.onerror = function(message, source, lineno, colno, error) {
                log('❌ JavaScript Error: ' + message + ' (Line: ' + lineno + ', Col: ' + colno + ')', 'error');
                if (error && error.stack) {
                    log('Stack: ' + error.stack, 'error');
                }
                return true;
            };
            
            window.addEventListener('unhandledrejection', function(event) {
                log('❌ Unhandled Promise Rejection: ' + event.reason, 'error');
            });
            
            log('🚀 Starting comprehensive settings test...');
            
            // Load settings.js
            const script = document.createElement('script');
            script.src = '/static/modules/settings.js?v=' + Date.now();
            
            script.onload = function() {
                log('✅ settings.js loaded successfully', 'success');
                
                // Wait a bit for execution
                setTimeout(() => {
                    try {
                        if (typeof SettingsModule !== 'undefined') {
                            log('✅ SettingsModule class found', 'success');
                            
                            const settings = new SettingsModule();
                            log('✅ SettingsModule instance created', 'success');
                            
                            // Test key methods
                            ['getTradingTab', 'getSystemTab', 'getContent', 'switchTab'].forEach(method => {
                                if (typeof settings[method] === 'function') {
                                    log('✅ ' + method + ' method exists', 'success');
                                } else {
                                    log('❌ ' + method + ' method missing', 'error');
                                }
                            });
                            
                            // Try to call getTradingTab
                            try {
                                const tradingContent = settings.getTradingTab();
                                log('✅ getTradingTab() executed: ' + tradingContent.length + ' chars', 'success');
                            } catch (e) {
                                log('❌ getTradingTab() failed: ' + e.message, 'error');
                            }
                            
                            // Try to call getSystemTab
                            try {
                                const systemContent = settings.getSystemTab();
                                log('✅ getSystemTab() executed: ' + systemContent.length + ' chars', 'success');
                            } catch (e) {
                                log('❌ getSystemTab() failed: ' + e.message, 'error');
                            }
                            
                        } else if (window.TitanModules && window.TitanModules.SettingsModule) {
                            log('✅ SettingsModule found in TitanModules', 'success');
                        } else {
                            log('❌ SettingsModule not found anywhere', 'error');
                        }
                        
                    } catch (error) {
                        log('❌ Error in test: ' + error.message, 'error');
                        log('Stack: ' + error.stack, 'error');
                    }
                }, 1000);
            };
            
            script.onerror = function(e) {
                log('❌ Failed to load settings.js: ' + e, 'error');
            };
            
            document.head.appendChild(script);
        </script>
    </body>
    </html>
    `;
    
    console.log('📝 Browser test HTML created, opening in browser...');
    console.log('🔗 Browser URL:', baseUrl);
    console.log('📄 You need to manually paste this HTML into browser or save as file');
    
    // Save the test file
    const fs = require('fs');
    fs.writeFileSync('./browser-settings-test.html', browserTestHtml);
    console.log('💾 Test file saved as: browser-settings-test.html');
}

testInRealBrowser().catch(console.error);