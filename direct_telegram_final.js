#!/usr/bin/env node

const BOT_TOKEN = "7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA";
const CHAT_ID = "104595348";

async function sendFinalMessage() {
  const message = `🎉 سیستم تایتان کامل آماده است!

✅ راه‌اندازی موفق:
• Telegram Bot: @GoldDollarPrediction_bot
• Chat ID: ${CHAT_ID}
• شماره: +989384556010
• API: عملیاتی

🚀 امکانات آماده:
• هشدار قیمت Real-time
• نظارت بازارهای مختلف
• پیام‌رسانی فوری فارسی

📊 نحوه استفاده:
1️⃣ به داشبورد بروید
2️⃣ وارد بخش "هشدارها" شوید  
3️⃣ Alert جدید ایجاد کنید
4️⃣ هشدارها را در همین چت دریافت کنید

💡 نمونه Alert:
• نماد: BTCUSDT
• شرط: بالای $50000
• کانال: Telegram ✅

⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

🔥 سپهر جان، سیستم آماده استفاده است!`;

  try {
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
      console.log("🎉 پیام نهایی با موفقیت ارسال شد!");
      console.log(`   Message ID: ${data.result.message_id}`);
      console.log(`   Chat ID: ${CHAT_ID}`);
      console.log(`   زمان: ${new Date().toLocaleString('fa-IR')}`);
      
      return true;
    } else {
      console.error("❌ خطا در ارسال:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ خطا:", error.message);
    return false;
  }
}

async function main() {
  console.log("📱 ارسال پیام نهایی راه‌اندازی\n");
  
  const success = await sendFinalMessage();
  
  if (success) {
    console.log("\n✅ راه‌اندازی کامل!");
    console.log("📱 پیام را در تلگرام چک کنید");
    console.log("🎯 سیستم آماده دریافت Alert هاست");
  }
}

main();