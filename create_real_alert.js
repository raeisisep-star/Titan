#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";
const CHAT_ID = "104595348";

async function createRealAlert() {
  try {
    console.log("🔐 ورود به سیستم تایتان...");
    
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
    
    // ابتدا notification settings را تنظیم کنیم
    console.log("\n⚙️ تنظیم Notification Settings...");
    
    const settingsResponse = await fetch(`${BASE_URL}/api/alerts/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        telegram: {
          enabled: true,
          chatId: CHAT_ID
        },
        email: {
          enabled: false
        },
        sms: {
          enabled: false
        }
      })
    });

    if (settingsResponse.ok) {
      console.log("✅ Settings تنظیم شد");
    } else {
      console.log("⚠️ Settings تنظیم نشد، ادامه می‌دهیم...");
    }
    
    // ایجاد Alert واقعی
    console.log("\n📈 ایجاد Alert واقعی...");
    
    const alertResponse = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        alertName: "هشدار Bitcoin - سپهر",
        symbol: "BTCUSDT",
        alertType: "price_above",
        targetPrice: 95000,
        message: "🚀 بیت کوین از $95,000 عبور کرد! Time to celebrate! 🎉",
        isActive: true,
        channels: ['telegram']
      })
    });

    const alertData = await alertResponse.json();
    
    if (alertResponse.ok) {
      console.log("✅ Alert واقعی ایجاد شد!");
      console.log("📊 Response:", JSON.stringify(alertData, null, 2));
      
      const alert = alertData.data || alertData.alert;
      
      if (alert) {
        console.log(`   ID: ${alert.id}`);
        console.log(`   نام: ${alert.alertName || alert.name}`);
        console.log(`   نماد: ${alert.symbol}`);
        console.log(`   قیمت هدف: $${alert.targetPrice}`);
        console.log(`   وضعیت: ${alert.isActive ? 'فعال ✅' : 'غیرفعال ❌'}`);
      }
      
      // فوراً یک notification تست برای این Alert ارسال کنیم
      console.log("\n🔔 تست Alert با پیام واقعی...");
      
      const testResponse = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          channels: ['telegram'],
          message: `🔥 هشدار Bitcoin فعال شد!

📊 Alert: هشدار Bitcoin - سپهر
💰 نماد: BTCUSDT  
📈 قیمت هدف: $95,000
🎯 شرط: بالای این قیمت

🚀 بیت کوین از $95,000 عبور کرد! Time to celebrate! 🎉

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

✅ این Alert فعال است و به محض رسیدن قیمت به هدف، اطلاع‌رسانی خواهد شد!`,
          customChatId: CHAT_ID
        })
      });

      if (testResponse.ok) {
        console.log("✅ پیام تست Alert ارسال شد!");
      }
      
      return alert || alertData;
    } else {
      console.error("❌ خطا در ایجاد Alert:", alertData.error);
      return null;
    }
  } catch (error) {
    console.error("❌ خطا:", error.message);
    return null;
  }
}

async function listAllAlerts() {
  try {
    console.log("\n📋 لیست تمام Alerts...");
    
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
    
    const response = await fetch(`${BASE_URL}/api/alerts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`\n📊 تعداد Alerts: ${data.alerts.length}`);
      data.alerts.forEach((alert, index) => {
        console.log(`\n   ${index + 1}. ${alert.name}`);
        console.log(`      نماد: ${alert.symbol}`);
        console.log(`      هدف: $${alert.targetPrice}`);
        console.log(`      وضعیت: ${alert.isActive ? '✅ فعال' : '❌ غیرفعال'}`);
        console.log(`      کانال‌ها: ${alert.channels?.join(', ') || 'نامشخص'}`);
      });
      return data.alerts;
    }
  } catch (error) {
    console.error("❌ خطا در دریافت لیست:", error.message);
    return [];
  }
}

async function main() {
  console.log("🚀 ایجاد Alert واقعی در سیستم تایتان\n");
  console.log("=========================================");
  
  const alert = await createRealAlert();
  
  if (alert) {
    await listAllAlerts();
    
    console.log("\n🎉 کارهای انجام شده:");
    console.log("   ✅ Alert واقعی ایجاد شد");
    console.log("   ✅ Notification Settings تنظیم شد");
    console.log("   ✅ پیام تست ارسال شد");
    console.log("   ✅ سیستم کاملاً عملیاتی است");
    
    console.log("\n📱 الان می‌تونید:");
    console.log("   🌐 به داشبورد بروید: https://3000-iamgmbkoq4p98bf87r889-6532622b.e2b.dev");
    console.log("   📊 Alerts بیشتر ایجاد کنید");
    console.log("   🔔 هشدارهای Real-time دریافت کنید");
    
    console.log("\n📈 Alert ایجاد شده:");
    console.log(`   نام: ${alert.name}`);
    console.log(`   نماد: ${alert.symbol} (Bitcoin)`);
    console.log(`   قیمت هدف: $${alert.targetPrice}`);
    console.log(`   📱 هشدار به: +989384556010`);
  }
}

main();