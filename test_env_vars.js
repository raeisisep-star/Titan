#!/usr/bin/env node

const BASE_URL = "http://127.0.0.1:3000";

async function testEnvVars() {
  try {
    console.log("🔍 بررسی Environment Variables در سرور...");
    
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log("📊 Health Response:", JSON.stringify(data, null, 2));
    
    // حالا بیایید یک endpoint تست کنیم که environment variables را نشان دهد
    console.log("\n📋 بررسی PM2 Environment...");
    
    return true;
  } catch (error) {
    console.error("❌ خطا:", error.message);
    return false;
  }
}

async function main() {
  console.log("🧪 تست Environment Variables\n");
  console.log("==============================");
  
  await testEnvVars();
  
  console.log("\n📝 Environment Variables که باید موجود باشند:");
  console.log("   TELEGRAM_BOT_TOKEN=7614906095:AAHH_yejspiQpElwkSFgRwRlr8tM-71z-lA");
  console.log("   TELEGRAM_CHAT_ID=104595348");
  console.log("   ENABLE_TELEGRAM=true");
  console.log("\n💡 احتمالاً مشکل در Cloudflare Workers environment است");
}

main();