#!/usr/bin/env node

const BOT_TOKEN = "7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA";
const CHAT_ID = "104595348";

async function testDirectNotification() {
  const message = `🔔 تست مستقیم Notification Service

این پیام برای بررسی عملکرد سیستم notification ارسال شده است.

✅ Bot Token: فعال
✅ Chat ID: ${CHAT_ID}
✅ API: عملیاتی

📊 اطلاعات Alert:
• نام: هشدار Bitcoin - سپهر  
• نماد: BTCUSDT
• قیمت هدف: $95,000
• وضعیت: فعال ✅

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

🎯 اگر این پیام را دریافت کردید، یعنی سیستم کار می‌کند!`;

  try {
    console.log("📤 ارسال تست مستقیم...");
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log("✅ تست مستقیم موفق!");
      console.log(`   Message ID: ${data.result.message_id}`);
      return true;
    } else {
      console.error("❌ تست مستقیم ناموفق:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ خطا در تست مستقیم:", error.message);
    return false;
  }
}

async function testTitanAPI() {
  try {
    console.log("\n🔐 تست API تایتان...");
    
    const loginResponse = await fetch("http://127.0.0.1:3000/api/auth/login", {
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
    
    const notificationResponse = await fetch("http://127.0.0.1:3000/api/alerts/test-notification", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: `🔔 تست از API تایتان

این پیام از طریق API داخلی تایتان ارسال شده است.

📊 مراحل تست:
✅ Authentication
✅ API Call
✅ Notification Service
✅ Telegram Integration

⚙️ Environment Variables:
• TELEGRAM_BOT_TOKEN: موجود
• TELEGRAM_CHAT_ID: ${CHAT_ID}
• ENABLE_TELEGRAM: true

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

🎯 این تست نشان می‌دهد API تایتان کار می‌کند!`,
        customChatId: CHAT_ID
      })
    });

    const notificationData = await notificationResponse.json();
    
    console.log("📊 نتیجه API:", JSON.stringify(notificationData, null, 2));
    
    if (notificationResponse.ok) {
      console.log("✅ API تایتان Response موفق");
      return notificationData;
    } else {
      console.error("❌ API تایتان ناموفق");
      return null;
    }
  } catch (error) {
    console.error("❌ خطا در API تایتان:", error.message);
    return null;
  }
}

async function main() {
  console.log("🧪 تست جامع Notification System\n");
  console.log("==================================");
  
  // تست ۱: مستقیم از Telegram API
  const directTest = await testDirectNotification();
  
  if (directTest) {
    console.log("✅ تست مستقیم موفق - پیام در تلگرام چک کنید");
  } else {
    console.log("❌ تست مستقیم ناموفق");
    return;
  }
  
  // تست ۲: از طریق API تایتان
  const apiTest = await testTitanAPI();
  
  if (apiTest) {
    console.log("✅ تست API نیز موفق");
  } else {
    console.log("❌ مشکل در API تایتان");
  }
  
  console.log("\n📱 نتیجه:");
  console.log("   🔍 دو پیام تست ارسال شد");
  console.log("   📊 یکی مستقیم، یکی از API");
  console.log("   💬 در تلگرام چک کنید");
}

main();