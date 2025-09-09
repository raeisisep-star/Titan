const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to all console messages and errors
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    console.log('STACK:', error.stack);
  });
  
  page.on('error', error => {
    console.log('BROWSER ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.log('FAILED REQUEST:', request.url(), request.failure()?.errorText);
  });
  
  console.log('🌐 Loading main page...');
  
  try {
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded');
    
    // Wait for login form and fill it
    await page.waitForSelector('#username', { timeout: 10000 });
    console.log('🔑 Login form found');
    
    await page.type('#username', 'admin@titan.com');
    await page.type('#password', 'admin123');
    
    console.log('📝 Credentials entered');
    
    // Submit login
    await page.click('button[type="submit"]');
    console.log('🚀 Login submitted');
    
    // Wait for main app
    await page.waitForSelector('#mainApp:not(.hidden)', { timeout: 15000 });
    console.log('✅ Main app loaded');
    
    // Wait a bit for modules to initialize
    await page.waitForTimeout(3000);
    
    // Try to find and click settings button
    const settingsButtons = await page.$$eval('button', buttons => {
      return buttons
        .map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || '',
          onclick: btn.getAttribute('onclick') || '',
          id: btn.id || ''
        }))
        .filter(btn => 
          btn.text.includes('تنظیمات') || 
          btn.onclick.includes('settings') ||
          btn.id.includes('settings')
        );
    });
    
    console.log('🔍 Found settings buttons:', settingsButtons);
    
    if (settingsButtons.length > 0) {
      console.log('📱 Clicking settings button...');
      
      // Click the settings button
      await page.evaluate((index) => {
        const buttons = document.querySelectorAll('button');
        buttons[index].click();
      }, settingsButtons[0].index);
      
      console.log('⚡ Settings button clicked');
      
      // Wait for settings to load
      await page.waitForTimeout(5000);
      
      // Check if settings loaded
      const settingsContent = await page.$('#settings-content');
      if (settingsContent) {
        console.log('✅ Settings content found');
      } else {
        console.log('❌ Settings content not found');
        
        // Check for loading indicator
        const loadingText = await page.evaluate(() => {
          return document.body.innerText.includes('در حال بارگذاری');
        });
        
        if (loadingText) {
          console.log('⏳ Settings still loading...');
        }
      }
      
    } else {
      console.log('❌ No settings button found');
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
  
  await browser.close();
})().catch(console.error);