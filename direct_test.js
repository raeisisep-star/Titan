#!/usr/bin/env node

const BOT_TOKEN = "7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA";
const CHAT_ID = "104595348";

async function sendTestMessage() {
  const message = `🚀 سلام سپهر! تست سیستم تایتان

✅ Chat ID: ${CHAT_ID}
✅ Bot Token: فعال
✅ اتصال: موفق

📊 سیستم هشدارهای تایتان آماده است!
📱 شماره شما: +989384556010
⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}

🎯 می‌تونید الان از داشبورد تایتان alert تنظیم کنید!`;

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
      console.log("✅ پیام تست مستقیم با موفقیت ارسال شد!");
      console.log(`   Message ID: ${data.result.message_id}`);
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

sendTestMessage();