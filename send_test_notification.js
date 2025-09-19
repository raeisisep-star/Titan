#!/usr/bin/env node

// Direct test notification sender for Telegram
const BOT_TOKEN = "7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA";

async function findChatIdByPhone() {
  try {
    console.log("🔍 جستجوی Chat ID برای شماره +989384556010...");
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      console.log("\n📬 پیام‌های اخیر:");
      
      for (const update of data.result) {
        if (update.message) {
          const message = update.message;
          const from = message.from;
          
          console.log(`\n--- پیام جدید ---`);
          console.log(`Chat ID: ${message.chat.id}`);
          console.log(`نام: ${from.first_name || 'نامشخص'}`);
          console.log(`نام کاربری: @${from.username || 'ندارد'}`);
          console.log(`شماره تلفن: ${from.phone_number || 'به اشتراک گذاشته نشده'}`);
          console.log(`متن پیام: ${message.text || 'متن ندارد'}`);
          console.log(`تاریخ: ${new Date(message.date * 1000).toLocaleString('fa-IR')}`);
          
          // اگر شماره تلفن موجود باشد و مطابقت داشته باشد
          if (from.phone_number && from.phone_number.includes('9384556010')) {
            console.log(`\n🎯 Chat ID پیدا شد برای شماره ${from.phone_number}: ${message.chat.id}`);
            return message.chat.id;
          }
        }
      }
      
      // اگر شماره تلفن پیدا نشد، آخرین chat ID را برمی‌گردانیم
      const lastMessage = data.result[data.result.length - 1];
      if (lastMessage.message) {
        console.log(`\n⚠️ شماره تلفن مطابقت نداشت، از آخرین Chat ID استفاده می‌کنیم: ${lastMessage.message.chat.id}`);
        return lastMessage.message.chat.id;
      }
    } else {
      console.log("\n📭 هیچ پیامی پیدا نشد.");
      console.log("\n📱 لطفاً:");
      console.log("1. به تلگرام بروید");
      console.log("2. @GoldDollarPrediction_bot را جستجو کنید");
      console.log("3. یک پیام ارسال کنید (مثل 'سلام')");
      console.log("4. دوباره این script را اجرا کنید");
      return null;
    }
  } catch (error) {
    console.error("❌ خطا در دریافت پیام‌ها:", error.message);
    return null;
  }
}

async function sendDirectTelegramMessage(chatId, message) {
  try {
    console.log(`\n📤 ارسال پیام به Chat ID: ${chatId}...`);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log("✅ پیام با موفقیت ارسال شد!");
      console.log(`   Message ID: ${data.result.message_id}`);
      console.log(`   زمان ارسال: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`);
      return true;
    } else {
      console.error("❌ خطا در ارسال پیام:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ خطا در ارسال:", error.message);
    return false;
  }
}

async function testTitanNotificationAPI(chatId) {
  try {
    console.log("\n🔧 تست API سیستم تایتان...");
    
    // ابتدا لاگین کنیم
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
    
    if (!loginData.success) {
      console.error("❌ خطا در لاگین:", loginData.error);
      return false;
    }
    
    const accessToken = loginData.session.accessToken;
    console.log("✅ لاگین موفق به سیستم تایتان");
    
    // حالا notification تست ارسال کنیم
    const notificationResponse = await fetch("http://127.0.0.1:3000/api/alerts/test-notification", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: `🚀 تست سیستم هشدارهای تایتان

✅ اتصال موفق با Telegram Bot
📱 Chat ID: ${chatId}
⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

🎯 سیستم آماده دریافت هشدارهای بازار است!`,
        customChatId: chatId
      })
    });

    const notificationData = await notificationResponse.json();
    
    if (notificationResponse.ok) {
      console.log("✅ تست API تایتان موفق!");
      console.log(`   نتایج:`, notificationData.results);
      return true;
    } else {
      console.error("❌ خطا در API تایتان:", notificationData.error);
      return false;
    }
  } catch (error) {
    console.error("❌ خطا در تست API:", error.message);
    return false;
  }
}

async function main() {
  console.log("🤖 تست ارسال Notification تلگرام تایتان");
  console.log("=========================================\n");
  
  // مرحله 1: پیدا کردن Chat ID
  const chatId = await findChatIdByPhone();
  
  if (!chatId) {
    console.log("\n❌ نتونستیم Chat ID پیدا کنیم.");
    process.exit(1);
  }
  
  // مرحله 2: ارسال پیام مستقیم برای تست
  const testMessage = `🚀 سلام از سیستم تایتان!

این پیام تستی است که نشان می‌دهد:
✅ Telegram Bot فعال است
✅ Chat ID صحیح است: ${chatId}
✅ ارسال پیام کار می‌کند

📊 سیستم هشدارهای تایتان آماده است!
⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`;
  
  const directSuccess = await sendDirectTelegramMessage(chatId, testMessage);
  
  if (directSuccess) {
    // مرحله 3: تست API سیستم تایتان
    await testTitanNotificationAPI(chatId);
    
    console.log("\n🎉 تست کامل شد!");
    console.log("📱 پیام‌های تست را در تلگرام چک کنید.");
    
    // مرحله 4: به‌روزرسانی فایل .dev.vars
    console.log("\n📝 برای استفاده دائمی، Chat ID را در .dev.vars قرار دهید:");
    console.log(`TELEGRAM_CHAT_ID="${chatId}"`);
  }
}

main().catch(console.error);