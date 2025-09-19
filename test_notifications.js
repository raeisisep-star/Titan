#!/usr/bin/env node

// Complete test script for TITAN alerts and notifications system

const BASE_URL = "http://127.0.0.1:3000";
let accessToken = null;

async function login() {
  try {
    console.log("🔐 Logging in to TITAN system...");
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@titan.com',
        password: 'admin123',
        rememberMe: false
      })
    });

    const data = await response.json();
    
    if (data.success) {
      accessToken = data.session.accessToken;
      console.log("✅ Login successful!");
      console.log(`   User: ${data.session.user.username}`);
      return true;
    } else {
      console.error("❌ Login failed:", data.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return false;
  }
}

async function testNotificationSettings() {
  try {
    console.log("\n📋 Checking notification settings...");
    
    const response = await fetch(`${BASE_URL}/api/alerts/settings`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Current notification settings:");
      console.log(`   Telegram enabled: ${data.settings.telegram?.enabled || false}`);
      console.log(`   Email enabled: ${data.settings.email?.enabled || false}`);
      console.log(`   SMS enabled: ${data.settings.sms?.enabled || false}`);
      
      if (data.settings.telegram?.chatId) {
        console.log(`   Telegram Chat ID: ${data.settings.telegram.chatId}`);
      }
      
      return data.settings;
    } else {
      console.error("❌ Failed to get settings:", data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Settings error:", error.message);
    return null;
  }
}

async function updateNotificationSettings(chatId) {
  try {
    console.log("\n⚙️  Updating notification settings...");
    
    const response = await fetch(`${BASE_URL}/api/alerts/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        telegram: {
          enabled: true,
          chatId: chatId
        },
        email: {
          enabled: false
        },
        sms: {
          enabled: false
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Settings updated successfully!");
      return true;
    } else {
      console.error("❌ Failed to update settings:", data.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Settings update error:", error.message);
    return false;
  }
}

async function testTelegramNotification() {
  try {
    console.log("\n🧪 Testing Telegram notification...");
    
    const response = await fetch(`${BASE_URL}/api/alerts/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        channels: ['telegram'],
        message: 'تست سیستم هشدارهای تایتان 🚀\n\n✅ اتصال با موفقیت برقرار شد!'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Telegram test successful!");
      console.log(`   Results:`, data.results);
      return true;
    } else {
      console.error("❌ Telegram test failed:", data.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Telegram test error:", error.message);
    return false;
  }
}

async function createTestAlert() {
  try {
    console.log("\n📈 Creating test price alert...");
    
    const response = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: "تست هشدار قیمت طلا",
        symbol: "XAUUSD",
        condition: "above",
        targetPrice: 2000,
        isActive: true,
        channels: ['telegram']
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Test alert created successfully!");
      console.log(`   Alert ID: ${data.alert.id}`);
      console.log(`   Symbol: ${data.alert.symbol}`);
      console.log(`   Target Price: $${data.alert.targetPrice}`);
      return data.alert;
    } else {
      console.error("❌ Failed to create alert:", data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Alert creation error:", error.message);
    return null;
  }
}

async function listAlerts() {
  try {
    console.log("\n📋 Listing current alerts...");
    
    const response = await fetch(`${BASE_URL}/api/alerts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Found ${data.alerts.length} alerts:`);
      data.alerts.forEach((alert, index) => {
        console.log(`   ${index + 1}. ${alert.name} (${alert.symbol})`);
        console.log(`      Target: $${alert.targetPrice} | Active: ${alert.isActive ? '✅' : '❌'}`);
      });
      return data.alerts;
    } else {
      console.error("❌ Failed to get alerts:", data.error);
      return [];
    }
  } catch (error) {
    console.error("❌ Alerts listing error:", error.message);
    return [];
  }
}

async function main() {
  console.log("🚀 TITAN Alerts & Notifications Test\n");
  console.log("==================================");
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("❌ Cannot continue without authentication.");
    process.exit(1);
  }
  
  // Step 2: Check current settings
  const settings = await testNotificationSettings();
  
  // Step 3: Get Chat ID (if needed)
  const chatIdFromEnv = process.env.TELEGRAM_CHAT_ID || "PENDING_SETUP";
  console.log(`\n📱 Telegram Chat ID status: ${chatIdFromEnv}`);
  
  if (chatIdFromEnv === "PENDING_SETUP" || chatIdFromEnv === "PENDING_SETUP") {
    console.log("\n⚠️  Chat ID not configured. Please:");
    console.log("   1. Open Telegram and search for: @GoldDollarPrediction_bot");
    console.log("   2. Send a message like 'سلام' to the bot");
    console.log("   3. Run: node get_chat_id.js");
    console.log("   4. Update TELEGRAM_CHAT_ID in .dev.vars file");
    console.log("   5. Restart the server and run this test again");
    process.exit(0);
  }
  
  // Step 4: Update settings with Chat ID
  await updateNotificationSettings(chatIdFromEnv);
  
  // Step 5: Test notification
  await testTelegramNotification();
  
  // Step 6: Create test alert
  await createTestAlert();
  
  // Step 7: List alerts
  await listAlerts();
  
  console.log("\n🎉 Test completed! Check your Telegram for notifications.");
}

main().catch(console.error);