#!/usr/bin/env node

// Script to get Chat ID for Telegram bot
// The user needs to send a message to the bot first, then we can get their chat ID

const BOT_TOKEN = "7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA";

async function getBotInfo() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log("✅ Bot Information:");
      console.log(`   Bot Name: ${data.result.first_name}`);
      console.log(`   Bot Username: @${data.result.username}`);
      console.log(`   Bot ID: ${data.result.id}`);
      console.log("\n📱 To get your Chat ID:");
      console.log(`   1. Open Telegram and search for: @${data.result.username}`);
      console.log(`   2. Start a chat and send any message (like "سلام")`);
      console.log(`   3. Run this script again to see your Chat ID`);
      return data.result.username;
    } else {
      console.error("❌ Bot token is invalid:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error checking bot:", error.message);
    return null;
  }
}

async function getUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      console.log("\n📬 Recent Messages:");
      data.result.forEach((update, index) => {
        const message = update.message;
        if (message) {
          console.log(`\n--- Message ${index + 1} ---`);
          console.log(`   Chat ID: ${message.chat.id}`);
          console.log(`   From: ${message.from.first_name || 'Unknown'} (@${message.from.username || 'no_username'})`);
          console.log(`   Phone: ${message.from.phone_number || 'Not shared'}`);
          console.log(`   Text: ${message.text || 'No text'}`);
          console.log(`   Date: ${new Date(message.date * 1000).toLocaleString()}`);
        }
      });
      
      // Get the most recent chat ID
      const lastMessage = data.result[data.result.length - 1];
      if (lastMessage.message) {
        const chatId = lastMessage.message.chat.id;
        console.log(`\n🎯 Most Recent Chat ID: ${chatId}`);
        console.log(`\n📝 Add this to your .dev.vars file:`);
        console.log(`   TELEGRAM_CHAT_ID="${chatId}"`);
        return chatId;
      }
    } else {
      console.log("\n📭 No messages found. Please send a message to the bot first.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting updates:", error.message);
    return null;
  }
}

async function sendTestMessage(chatId) {
  try {
    const message = `🚀 تست اتصال تایتان

سیستم هشدارهای تایتان با موفقیت راه‌اندازی شد!

📊 امکانات:
• هشدار قیمت
• پیام‌رسانی فوری
• نظارت بازار

⏰ زمان: ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`;

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
      console.log("\n✅ Test message sent successfully!");
      return true;
    } else {
      console.error("❌ Failed to send test message:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending test message:", error.message);
    return false;
  }
}

async function main() {
  console.log("🤖 Telegram Bot Chat ID Finder\n");
  
  const botUsername = await getBotInfo();
  if (!botUsername) {
    console.log("❌ Cannot continue without valid bot token.");
    process.exit(1);
  }
  
  const chatId = await getUpdates();
  
  if (chatId) {
    console.log("\n🧪 Sending test message...");
    await sendTestMessage(chatId);
  }
}

main().catch(console.error);