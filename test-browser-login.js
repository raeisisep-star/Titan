// Simple browser automation using fetch
async function testSettingsInBrowser() {
    const url = 'https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev';
    
    console.log('🔐 Testing login...');
    
    // Test login
    const loginResponse = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'admin@titan.com',
            password: 'admin123'
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
        console.log('✅ Login successful');
        
        // Test settings.js loading
        console.log('📱 Testing settings.js...');
        const settingsResponse = await fetch(`${url}/static/modules/settings.js`);
        const settingsContent = await settingsResponse.text();
        
        console.log(`Settings.js size: ${settingsContent.length} characters`);
        
        // Check for syntax errors in settings content
        const lines = settingsContent.split('\n');
        const errors = [];
        
        lines.forEach((line, i) => {
            if (line.includes('${') && !line.includes('`')) {
                // Check if it's a real issue (not in comments)
                if (!line.trim().startsWith('//') && !line.includes('//')) {
                    errors.push(`Line ${i+1}: ${line.trim()}`);
                }
            }
        });
        
        if (errors.length > 0) {
            console.log('❌ Found template literal errors:');
            errors.slice(0, 5).forEach(error => console.log('  ', error));
        } else {
            console.log('✅ No template literal errors found');
        }
        
        // Try to evaluate the JavaScript
        try {
            // Create a safe environment
            const mockWindow = {
                SettingsModule: null,
                console: console,
                document: {
                    getElementById: () => ({ innerHTML: '' }),
                    createElement: () => ({ addEventListener: () => {} })
                }
            };
            
            // Use Function constructor to evaluate
            const func = new Function('window', 'document', 'console', settingsContent);
            func(mockWindow, mockWindow.document, console);
            
            if (mockWindow.SettingsModule) {
                console.log('✅ SettingsModule loaded successfully');
            } else {
                console.log('❌ SettingsModule not found after evaluation');
            }
        } catch (e) {
            console.log('❌ JavaScript evaluation error:', e.message);
            console.log('Error line info:', e.stack?.split('\n')[1] || 'Unknown');
        }
        
    } else {
        console.log('❌ Login failed:', loginData.message);
    }
}

// Run the test
testSettingsInBrowser().catch(console.error);