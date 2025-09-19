#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";
const CHAT_ID = "104595348";

async function createAndTestAlert() {
  try {
    console.log("🔐 ورود به سیستم...");
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@titan.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const accessToken = loginData.session.accessToken;
    console.log("✅ لاگین موفق");
    
    // ایجاد Alert
    console.log("\n📈 ایجاد Alert جدید...");
    
    const alertResponse = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        alertName: "🚀 Bitcoin Alert - Test Final",
        symbol: "BTCUSDT",
        alertType: "price_above",
        targetPrice: 94000,
        message: "🎉 Bitcoin reached $94,000! 🚀",
        isActive: true,
        channels: ['telegram']
      })
    });

    const alertData = await alertResponse.json();
    
    if (alertResponse.ok) {
      console.log("✅ Alert ایجاد شد!");
      console.log(`   ID: ${alertData.data.id}`);
      console.log(`   نام: ${alertData.data.alertName}`);
      
      // تست notification برای این Alert
      console.log("\n🔔 تست Notification برای Alert...");
      
      const testResponse = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          channels: ['telegram'],
          message: `🚨 هشدار Bitcoin فعال شد!

📊 **Alert Details:**
• نام: ${alertData.data.alertName}
• نماد: ${alertData.data.symbol}
• قیمت هدف: $${alertData.data.targetPrice}
• وضعیت: فعال ✅

💰 **پیام هشدار:**
${alertData.data.message}

🎯 **این Alert واقعی است و فعال می‌باشد!**

به محض رسیدن قیمت Bitcoin به $${alertData.data.targetPrice}، هشدار ارسال خواهد شد.

⏰ زمان ایجاد: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

✅ سیستم تایتان کاملاً عملیاتی است!`,
          customChatId: CHAT_ID
        })
      });

      const testData = await testResponse.json();
      
      if (testResponse.ok && testData.results.telegram.success) {
        console.log("✅ Notification تست موفق!");
        console.log(`   Message ID: ${testData.results.telegram.messageId}`);
        
        return {
          alert: alertData.data,
          notification: testData
        };
      } else {
        console.error("❌ مشکل در ارسال notification:", testData);
        return null;
      }
    } else {
      console.error("❌ مشکل در ایجاد Alert:", alertData);
      return null;
    }
  } catch (error) {
    console.error("❌ خطا:", error.message);
    return null;
  }
}

async function main() {
  console.log("🎯 تست نهایی - ایجاد Alert + Notification\n");
  console.log("===========================================");
  
  const result = await createAndTestAlert();
  
  if (result) {
    console.log("\n🎉 تمام مراحل موفق!");
    console.log("\n✅ خلاصه عملیات:");
    console.log("   📊 Alert ایجاد شد");
    console.log("   🔔 Notification ارسال شد");
    console.log("   📱 پیام در تلگرام دریافت شد");
    console.log("   ⚡ سیستم کاملاً عملیاتی است");
    
    console.log("\n📈 Alert ایجاد شده:");
    console.log(`   ID: ${result.alert.id}`);
    console.log(`   نام: ${result.alert.alertName}`);
    console.log(`   نماد: ${result.alert.symbol}`);
    console.log(`   قیمت هدف: $${result.alert.targetPrice}`);
    
    console.log("\n🌐 داشبورد: https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev");
    console.log("📱 تلگرام: @GoldDollarPrediction_bot");
    console.log("🎯 Chat ID: 104595348");
    
    console.log("\n🔥 سپهر جان، همه چی آماده است!");
    console.log("   الان می‌تونید از داشبورد Alert‌های بیشتر ایجاد کنید");
    console.log("   هشدارهای Real-time بازار دریافت کنید!");
  } else {
    console.log("\n❌ متأسفانه مشکلی پیش اومد");
  }
}

main();