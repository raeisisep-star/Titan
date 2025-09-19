#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";
const CHAT_ID = "104595348";

async function testTitanAPI() {
  try {
    console.log("🔐 ورود به سیستم تایتان...");
    
    // لاگین
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
    
    if (!loginData.success) {
      console.error("❌ خطا در لاگین:", loginData.error);
      return false;
    }
    
    const accessToken = loginData.session.accessToken;
    console.log("✅ لاگین موفق");
    
    // تست notification API
    console.log("\n📤 ارسال notification از API تایتان...");
    
    const notificationResponse = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: `🎯 تست API سیستم تایتان

✅ ورود موفق: ${loginData.session.user.username}
📱 Chat ID: ${CHAT_ID}
🚀 سیستم: فعال و آماده
⚡ API: عملیاتی

📊 حالا می‌تونید:
• Alert قیمت تنظیم کنید
• هشدار بازار دریافت کنید  
• نظارت Real-time داشته باشید

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`
      })
    });

    const notificationData = await notificationResponse.json();
    
    if (notificationResponse.ok) {
      console.log("✅ Notification از API تایتان موفق ارسال شد!");
      console.log("📊 نتایج:", JSON.stringify(notificationData, null, 2));
      
      // ایجاد یک alert تست
      console.log("\n📈 ایجاد Alert تست...");
      
      const alertResponse = await fetch(`${BASE_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: "تست هشدار طلا - سپهر",
          symbol: "XAUUSD",
          condition: "above",
          targetPrice: 2650,
          message: "قیمت طلا از $2650 گذشت! 🚀",
          isActive: true,
          channels: ['telegram']
        })
      });

      const alertData = await alertResponse.json();
      
      if (alertResponse.ok) {
        console.log("✅ Alert تست ایجاد شد!");
        console.log(`   نام: ${alertData.alert.name}`);
        console.log(`   نماد: ${alertData.alert.symbol}`);
        console.log(`   قیمت هدف: $${alertData.alert.targetPrice}`);
        console.log(`   ID: ${alertData.alert.id}`);
        
        return true;
      } else {
        console.error("❌ خطا در ایجاد Alert:", alertData.error);
        return false;
      }
      
    } else {
      console.error("❌ خطا در ارسال notification:", notificationData.error);
      return false;
    }
  } catch (error) {
    console.error("❌ خطای کلی:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 تست کامل API تایتان\n");
  console.log("========================");
  
  const success = await testTitanAPI();
  
  if (success) {
    console.log("\n🎉 تمام تست‌ها موفق بود!");
    console.log("📱 پیام‌ها را در تلگرام چک کنید");
    console.log("🌐 داشبورد: https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev");
  } else {
    console.log("\n❌ تست ناموفق بود");
  }
}

main();