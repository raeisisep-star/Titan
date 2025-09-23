// تست مستقیم Settings Module
console.log('🔄 Testing direct settings module access...');

// Function to test settings module loading
function testSettingsModule() {
    console.log('1️⃣ Checking if titanApp exists...');
    
    if (typeof window.titanApp !== 'undefined') {
        console.log('✅ titanApp found');
        
        // Test loadModule method
        if (typeof window.titanApp.loadModule === 'function') {
            console.log('✅ loadModule method found');
            
            try {
                console.log('🔄 Attempting to load settings module...');
                window.titanApp.loadModule('settings');
                console.log('✅ Settings module load command executed');
                
                // Wait and check if settings UI loaded
                setTimeout(() => {
                    const settingsContainer = document.querySelector('.settings-container') || 
                                            document.querySelector('#settings-content') ||
                                            document.querySelector('[data-module="settings"]');
                    
                    if (settingsContainer) {
                        console.log('✅ Settings UI found in DOM');
                        
                        // Look for exchange management section
                        const exchangesSection = settingsContainer.querySelector('#exchanges-section') ||
                                               settingsContainer.querySelector('.exchange-management') ||
                                               settingsContainer.querySelector('[data-section="exchanges"]');
                        
                        if (exchangesSection) {
                            console.log('✅ Exchange Management section found');
                            testExchangeButtons();
                        } else {
                            console.log('❌ Exchange Management section not found');
                            console.log('Available sections:', settingsContainer.innerHTML.substring(0, 500));
                        }
                    } else {
                        console.log('❌ Settings UI not found in DOM');
                    }
                }, 3000);
                
            } catch (error) {
                console.error('❌ Error loading settings module:', error);
            }
        } else {
            console.log('❌ loadModule method not found');
        }
    } else {
        console.log('❌ titanApp not found');
        
        // Try alternative access methods
        if (typeof window.ModuleLoader !== 'undefined') {
            console.log('✅ ModuleLoader found, trying alternative approach...');
            const loader = new window.ModuleLoader();
            loader.loadModule('settings');
        } else {
            console.log('❌ No module loading mechanism found');
        }
    }
}

// Function to test exchange buttons
function testExchangeButtons() {
    console.log('🔄 Testing exchange buttons...');
    
    const exchanges = ['binance', 'mexc', 'okx', 'coinbase', 'kucoin'];
    
    exchanges.forEach(exchange => {
        console.log(`🔍 Testing ${exchange} buttons...`);
        
        // Test connection button
        const testBtn = document.querySelector(`#test-${exchange}`) ||
                       document.querySelector(`[data-action="test-${exchange}"]`) ||
                       document.querySelector(`.test-${exchange}`);
        
        if (testBtn) {
            console.log(`✅ Test button found for ${exchange}`);
            // Click test
            testBtn.click();
        } else {
            console.log(`❌ Test button NOT found for ${exchange}`);
        }
        
        // Test balance button
        const balanceBtn = document.querySelector(`#balance-${exchange}`) ||
                          document.querySelector(`[data-action="balance-${exchange}"]`) ||
                          document.querySelector(`.balance-${exchange}`);
        
        if (balanceBtn) {
            console.log(`✅ Balance button found for ${exchange}`);
        } else {
            console.log(`❌ Balance button NOT found for ${exchange}`);
        }
    });
}

// Run test after a short delay to ensure page is loaded
setTimeout(testSettingsModule, 2000);