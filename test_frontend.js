// Test script to login and navigate to Settings > Exchanges
(async function() {
    console.log('🔄 Starting automated frontend test...');
    
    // Wait for page to load completely
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're on login page
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        console.log('📝 Found login form, attempting to login...');
        
        // Fill login credentials
        const usernameField = document.querySelector('input[name="username"], input[type="text"]');
        const passwordField = document.querySelector('input[name="password"], input[type="password"]');
        
        if (usernameField && passwordField) {
            usernameField.value = 'demo_user';
            passwordField.value = 'demo123';
            
            console.log('✅ Credentials filled, submitting form...');
            
            // Submit form
            loginForm.submit();
            
            // Wait for login to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log('❌ Could not find username/password fields');
        }
    } else {
        console.log('ℹ️ No login form found, might already be logged in');
    }
    
    // Try to navigate to Settings
    console.log('🔄 Attempting to navigate to Settings...');
    
    // Look for "More" menu or Settings link
    const moreButton = document.querySelector('[data-menu="more"]') || 
                      document.querySelector('button:contains("بیشتر")') ||
                      document.querySelector('.nav-more') ||
                      document.querySelector('#moreMenu');
                      
    if (moreButton) {
        console.log('✅ Found More menu button, clicking...');
        moreButton.click();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Look for Settings option
        const settingsLink = document.querySelector('[data-module="settings"]') ||
                            document.querySelector('a:contains("تنظیمات")') ||
                            document.querySelector('.settings-link');
                            
        if (settingsLink) {
            console.log('✅ Found Settings link, navigating...');
            settingsLink.click();
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Look for Exchange Management section
            const exchangeSection = document.querySelector('#exchanges-section') ||
                                   document.querySelector('[data-section="exchanges"]') ||
                                   document.querySelector('.exchange-management');
                                   
            if (exchangeSection) {
                console.log('✅ Successfully navigated to Exchange Management!');
                console.log('📊 Testing exchange buttons...');
                
                // Test each exchange
                const exchanges = ['binance', 'mexc', 'okx', 'coinbase', 'kucoin'];
                
                for (let exchange of exchanges) {
                    console.log(`🔄 Testing ${exchange} exchange...`);
                    
                    // Test connection button
                    const testBtn = document.querySelector(`#test-${exchange}`);
                    if (testBtn) {
                        console.log(`✅ Found test button for ${exchange}`);
                        testBtn.click();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        console.log(`❌ Test button not found for ${exchange}`);
                    }
                    
                    // Test balance button
                    const balanceBtn = document.querySelector(`#balance-${exchange}`);
                    if (balanceBtn) {
                        console.log(`✅ Found balance button for ${exchange}`);
                        balanceBtn.click();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        console.log(`❌ Balance button not found for ${exchange}`);
                    }
                }
                
            } else {
                console.log('❌ Exchange Management section not found');
            }
        } else {
            console.log('❌ Settings link not found in More menu');
        }
    } else {
        console.log('❌ More menu button not found');
        
        // Try direct module loading
        if (typeof window.moduleLoader !== 'undefined') {
            console.log('🔄 Trying direct module loading...');
            window.moduleLoader.loadModule('settings');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Settings module loaded directly');
        }
    }
    
    console.log('🏁 Frontend test completed');
})();