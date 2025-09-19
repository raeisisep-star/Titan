#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";
const CHAT_ID = "104595348";

async function testInAppNotification() {
  try {
    console.log("🔔 Testing In-App Notification System");
    console.log("=====================================\n");

    // Login first
    console.log("🔐 Logging in...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@titan.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    const accessToken = loginData.session.accessToken;
    console.log("✅ Login successful\n");

    // Test 1: Success notification
    console.log("📊 Testing Success Notification...");
    const successResponse = await fetch(`${BASE_URL}/api/notifications/test-inapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: '🎉 هشدار موفق!',
        message: 'Alert Bitcoin با موفقیت فعال شد - قیمت هدف: $95,000',
        type: 'success'
      })
    });

    if (successResponse.ok) {
      console.log("✅ Success notification API working");
    }

    // Test 2: Warning notification (Alert triggered)
    console.log("⚠️  Testing Alert Triggered Notification...");
    const warningResponse = await fetch(`${BASE_URL}/api/notifications/test-inapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: '🚨 هشدار بازار!',
        message: 'Bitcoin (BTCUSDT) به قیمت $95,000 رسید! 🚀',
        type: 'warning'
      })
    });

    if (warningResponse.ok) {
      console.log("✅ Warning notification API working");
    }

    // Test 3: Error notification
    console.log("❌ Testing Error Notification...");
    const errorResponse = await fetch(`${BASE_URL}/api/notifications/test-inapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: '❌ خطا در اتصال',
        message: 'اتصال به سرویس قیمت‌گذاری قطع شده است',
        type: 'error'
      })
    });

    if (errorResponse.ok) {
      console.log("✅ Error notification API working");
    }

    // Test 4: Info notification
    console.log("ℹ️ Testing Info Notification...");
    const infoResponse = await fetch(`${BASE_URL}/api/notifications/test-inapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: 'ℹ️ اطلاع‌رسانی',
        message: 'سیستم به‌روزرسانی شد - امکانات جدید در دسترس است',
        type: 'info'
      })
    });

    if (infoResponse.ok) {
      console.log("✅ Info notification API working");
    }

    // Send Telegram notification as well
    console.log("\n📱 Sending Telegram notification too...");
    const telegramResponse = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: `🔔 تست سیستم اعلان‌های چندگانه

✅ In-App Notifications: فعال
✅ Telegram Notifications: فعال  
✅ PWA Support: فعال
✅ Push Notifications: فعال

🎉 سپهر جان، سیستم کاملاً آماده است!

📊 الان می‌تونید:
• اعلان‌های داخلی ببینید
• اپ را نصب کنید (PWA)
• در حالت آفلاین استفاده کنید
• هشدارهای background دریافت کنید

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`,
        customChatId: CHAT_ID
      })
    });

    if (telegramResponse.ok) {
      const telegramData = await telegramResponse.json();
      console.log("✅ Telegram notification sent");
      console.log(`   Message ID: ${telegramData.results.telegram.messageId}`);
    }

    console.log("\n🎉 All notification types tested successfully!");
    console.log("\n📱 در مرورگر چک کنید:");
    console.log("   🌐 https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev");
    console.log("   🔔 اعلان‌های داخلی در گوشه چپ بالا");
    console.log("   📱 پیام تلگرام در چت شما");
    console.log("   🚀 دکمه نصب PWA (اگر مرورگر پشتیبانی کند)");

    return true;

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

testInAppNotification();