const puppeteer = require('puppeteer');

async function testSettingsTabs() {
    console.log('🚀 Starting settings tabs test...');
    
    let browser;
    let page;
    
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        page = await browser.newPage();
        
        // Listen for console messages including errors
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error') {
                console.log(`❌ Browser Console Error: ${text}`);
            } else if (type === 'warn') {
                console.log(`⚠️ Browser Console Warning: ${text}`);
            } else if (text.includes('✅') || text.includes('🔄') || text.includes('📦')) {
                console.log(`📱 Browser: ${text}`);
            }
        });
        
        // Listen for page errors
        page.on('pageerror', error => {
            console.log(`❌ Page Error: ${error.message}`);
        });
        
        console.log('🌐 Navigating to AI test page...');
        await page.goto('http://localhost:3000/ai-test', {
            waitUntil: 'networkidle0',
            timeout: 10000
        });
        
        console.log('🔄 Switching to Settings view...');
        await page.evaluate(() => {
            switchMainView('settings');
        });
        
        // Wait for settings to load
        await page.waitForTimeout(3000);
        
        console.log('🧪 Testing Settings Module Load...');
        
        // Check if SettingsModule exists
        const settingsModuleExists = await page.evaluate(() => {
            return !!(window.TitanModules && window.TitanModules.SettingsModule);
        });
        
        console.log(`Settings Module exists: ${settingsModuleExists ? '✅' : '❌'}`);
        
        // Check if global instance exists
        const globalInstanceExists = await page.evaluate(() => {
            return !!(window.settingsModule);
        });
        
        console.log(`Global Settings Instance exists: ${globalInstanceExists ? '✅' : '❌'}`);
        
        // Test if Trading tab method is accessible
        const tradingMethodExists = await page.evaluate(() => {
            try {
                return !!(window.settingsModule && typeof window.settingsModule.getTradingTab === 'function');
            } catch (e) {
                return false;
            }
        });
        
        console.log(`Trading Tab Method exists: ${tradingMethodExists ? '✅' : '❌'}`);
        
        // Test if System tab method is accessible
        const systemMethodExists = await page.evaluate(() => {
            try {
                return !!(window.settingsModule && typeof window.settingsModule.getSystemTab === 'function');
            } catch (e) {
                return false;
            }
        });
        
        console.log(`System Tab Method exists: ${systemMethodExists ? '✅' : '❌'}`);
        
        // Test calling Trading tab method
        console.log('🧪 Testing Trading Tab Generation...');
        try {
            const tradingTabResult = await page.evaluate(() => {
                try {
                    if (window.settingsModule && window.settingsModule.getTradingTab) {
                        const result = window.settingsModule.getTradingTab();
                        return {
                            success: true,
                            hasContent: result && result.length > 0,
                            contentLength: result ? result.length : 0,
                            preview: result ? result.substring(0, 100) + '...' : ''
                        };
                    } else {
                        return { success: false, error: 'Method not available' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            if (tradingTabResult.success) {
                console.log(`✅ Trading Tab Generation: SUCCESS`);
                console.log(`   Content Length: ${tradingTabResult.contentLength} characters`);
                console.log(`   Preview: ${tradingTabResult.preview}`);
            } else {
                console.log(`❌ Trading Tab Generation: FAILED - ${tradingTabResult.error}`);
            }
        } catch (error) {
            console.log(`❌ Trading Tab Test Error: ${error.message}`);
        }
        
        // Test calling System tab method
        console.log('🧪 Testing System Tab Generation...');
        try {
            const systemTabResult = await page.evaluate(() => {
                try {
                    if (window.settingsModule && window.settingsModule.getSystemTab) {
                        const result = window.settingsModule.getSystemTab();
                        return {
                            success: true,
                            hasContent: result && result.length > 0,
                            contentLength: result ? result.length : 0,
                            preview: result ? result.substring(0, 100) + '...' : ''
                        };
                    } else {
                        return { success: false, error: 'Method not available' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            if (systemTabResult.success) {
                console.log(`✅ System Tab Generation: SUCCESS`);
                console.log(`   Content Length: ${systemTabResult.contentLength} characters`);
                console.log(`   Preview: ${systemTabResult.preview}`);
            } else {
                console.log(`❌ System Tab Generation: FAILED - ${systemTabResult.error}`);
            }
        } catch (error) {
            console.log(`❌ System Tab Test Error: ${error.message}`);
        }
        
        // Test tab switching simulation
        console.log('🧪 Testing Tab Switching Functionality...');
        try {
            const tabSwitchResult = await page.evaluate(() => {
                try {
                    if (window.settingsModule && window.settingsModule.showTab) {
                        // Try switching to Trading tab
                        window.settingsModule.showTab('trading');
                        
                        // Check if tab content was updated
                        const tabContent = document.querySelector('#settings-content');
                        const hasTabContent = tabContent && tabContent.innerHTML.length > 0;
                        
                        return {
                            success: true,
                            contentUpdated: hasTabContent,
                            contentLength: tabContent ? tabContent.innerHTML.length : 0
                        };
                    } else {
                        return { success: false, error: 'showTab method not available' };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            if (tabSwitchResult.success) {
                console.log(`✅ Tab Switching: SUCCESS`);
                console.log(`   Content Updated: ${tabSwitchResult.contentUpdated ? 'YES' : 'NO'}`);
                console.log(`   Content Length: ${tabSwitchResult.contentLength} characters`);
            } else {
                console.log(`❌ Tab Switching: FAILED - ${tabSwitchResult.error}`);
            }
        } catch (error) {
            console.log(`❌ Tab Switching Test Error: ${error.message}`);
        }
        
        // Check for any JavaScript errors
        const jsErrors = await page.evaluate(() => {
            return window.jsErrors || [];
        });
        
        if (jsErrors.length > 0) {
            console.log(`⚠️ JavaScript Errors Found: ${jsErrors.length}`);
            jsErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        } else {
            console.log(`✅ No JavaScript Errors Detected`);
        }
        
        console.log('\n🎉 Settings Tabs Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

testSettingsTabs();