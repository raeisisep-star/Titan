#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";
const CHAT_ID = "104595348";

async function finalTest() {
  try {
    console.log("🔐 لاگین به تایتان...");
    
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
    
    // تست notification با Chat ID مستقیم
    console.log("\n📤 تست notification با Chat ID مستقیم...");
    
    const response = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: `🎉 تبریک! سیستم تایتان کامل راه‌اندازی شد

✅ API: عملیاتی
✅ Telegram Bot: فعال 
✅ Chat ID: ${CHAT_ID}
✅ Authentication: موفق

🚀 سپهر جان، الان می‌تونید:
• از داشبورد Alert تنظیم کنید
• هشدارهای قیمت دریافت کنید
• بازار رو Real-time نظارت کنید

📱 پیام‌ها به شماره +989384556010 ارسال می‌شن
⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`,
        customChatId: CHAT_ID
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ تست موفق!");
      console.log("📊 نتایج:", JSON.stringify(data, null, 2));
      
      // تست ایجاد Alert
      console.log("\n📈 ایجاد Alert نمونه...");
      
      const alertResponse = await fetch(`${BASE_URL}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: "هشدار طلا - سپهر",
          symbol: "XAUUSD", 
          condition: "above",
          targetPrice: 2650,
          message: "قیمت طلا از $2650 عبور کرد! 🚀",
          isActive: true,
          channels: ['telegram']
        })
      });

      const alertData = await alertResponse.json();
      
      if (alertResponse.ok) {
        console.log("✅ Alert ایجاد شد!");
        console.log(`   ID: ${alertData.alert.id}`);
        console.log(`   نام: ${alertData.alert.name}`);
        console.log(`   قیمت هدف: $${alertData.alert.targetPrice}`);
      } else {
        console.log("⚠️ Alert ایجاد نشد:", alertData.error);
      }
      
      return true;
    } else {
      console.error("❌ خطا در تست:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ خطا:", error.message);
    return false;
  }
}

async function main() {
  console.log("🎯 تست نهایی سیستم تایتان\n");
  console.log("============================");
  
  const success = await finalTest();
  
  if (success) {
    console.log("\n🎉 همه چی آماده است!");
    console.log("📱 پیام‌ها رو در تلگرام چک کنید");
    console.log("🌐 داشبورد: https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev/alerts");
    console.log("\n📊 برای استفاده:");
    console.log("   1. به داشبورد بروید");
    console.log("   2. بخش Alerts را باز کنید");
    console.log("   3. Alert جدید ایجاد کنید");
    console.log("   4. هشدارها را در تلگرام دریافت کنید!");
  } else {
    console.log("\n❌ مشکلی پیش اومده");
  }
}

main();